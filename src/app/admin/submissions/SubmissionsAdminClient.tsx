'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Box, Typography, Tabs, Tab, Stack, Chip, Button,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, CircularProgress, Snackbar, Divider, ToggleButtonGroup,
  ToggleButton, IconButton, Collapse,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BlockIcon from '@mui/icons-material/Block';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import {
  getPendingSubmissions, getAllSubmissions,
  getPendingCorrections, getAllCorrections,
  approveSubmission, rejectSubmission,
  approveCorrection, rejectCorrection,
  getPendingRemovalRequests, getAllRemovalRequests,
  resolveRemovalRequest,
  deleteSubmission, deleteCorrection, deleteRemovalRequest,
} from '@/lib/communityService';
import { markSiteVerified, deleteDiveSite, getDiveSiteVerified } from '@/lib/diveSiteService';
import { SiteSubmission, SiteCorrection } from '@/types/admin';

const CoordinatePickerMap = dynamic(() => import('@/components/CoordinatePickerMap'), { ssr: false });

// ── helpers ──────────────────────────────────────────────────────────────────
function statusColor(s: string) {
  return s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'warning';
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90, flexShrink: 0, pt: 0.1 }}>
        {label}
      </Typography>
      <Typography variant="caption" fontWeight={500}>{value}</Typography>
    </Stack>
  );
}

// ── Reject Dialog ─────────────────────────────────────────────────────────────
function RejectDialog({ open, onClose, onConfirm, loading }: {
  open: boolean; onClose: () => void; onConfirm: (r: string) => void; loading: boolean;
}) {
  const [reason, setReason] = useState('');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reject — add a reason?</DialogTitle>
      <DialogContent>
        <TextField label="Reason (optional)" fullWidth multiline rows={2} size="small"
          value={reason} onChange={(e) => setReason(e.target.value)} sx={{ mt: 1 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={() => onConfirm(reason)} color="error" variant="contained" disabled={loading}
          startIcon={loading ? <CircularProgress size={14} /> : <CancelIcon />}>
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────
function DeleteDialog({ open, onClose, onConfirm, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; loading: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete this request?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          This removes the <strong>request</strong> from the queue — the dive site itself is not affected.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}
          startIcon={loading ? <CircularProgress size={14} /> : <DeleteOutlineIcon />}>
          Delete request
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function RemoveSiteDialog({ open, onClose, onConfirm, siteName, loading }: {
  open: boolean; onClose: () => void; onConfirm: () => void; siteName: string; loading: boolean;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Remove site from directory?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          This will permanently <strong>delete "{siteName}"</strong> from the dive site directory and resolve this request. This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={loading}
          startIcon={loading ? <CircularProgress size={14} /> : <BlockIcon />}>
          Delete site
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Action Bar ────────────────────────────────────────────────────────────────
function ActionBar({ actions }: { actions: React.ReactNode[] }) {
  return (
    <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} pt={1.5} borderTop="1px solid" sx={{ borderColor: 'divider' }}>
      {actions}
    </Stack>
  );
}

// ── Submission Card ───────────────────────────────────────────────────────────
function SubmissionCard({ sub, adminUid, onRefresh }: { sub: SiteSubmission; adminUid: string; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');

  const act = async (fn: () => Promise<void>, msg: string) => {
    setLoading(true);
    try { await fn(); setSnack(msg); onRefresh(); }
    catch (e) { setSnack(`Error: ${e instanceof Error ? e.message : 'Unknown'}`); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 1.5 }}>
      {/* Header */}
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} mb={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700} sx={{ fontSize: '0.95rem' }} noWrap>{sub.name}</Typography>
          <Typography variant="caption" color="text.secondary">{sub.location}, {sub.country} · {sub.submittedAt.toLocaleDateString()}</Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
          <Chip label={sub.status} size="small" color={statusColor(sub.status)} />
          <IconButton size="small" onClick={() => setExpanded(v => !v)} aria-label="Expand">
            <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s', fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Stack>

      <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.75} mb={1.5}>
        <Chip label={sub.waterType} size="small" variant="outlined" />
        <Chip label={`↓ ${sub.maxDepth}m`} size="small" variant="outlined" />
        <Chip label={sub.submitterEmail} size="small" variant="outlined" sx={{ maxWidth: 200 }} />
      </Stack>

      <Collapse in={expanded} unmountOnExit>
        <Box sx={{ bgcolor: '#f9fafb', borderRadius: 1.5, p: 1.5, mb: 1.5 }}>
          <Stack spacing={0.5} mb={1.5}>
            <Field label="Visibility" value={`${sub.visibility.min}–${sub.visibility.max}m`} />
            <Field label="Best seasons" value={sub.bestSeasons.join(', ') || '—'} />
          </Stack>
          {sub.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.5 }}>{sub.description}</Typography>}
          {sub.submitterNote && <Alert severity="info" sx={{ mb: 1.5, py: 0.5 }}>{sub.submitterNote}</Alert>}
          {sub.rejectionReason && <Alert severity="error" sx={{ py: 0.5 }}>{sub.rejectionReason}</Alert>}
          {sub.coordinates.lat !== 0 && (
            <Box sx={{ height: 180, borderRadius: 1, overflow: 'hidden', mt: 1.5 }}>
              <CoordinatePickerMap position={sub.coordinates} onChange={() => {}} />
            </Box>
          )}
        </Box>
      </Collapse>

      <ActionBar actions={[
        ...(sub.status === 'pending' ? [
          <Button key="approve" size="small" variant="contained" color="success"
            startIcon={loading ? <CircularProgress size={13} /> : <CheckCircleIcon />}
            onClick={() => act(() => approveSubmission(sub.id, adminUid).then(() => {}), `✅ Created: ${sub.name}`)}
            disabled={loading}>
            Approve
          </Button>,
          <Button key="reject" size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
            onClick={() => setRejectOpen(true)} disabled={loading}>
            Reject
          </Button>,
        ] : []),
        ...(sub.status === 'approved' && sub.createdSiteId ? [
          <Button key="view" size="small" component={Link} href={`/dive-sites/${sub.createdSiteId}`} target="_blank"
            startIcon={<OpenInNewIcon />}>
            View Site
          </Button>,
        ] : []),
        <Button key="delete" size="small" variant="text" color="error" startIcon={<DeleteOutlineIcon />}
          onClick={() => setDeleteOpen(true)} disabled={loading} sx={{ ml: 'auto' }}>
          Delete
        </Button>,
      ]} />

      <RejectDialog open={rejectOpen} onClose={() => setRejectOpen(false)} loading={loading}
        onConfirm={(r) => act(() => rejectSubmission(sub.id, adminUid, r), '❌ Rejected')} />
      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} loading={loading}
        onConfirm={() => act(() => deleteSubmission(sub.id), '🗑 Deleted')} />
      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}

// ── Correction Card ───────────────────────────────────────────────────────────
function CorrectionCard({ cor, adminUid, onRefresh }: { cor: SiteCorrection; adminUid: string; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [siteVerified, setSiteVerified] = useState(false);
  const [snack, setSnack] = useState('');
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    getDiveSiteVerified(cor.siteId).then((v) => { if (mounted.current) setSiteVerified(v); });
    return () => { mounted.current = false; };
  }, [cor.siteId]);

  const act = async (fn: () => Promise<void>, msg: string) => {
    setLoading(true);
    try { await fn(); setSnack(msg); onRefresh(); }
    catch (e) { setSnack(`Error: ${e instanceof Error ? e.message : 'Unknown'}`); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await markSiteVerified(cor.siteId, true);
      setSiteVerified(true);
      setSnack(`✅ ${cor.siteName} marked as verified`);
    } catch (e) {
      setSnack(`Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const fieldList = Object.keys(cor.fields).join(', ');

  return (
    <Box sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 1.5 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} mb={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} mb={0.25}>
            <Typography
              component={Link} href={`/dive-sites/${cor.siteSlug}`} target="_blank"
              fontWeight={700} sx={{ fontSize: '0.95rem', color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              {cor.siteName}
            </Typography>
            <OpenInNewIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Fields: <strong>{fieldList}</strong> · {cor.submittedAt.toLocaleDateString()}
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
          <Chip label={cor.status} size="small" color={statusColor(cor.status)} />
          <IconButton size="small" onClick={() => setExpanded(v => !v)} aria-label="Expand">
            <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s', fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Stack>

      <Chip label={cor.submitterEmail} size="small" variant="outlined" sx={{ maxWidth: 240, mb: 1.5 }} />

      <Collapse in={expanded} unmountOnExit>
        <Box sx={{ bgcolor: '#f9fafb', borderRadius: 1.5, p: 1.5, mb: 1.5 }}>
          <Stack spacing={0.75}>
            {Object.entries(cor.fields).map(([key, { current, suggested }]) => (
              <Stack key={key} direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 2 }} alignItems={{ sm: 'center' }}>
                <Typography variant="caption" fontWeight={700} sx={{ textTransform: 'capitalize', minWidth: 100 }}>{key}</Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip label={String(current)} size="small" sx={{ bgcolor: '#fee2e2', color: '#991b1b', fontSize: '0.7rem' }} />
                  <Typography variant="caption" color="text.disabled">→</Typography>
                  <Chip label={String(suggested)} size="small" sx={{ bgcolor: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 700 }} />
                </Stack>
              </Stack>
            ))}
          </Stack>
          {cor.correctionNote && <Alert severity="info" sx={{ mt: 1.5, py: 0.5 }}>{cor.correctionNote}</Alert>}
          {cor.rejectionReason && <Alert severity="error" sx={{ mt: 1, py: 0.5 }}>{cor.rejectionReason}</Alert>}
        </Box>
      </Collapse>

      <ActionBar actions={[
        ...(cor.status === 'pending' ? [
          <Button key="apply" size="small" variant="contained" color="success"
            startIcon={loading ? <CircularProgress size={13} /> : <CheckCircleIcon />}
            onClick={() => act(() => approveCorrection(cor.id, adminUid), `✅ Applied to ${cor.siteName}`)}
            disabled={loading}>
            Apply
          </Button>,
          <Button key="reject" size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
            onClick={() => setRejectOpen(true)} disabled={loading}>
            Reject
          </Button>,
        ] : []),
        siteVerified
          ? <Chip key="verified" label="Site verified" size="small" color="success" icon={<VerifiedIcon />}
              sx={{ fontWeight: 700 }} />
          : <Button key="verify" size="small" variant="outlined" color="success" startIcon={<VerifiedIcon />}
              onClick={handleVerify} disabled={loading}>
              Verify site
            </Button>,
        <Button key="edit" size="small" variant="outlined" startIcon={<EditIcon />}
          component={Link} href={`/admin/dive-sites?edit=${cor.siteId}`}>
          Edit site
        </Button>,
        <Button key="delete" size="small" variant="text" color="error" startIcon={<DeleteOutlineIcon />}
          onClick={() => setDeleteOpen(true)} disabled={loading} sx={{ ml: 'auto' }}>
          Delete
        </Button>,
      ]} />

      <RejectDialog open={rejectOpen} onClose={() => setRejectOpen(false)} loading={loading}
        onConfirm={(r) => act(() => rejectCorrection(cor.id, adminUid, r), '❌ Rejected')} />
      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} loading={loading}
        onConfirm={() => act(() => deleteCorrection(cor.id), '🗑 Deleted')} />
      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}

// ── Removal Card ──────────────────────────────────────────────────────────────
function RemovalCard({ req, adminUid, onRefresh }: { req: Record<string, unknown>; adminUid: string; onRefresh: () => void }) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removeSiteOpen, setRemoveSiteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [siteVerified, setSiteVerified] = useState(false);
  const [snack, setSnack] = useState('');
  const siteId = req.siteId as string;
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    getDiveSiteVerified(siteId).then((v) => { if (mounted.current) setSiteVerified(v); });
    return () => { mounted.current = false; };
  }, [siteId]);

  const act = async (fn: () => Promise<void>, msg: string) => {
    setLoading(true);
    try { await fn(); setSnack(msg); onRefresh(); }
    catch (e) { setSnack(`Error: ${e instanceof Error ? e.message : 'Unknown'}`); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      await markSiteVerified(req.siteId as string, true);
      setSiteVerified(true);
      setSnack(`✅ ${req.siteName as string} marked as verified`);
    } catch (e) {
      setSnack(`Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const reasons = (req.reasons as string[] | undefined) ?? [];
  const siteSlug = req.siteSlug as string;
  const siteName = req.siteName as string;
  const note = req.note as string | undefined;
  const email = req.submitterEmail as string;
  const submitted = req.submittedAt instanceof Date ? req.submittedAt.toLocaleDateString() : '—';

  return (
    <Box sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, mb: 1.5 }}>
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1} mb={1}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={0.75} mb={0.25}>
            <Typography
              component={Link} href={`/dive-sites/${siteSlug}`} target="_blank"
              fontWeight={700} sx={{ fontSize: '0.95rem', color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              {siteName}
            </Typography>
            <OpenInNewIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
          </Stack>
          <Typography variant="caption" color="text.secondary">{email} · {submitted}</Typography>
        </Box>
        <Chip label={req.status as string} size="small" color={statusColor(req.status as string)} sx={{ flexShrink: 0 }} />
      </Stack>

      <Stack direction="row" flexWrap="wrap" useFlexGap gap={0.5} mb={note ? 1 : 1.5}>
        {reasons.map((r) => (
          <Chip key={r} label={r.replace(/_/g, ' ')} size="small"
            sx={{ bgcolor: '#fff1f2', color: '#be123c', border: '1px solid #fecdd3', fontSize: '0.72rem' }} />
        ))}
      </Stack>

      {note && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1.5, lineHeight: 1.5 }}>
          "{note}"
        </Typography>
      )}

      <ActionBar actions={[
        ...(req.status === 'pending' ? [
          <Button key="remove" size="small" variant="contained" color="error" startIcon={<BlockIcon />}
            onClick={() => setRemoveSiteOpen(true)}
            disabled={loading}>
            Remove site
          </Button>,
          <Button key="dismiss" size="small" variant="outlined" color="inherit" startIcon={<CancelIcon />}
            onClick={() => act(() => resolveRemovalRequest(req.id as string, 'rejected', adminUid), '✓ Dismissed')}
            disabled={loading}>
            Dismiss
          </Button>,
        ] : []),
        siteVerified
          ? <Chip key="verified" label="Site verified" size="small" color="success" icon={<VerifiedIcon />}
              sx={{ fontWeight: 700 }} />
          : <Button key="verify" size="small" variant="outlined" color="success" startIcon={<VerifiedIcon />}
              onClick={handleVerify} disabled={loading}>
              Verify site
            </Button>,
        <Button key="edit" size="small" variant="outlined" startIcon={<EditIcon />}
          component={Link} href={`/admin/dive-sites?edit=${siteId}`}>
          Edit site
        </Button>,
        <Button key="delete" size="small" variant="text" color="error" startIcon={<DeleteOutlineIcon />}
          onClick={() => setDeleteOpen(true)} disabled={loading} sx={{ ml: 'auto' }}>
          Delete
        </Button>,
      ]} />

      <DeleteDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} loading={loading}
        onConfirm={() => act(() => deleteRemovalRequest(req.id as string), '🗑 Request deleted')} />
      <RemoveSiteDialog
        open={removeSiteOpen}
        onClose={() => setRemoveSiteOpen(false)}
        siteName={siteName}
        loading={loading}
        onConfirm={() => act(
          async () => {
            await deleteDiveSite(siteId);
            await resolveRemovalRequest(req.id as string, 'approved', adminUid);
          },
          `🗑 ${siteName} deleted from directory`,
        )}
      />
      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')} message={snack} />
    </Box>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SubmissionsAdminClient() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState(0);
  const [submissions, setSubmissions] = useState<SiteSubmission[]>([]);
  const [corrections, setCorrections] = useState<SiteCorrection[]>([]);
  const [removals, setRemovals] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, cors, rems] = await Promise.all([
        filter === 'pending' ? getPendingSubmissions() : getAllSubmissions(),
        filter === 'pending' ? getPendingCorrections() : getAllCorrections(),
        filter === 'pending' ? getPendingRemovalRequests() : getAllRemovalRequests(),
      ]);
      setSubmissions(subs);
      setCorrections(cors);
      setRemovals(rems);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!authLoading && user) load();
  }, [authLoading, user, load]);

  const adminUid = user?.uid ?? '';
  const pendingSubs = submissions.filter((s) => s.status === 'pending').length;
  const pendingCors = corrections.filter((c) => c.status === 'pending').length;
  const pendingRems = removals.filter((r) => r.status === 'pending').length;

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5} mb={3}>
        <Typography variant="h5" fontWeight={700}>Community Queue</Typography>
        <ToggleButtonGroup value={filter} exclusive size="small"
          onChange={(_, v) => { if (v) setFilter(v); }}>
          <ToggleButton value="pending">Pending</ToggleButton>
          <ToggleButton value="all">All</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
        {[
          { label: 'New Sites', count: pendingSubs, color: 'warning' as const },
          { label: 'Corrections', count: pendingCors, color: 'warning' as const },
          { label: 'Removals', count: pendingRems, color: 'error' as const },
        ].map(({ label, count, color }) => (
          <Tab key={label} label={
            <Stack direction="row" spacing={0.75} alignItems="center">
              <span>{label}</span>
              {count > 0 && <Chip label={count} size="small" color={color} sx={{ height: 18, fontSize: '0.68rem' }} />}
            </Stack>
          } />
        ))}
      </Tabs>

      <Divider sx={{ mb: 2.5 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {tab === 0 && (
            submissions.length === 0
              ? <Alert severity="info">No {filter === 'pending' ? 'pending' : ''} site submissions.</Alert>
              : submissions.map((sub) => <SubmissionCard key={sub.id} sub={sub} adminUid={adminUid} onRefresh={load} />)
          )}
          {tab === 1 && (
            corrections.length === 0
              ? <Alert severity="info">No {filter === 'pending' ? 'pending' : ''} corrections.</Alert>
              : corrections.map((cor) => <CorrectionCard key={cor.id} cor={cor} adminUid={adminUid} onRefresh={load} />)
          )}
          {tab === 2 && (
            removals.length === 0
              ? <Alert severity="info">No {filter === 'pending' ? 'pending' : ''} removal requests.</Alert>
              : removals.map((req) => <RemovalCard key={req.id as string} req={req} adminUid={adminUid} onRefresh={load} />)
          )}
        </>
      )}
    </Box>
  );
}
