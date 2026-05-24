'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Alert,
  Checkbox,
  Toolbar,
  Stack,
  Button,
  IconButton,
  Tooltip,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EditIcon from '@mui/icons-material/Edit';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getAllDiveSites } from '@/lib/diveSiteService';
import { DiveSite } from '@/types/admin';

type StatusTag = 'KEEP' | 'REVIEW_NEGATIVE' | 'NO_DATA';
type FilterValue = 'all' | StatusTag | 'unverified';

const TAG_STYLES: Record<StatusTag, { bg: string; color: string; label: string }> = {
  KEEP:             { bg: '#dcfce7', color: '#166534', label: '✅ Keep' },
  REVIEW_NEGATIVE:  { bg: '#fef9c3', color: '#854d0e', label: '⚠️ Review' },
  NO_DATA:          { bg: '#f1f5f9', color: '#475569', label: '❔ No Data' },
};

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all',             label: 'All' },
  { value: 'KEEP',            label: '✅ Keep' },
  { value: 'REVIEW_NEGATIVE', label: '⚠️ Review Negative' },
  { value: 'NO_DATA',         label: '❔ No Data' },
  { value: 'unverified',      label: 'Not run yet' },
];

export default function GoogleVerificationPage() {
  const [sites, setSites] = useState<DiveSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkTag, setBulkTag] = useState<StatusTag>('KEEP');
  const [bulkWorking, setBulkWorking] = useState(false);

  const load = async () => {
    try {
      const data = await getAllDiveSites();
      setSites(data);
    } catch {
      setError('Failed to load dive sites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let result = sites;
    if (filter === 'unverified') result = result.filter((s) => !s.verification);
    else if (filter !== 'all') result = result.filter((s) => s.verification?.statusTag === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name?.toLowerCase().includes(q) || s.country?.toLowerCase().includes(q));
    }
    return result;
  }, [sites, filter, search]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: sites.length, unverified: 0, KEEP: 0, REVIEW_NEGATIVE: 0, NO_DATA: 0 };
    sites.forEach((s) => {
      if (!s.verification) c.unverified++;
      else c[s.verification.statusTag] = (c[s.verification.statusTag] ?? 0) + 1;
    });
    return c;
  }, [sites]);

  // Selection
  const allSelected = paginated.length > 0 && paginated.every((s) => selected.has(s.id));
  const someSelected = paginated.some((s) => selected.has(s.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => { const next = new Set(prev); paginated.forEach((s) => next.delete(s.id)); return next; });
    } else {
      setSelected((prev) => new Set([...prev, ...paginated.map((s) => s.id)]));
    }
  };

  const toggleOne = (id: string) =>
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  // Bulk update statusTag
  const applyBulkTag = async () => {
    const firestore = db;
    if (!firestore) return;
    setBulkWorking(true);
    try {
      await Promise.all(
        [...selected].map((id) =>
          updateDoc(doc(firestore, 'diveSites', id), {
            'verification.statusTag': bulkTag,
            'verification.reviewedAt': new Date().toISOString(),
          })
        )
      );
      setSelected(new Set());
      setBulkDialogOpen(false);
      await load();
    } catch {
      setError('Bulk update failed');
    } finally {
      setBulkWorking(false);
    }
  };

  const hasFilters = filter !== 'all' || search.trim() !== '';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Google Verification</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Results from the Places API script — review and override manually
          </Typography>
        </Box>
        {!loading && (
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="flex-end">
            {(['KEEP', 'REVIEW_NEGATIVE', 'NO_DATA'] as StatusTag[]).map((tag) => (
              <Chip key={tag} label={`${TAG_STYLES[tag].label} ${counts[tag]}`}
                size="small" sx={{ bgcolor: TAG_STYLES[tag].bg, color: TAG_STYLES[tag].color, fontWeight: 600 }} />
            ))}
            <Chip label={`Not run ${counts.unverified}`} size="small"
              sx={{ bgcolor: '#ede9fe', color: '#5b21b6', fontWeight: 600 }} />
          </Stack>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Filter bar */}
      <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
          <TextField
            size="small"
            placeholder="Search name or country…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ minWidth: 220 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={filter} onChange={(e) => { setFilter(e.target.value as FilterValue); setPage(0); }}>
              {FILTERS.map((f) => (
                <MenuItem key={f.value} value={f.value}>
                  {f.label} <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.8rem' }}>({counts[f.value] ?? 0})</Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {hasFilters && (
            <Tooltip title="Clear filters">
              <Button size="small" startIcon={<FilterListOffIcon />} onClick={() => { setFilter('all'); setSearch(''); setPage(0); }} color="inherit">
                Clear
              </Button>
            </Tooltip>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filtered.length}/{sites.length}{selected.size > 0 && ` · ${selected.size} selected`}
          </Typography>
        </Stack>
      </Paper>

      <Card sx={{ borderRadius: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: 0 }}>
          {/* Bulk toolbar */}
          {selected.size > 0 && (
            <Toolbar sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.08), borderBottom: '1px solid', borderColor: 'divider', gap: 1, minHeight: '48px !important' }}>
              <Typography fontWeight={600} sx={{ flex: 1 }}>{selected.size} selected</Typography>
              <Button size="small" variant="outlined"
                sx={{ bgcolor: '#dcfce7', color: '#166534', borderColor: '#86efac' }}
                onClick={() => { setBulkTag('KEEP'); setBulkDialogOpen(true); }}>
                Mark Keep
              </Button>
              <Button size="small" variant="outlined"
                sx={{ bgcolor: '#fef9c3', color: '#854d0e', borderColor: '#fde047' }}
                onClick={() => { setBulkTag('REVIEW_NEGATIVE'); setBulkDialogOpen(true); }}>
                Mark Review
              </Button>
              <Button size="small" variant="outlined"
                sx={{ bgcolor: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' }}
                onClick={() => { setBulkTag('NO_DATA'); setBulkDialogOpen(true); }}>
                Mark No Data
              </Button>
              <Button size="small" color="inherit" onClick={() => setSelected(new Set())}>
                Deselect
              </Button>
            </Toolbar>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                    <TableCell padding="checkbox">
                      <Checkbox size="small" indeterminate={someSelected} checked={allSelected} onChange={toggleAll} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Site Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>+Pos</TableCell>
                    <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>−Neg</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Reviewed</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Matched Place</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="text.secondary">No sites match the current filter.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((site) => {
                      const v = site.verification;
                      const style = v ? TAG_STYLES[v.statusTag] : { bg: '#ede9fe', color: '#5b21b6', label: 'Unverified' };
                      return (
                        <TableRow key={site.id} hover selected={selected.has(site.id)}>
                          <TableCell padding="checkbox" onClick={(e) => { e.stopPropagation(); toggleOne(site.id); }}>
                            <Checkbox size="small" checked={selected.has(site.id)} />
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={600} fontSize={14}>{site.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{site.location}</Typography>
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary' }}>{site.country || '—'}</TableCell>
                          <TableCell>
                            <Chip label={style.label} size="small"
                              sx={{ bgcolor: style.bg, color: style.color, fontWeight: 600, fontSize: '0.7rem' }} />
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', color: '#166534', fontWeight: 700 }}>
                            {v ? `+${v.positiveMatchCount}` : '—'}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', color: '#b91c1c', fontWeight: 700 }}>
                            {v ? `−${v.negativeMatchCount}` : '—'}
                          </TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {v ? new Date(v.reviewedAt).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.75rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {v?.matchedPlaceId ? (
                              <Tooltip title="Open in Google Maps">
                                <a
                                  href={`https://www.google.com/maps/place/?q=place_id:${v.matchedPlaceId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#0077be', textDecoration: 'none', fontWeight: 600 }}
                                >
                                  {v.matchedPlaceId}
                                </a>
                              </Tooltip>
                            ) : '—'}
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                              <Tooltip title="View public site">
                                <IconButton size="small" component="a" href={`/dive-sites/${site.slug}`} target="_blank">
                                  <OpenInNewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit in admin">
                                <IconButton size="small" component="a" href={`/admin/dive-sites?edit=${site.id}`}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[25, 50, 100, 200]}
          />
        </CardContent>
      </Card>

      {/* Bulk confirm dialog */}
      <Dialog open={bulkDialogOpen} onClose={() => setBulkDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Update {selected.size} sites?</DialogTitle>
        <DialogContent>
          <Typography>
            Set verification status to{' '}
            <Chip label={TAG_STYLES[bulkTag].label} size="small"
              sx={{ bgcolor: TAG_STYLES[bulkTag].bg, color: TAG_STYLES[bulkTag].color, fontWeight: 700, mx: 0.5 }} />
            {' '}for all {selected.size} selected sites.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialogOpen(false)} disabled={bulkWorking}>Cancel</Button>
          <Button variant="contained" onClick={applyBulkTag} disabled={bulkWorking}>
            {bulkWorking ? <CircularProgress size={20} /> : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
