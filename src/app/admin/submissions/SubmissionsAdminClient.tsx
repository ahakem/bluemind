'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Box, Typography, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Stack,
  Chip, Collapse, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, CircularProgress,
  Snackbar, Divider, ToggleButtonGroup, ToggleButton, Link as MuiLink,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useAuth } from '@/lib/AuthContext';
import {
  getPendingSubmissions, getAllSubmissions,
  getPendingCorrections, getAllCorrections,
  approveSubmission, rejectSubmission,
  approveCorrection, rejectCorrection,
} from '@/lib/communityService';
import { SiteSubmission, SiteCorrection } from '@/types/admin';

const CoordinatePickerMap = dynamic(() => import('@/components/CoordinatePickerMap'), { ssr: false });

// ── Reject Dialog ─────────────────────────────────────────────────────────────
function RejectDialog({
  open, onClose, onConfirm, loading,
}: { open: boolean; onClose: () => void; onConfirm: (reason: string) => void; loading: boolean }) {
  const [reason, setReason] = useState('');
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reject submission</DialogTitle>
      <DialogContent>
        <TextField
          label="Reason (optional)" fullWidth multiline rows={3} size="small"
          value={reason} onChange={(e) => setReason(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={() => onConfirm(reason)} color="error" variant="contained" disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}>
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Submission Row ─────────────────────────────────────────────────────────────
function SubmissionRow({
  sub, adminUid, onRefresh,
}: { sub: SiteSubmission; adminUid: string; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    try {
      const newId = await approveSubmission(sub.id, adminUid);
      setSnack(`✅ Site created: ${sub.name} (${newId})`);
      onRefresh();
    } catch (e) {
      setSnack(`Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    setLoading(true);
    try {
      await rejectSubmission(sub.id, adminUid, reason);
      setRejectOpen(false);
      onRefresh();
    } catch (e) {
      setSnack(`Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const statusColor = sub.status === 'approved' ? 'success' : sub.status === 'rejected' ? 'error' : 'warning';

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setExpanded((v) => !v)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{sub.submittedAt.toLocaleDateString()}</TableCell>
        <TableCell><Typography fontWeight={600}>{sub.name}</Typography></TableCell>
        <TableCell>{sub.location}, {sub.country}</TableCell>
        <TableCell sx={{ textTransform: 'capitalize' }}>{sub.waterType}</TableCell>
        <TableCell>{sub.maxDepth}m</TableCell>
        <TableCell>{sub.submitterEmail}</TableCell>
        <TableCell><Chip label={sub.status} size="small" color={statusColor} /></TableCell>
        <TableCell>
          {sub.status === 'pending' && (
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" color="success"
                startIcon={loading ? <CircularProgress size={14} /> : <CheckCircleIcon />}
                onClick={handleApprove} disabled={loading}>
                Approve
              </Button>
              <Button size="small" variant="outlined" color="error"
                startIcon={<CancelIcon />}
                onClick={() => setRejectOpen(true)} disabled={loading}>
                Reject
              </Button>
            </Stack>
          )}
          {sub.status === 'approved' && sub.createdSiteId && (
            <MuiLink href={`/dive-sites/${sub.createdSiteId}`} target="_blank" rel="noopener">
              <Button size="small" startIcon={<OpenInNewIcon />}>View Site</Button>
            </MuiLink>
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={9} sx={{ py: 0 }}>
          <Collapse in={expanded} unmountOnExit>
            <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1, mb: 1 }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {/* Details */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>Details</Typography>
                  <Stack spacing={0.5}>
                    {[
                      ['Difficulty', sub.difficulty],
                      ['Visibility', `${sub.visibility.min}–${sub.visibility.max} m`],
                      ['Best Seasons', sub.bestSeasons.join(', ') || '—'],
                    ].map(([k, v]) => (
                      <Stack key={k} direction="row" spacing={1}>
                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 100 }}>{k}</Typography>
                        <Typography variant="caption">{v}</Typography>
                      </Stack>
                    ))}
                  </Stack>

                  {sub.description && (
                    <Box mt={1.5}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Description</Typography>
                      <Typography variant="body2" mt={0.5}>{sub.description}</Typography>
                    </Box>
                  )}

                  {sub.highlights.length > 0 && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Highlights</Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.5} mt={0.5}>
                        {sub.highlights.map((h, i) => <Chip key={i} label={h} size="small" />)}
                      </Stack>
                    </Box>
                  )}

                  {sub.submitterNote && (
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>Submitter note</Typography>
                      <Typography variant="body2" mt={0.5} fontStyle="italic">{sub.submitterNote}</Typography>
                    </Box>
                  )}

                  {sub.rejectionReason && (
                    <Alert severity="error" sx={{ mt: 1 }}>Rejection reason: {sub.rejectionReason}</Alert>
                  )}
                </Box>

                {/* Map preview */}
                {sub.coordinates.lat !== 0 && (
                  <Box sx={{ width: { xs: '100%', md: 280 }, height: 200, borderRadius: 1, overflow: 'hidden' }}>
                    <CoordinatePickerMap
                      position={sub.coordinates}
                      onChange={() => {}}
                    />
                  </Box>
                )}
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <RejectDialog open={rejectOpen} onClose={() => setRejectOpen(false)}
        onConfirm={handleReject} loading={loading} />
      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}
        message={snack} />
    </>
  );
}

// ── Correction Row ─────────────────────────────────────────────────────────────
function CorrectionRow({
  cor, adminUid, onRefresh,
}: { cor: SiteCorrection; adminUid: string; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState('');

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveCorrection(cor.id, adminUid);
      setSnack(`✅ Correction applied to: ${cor.siteName}`);
      onRefresh();
    } catch (e) {
      setSnack(`Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    setLoading(true);
    try {
      await rejectCorrection(cor.id, adminUid, reason);
      setRejectOpen(false);
      onRefresh();
    } catch (e) {
      setSnack(`Error: ${e instanceof Error ? e.message : 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  const fieldList = Object.keys(cor.fields).join(', ');
  const statusColor = cor.status === 'approved' ? 'success' : cor.status === 'rejected' ? 'error' : 'warning';

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton size="small" onClick={() => setExpanded((v) => !v)}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{cor.submittedAt.toLocaleDateString()}</TableCell>
        <TableCell>
          <MuiLink href={`/dive-sites/${cor.siteSlug}`} target="_blank" rel="noopener" underline="hover">
            <Typography fontWeight={600}>{cor.siteName}</Typography>
          </MuiLink>
        </TableCell>
        <TableCell>
          <Typography variant="caption" color="text.secondary">{fieldList}</Typography>
        </TableCell>
        <TableCell>{cor.submitterEmail}</TableCell>
        <TableCell><Chip label={cor.status} size="small" color={statusColor} /></TableCell>
        <TableCell>
          {cor.status === 'pending' && (
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="contained" color="success"
                startIcon={loading ? <CircularProgress size={14} /> : <CheckCircleIcon />}
                onClick={handleApprove} disabled={loading}>
                Approve
              </Button>
              <Button size="small" variant="outlined" color="error"
                startIcon={<CancelIcon />}
                onClick={() => setRejectOpen(true)} disabled={loading}>
                Reject
              </Button>
            </Stack>
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={7} sx={{ py: 0 }}>
          <Collapse in={expanded} unmountOnExit>
            <Box sx={{ p: 2, bgcolor: '#f9fafb', borderRadius: 1, mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1}>Field Changes</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Field</TableCell>
                      <TableCell>Current Value</TableCell>
                      <TableCell>Suggested Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(cor.fields).map(([key, { current, suggested }]) => (
                      <TableRow key={key}>
                        <TableCell sx={{ fontWeight: 600, textTransform: 'capitalize' }}>{key}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{String(current)}</TableCell>
                        <TableCell sx={{ color: 'success.main', fontWeight: 600 }}>{String(suggested)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {cor.correctionNote && (
                <Box mt={1.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>Submitter note</Typography>
                  <Typography variant="body2" mt={0.5} fontStyle="italic">{cor.correctionNote}</Typography>
                </Box>
              )}

              {cor.rejectionReason && (
                <Alert severity="error" sx={{ mt: 1 }}>Rejection reason: {cor.rejectionReason}</Alert>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <RejectDialog open={rejectOpen} onClose={() => setRejectOpen(false)}
        onConfirm={handleReject} loading={loading} />
      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack('')}
        message={snack} />
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SubmissionsAdminClient() {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [submissions, setSubmissions] = useState<SiteSubmission[]>([]);
  const [corrections, setCorrections] = useState<SiteCorrection[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, cors] = await Promise.all([
        filter === 'pending' ? getPendingSubmissions() : getAllSubmissions(),
        filter === 'pending' ? getPendingCorrections() : getAllCorrections(),
      ]);
      setSubmissions(subs);
      setCorrections(cors);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const adminUid = user?.uid ?? '';

  const pendingSubs = submissions.filter((s) => s.status === 'pending').length;
  const pendingCors = corrections.filter((c) => c.status === 'pending').length;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Community Queue</Typography>
        <ToggleButtonGroup value={filter} exclusive size="small"
          onChange={(_, v) => { if (v) setFilter(v); }}>
          <ToggleButton value="pending">Pending only</ToggleButton>
          <ToggleButton value="all">Show all</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={
          <Stack direction="row" spacing={1} alignItems="center">
            <span>New Sites</span>
            {pendingSubs > 0 && (
              <Chip label={pendingSubs} size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
            )}
          </Stack>
        } />
        <Tab label={
          <Stack direction="row" spacing={1} alignItems="center">
            <span>Corrections</span>
            {pendingCors > 0 && (
              <Chip label={pendingCors} size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
            )}
          </Stack>
        } />
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* New Sites tab */}
          {tab === 0 && (
            submissions.length === 0 ? (
              <Alert severity="info">No {filter === 'pending' ? 'pending' : ''} site submissions.</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={48} />
                      <TableCell>Submitted</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Water</TableCell>
                      <TableCell>Depth</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {submissions.map((sub) => (
                      <SubmissionRow key={sub.id} sub={sub} adminUid={adminUid} onRefresh={load} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}

          {/* Corrections tab */}
          {tab === 1 && (
            corrections.length === 0 ? (
              <Alert severity="info">No {filter === 'pending' ? 'pending' : ''} corrections.</Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={48} />
                      <TableCell>Submitted</TableCell>
                      <TableCell>Site</TableCell>
                      <TableCell>Fields</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {corrections.map((cor) => (
                      <CorrectionRow key={cor.id} cor={cor} adminUid={adminUid} onRefresh={load} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
        </>
      )}
    </Box>
  );
}
