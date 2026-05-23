'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  CircularProgress,
  Alert,
  Tooltip,
  Switch,
  FormControlLabel,
  Checkbox,
  Toolbar,
  alpha,
  InputAdornment,
  TablePagination,
  Popover,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import CountryAutocomplete from '@/components/CountryAutocomplete';
import { lookupCountry, CountryType } from '@/data/countries';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedIcon from '@mui/icons-material/Verified';
import ArchiveIcon from '@mui/icons-material/Archive';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import PublicIcon from '@mui/icons-material/Public';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import SportsIcon from '@mui/icons-material/Sports';
import {
  getAllDiveSites,
  createDiveSite,
  updateDiveSite,
  deleteDiveSite,
  generateSlug,
  markSiteVerified,
  getSiteVerificationCounts,
} from '@/lib/diveSiteService';
import { DiveSite, DiveSiteDraft, WaterTempByMonth } from '@/types/admin';

const CoordinatePickerMap = dynamic(() => import('@/components/CoordinatePickerMap'), { ssr: false });

const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const EMPTY_DRAFT: DiveSiteDraft = {
  name: '',
  location: '',
  country: 'Netherlands',
  coordinates: { lat: 52.37, lng: 4.9 },
  waterType: 'lake',
  maxDepth: 20,
  description: '',
  highlights: [],
  facilities: [],
  tags: [],
  waterTemp: {},
  visibility: { min: 2, max: 6 },
  bestSeasons: [],
  photos: [],
  status: 'active',
  activities: [],
};

// ── Column visibility ────────────────────────────────────────────────────────

type ColId = 'country' | 'type' | 'depth' | 'score' | 'votes' | 'coords' | 'status';

const ALL_COLS: { id: ColId; label: string; defaultOn: boolean }[] = [
  { id: 'country', label: 'Country',     defaultOn: true  },
  { id: 'type',    label: 'Water Type',  defaultOn: true  },
  { id: 'depth',   label: 'Depth',       defaultOn: true  },
  { id: 'score',   label: 'Score',       defaultOn: true  },
  { id: 'votes',   label: 'Votes',       defaultOn: false },
  { id: 'coords',  label: 'Coordinates', defaultOn: false },
  { id: 'status',  label: 'Status',      defaultOn: true  },
];

const COLS_KEY = 'admin_dive_cols_v1';

function loadColPrefs(): Set<ColId> {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(COLS_KEY) : null;
    if (raw) return new Set(JSON.parse(raw) as ColId[]);
  } catch {}
  return new Set(ALL_COLS.filter((c) => c.defaultOn).map((c) => c.id));
}

// ── DDM formatter ────────────────────────────────────────────────────────────

function ddmLat(lat: number): string {
  const d = Math.floor(Math.abs(lat));
  const m = ((Math.abs(lat) - d) * 60).toFixed(3);
  return `${d} ${m} ${lat >= 0 ? 'N' : 'S'}`;
}

function ddmLng(lng: number): string {
  const d = Math.floor(Math.abs(lng));
  const m = ((Math.abs(lng) - d) * 60).toFixed(3);
  return `${d} ${m} ${lng >= 0 ? 'E' : 'W'}`;
}

function CoordPills({ lat, lng, active = false, onClick }: {
  lat: number; lng: number; active?: boolean; onClick?: () => void;
}) {
  return (
    <Stack
      direction="column"
      spacing={0.5}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      sx={{
        display: 'inline-flex',
        cursor: 'pointer',
        borderRadius: 1.5,
        outline: active ? '2px solid #0056b3' : '2px solid transparent',
        outlineOffset: 3,
        boxShadow: active ? '0 0 0 4px rgba(0,86,179,0.12)' : 'none',
        transition: 'outline 0.15s, box-shadow 0.15s',
        p: active ? 0.5 : 0,
      }}
    >
      <Box sx={{
        px: 1, py: active ? 0.6 : 0.4, borderRadius: 1,
        bgcolor: active ? '#0056b3' : '#e8f4fd',
        color: active ? '#fff' : '#0056b3',
        fontFamily: 'monospace', fontWeight: 700,
        fontSize: active ? '0.92rem' : '0.82rem',
        whiteSpace: 'nowrap', letterSpacing: '0.02em',
        transition: 'all 0.15s',
      }}>
        {ddmLat(lat)}
      </Box>
      <Box sx={{
        px: 1, py: active ? 0.6 : 0.4, borderRadius: 1,
        bgcolor: active ? '#1b7a4e' : '#e6f7f0',
        color: active ? '#fff' : '#1b7a4e',
        fontFamily: 'monospace', fontWeight: 700,
        fontSize: active ? '0.92rem' : '0.82rem',
        whiteSpace: 'nowrap', letterSpacing: '0.02em',
        transition: 'all 0.15s',
      }}>
        {ddmLng(lng)}
      </Box>
    </Stack>
  );
}

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminDiveSitesPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [sites, setSites] = useState<DiveSite[]>([]);
  const [verificationCounts, setVerificationCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<DiveSite | null>(null);
  const [focusedCoordId, setFocusedCoordId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DiveSiteDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DiveSite | null>(null);

  // Column visibility
  const [visibleCols, setVisibleCols] = useState<Set<ColId>>(loadColPrefs);
  const [colAnchorEl, setColAnchorEl] = useState<HTMLElement | null>(null);

  const show = (id: ColId) => visibleCols.has(id);

  const toggleCol = (id: ColId) => {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem(COLS_KEY, JSON.stringify([...next]));
      return next;
    });
  };

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilterAdmin, setCountryFilterAdmin] = useState<CountryType | null>(null);
  const [waterTypeFilterAdmin, setWaterTypeFilterAdmin] = useState<string>('all');
  const [relevanceFilter, setRelevanceFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'verified' | 'unverified' | null>(null);

  const filtered = sites.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.location.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (countryFilterAdmin && s.country !== countryFilterAdmin.label) return false;
    if (waterTypeFilterAdmin !== 'all' && s.waterType !== waterTypeFilterAdmin) return false;
    if (relevanceFilter === 'needs-review' && !s.needsReview) return false;
    if (relevanceFilter === 'scuba-only' && !s.scubaOnly) return false;
    if (relevanceFilter === 'depth-unknown' && !s.depthUnknown) return false;
    if (relevanceFilter === 'not-scored' && s.freediverScore !== undefined) return false;
    if (relevanceFilter === 'on-shore' && !s.coordinatesOnShore) return false;
    if (relevanceFilter === 'verified' && !s.verified) return false;
    if (relevanceFilter === 'has-votes' && !verificationCounts.get(s.id)) return false;
    if (verifiedFilter === 'verified' && !s.verified) return false;
    if (verifiedFilter === 'unverified' && s.verified) return false;
    return true;
  });

  const presentCountries = [...new Set(sites.map((s) => s.country).filter(Boolean))].sort();
  const hasFilters = search || statusFilter !== 'all' || countryFilterAdmin || waterTypeFilterAdmin !== 'all' || relevanceFilter !== 'all' || verifiedFilter !== null;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCountryFilterAdmin(null);
    setWaterTypeFilterAdmin('all');
    setRelevanceFilter('all');
    setVerifiedFilter(null);
    setPage(0);
  };

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  useEffect(() => { setPage(0); }, [search, statusFilter, countryFilterAdmin, waterTypeFilterAdmin, relevanceFilter]);
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Bulk state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [bulkCountry, setBulkCountry] = useState<{ code: string; label: string; phone: string } | null>(null);
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [bulkActivities, setBulkActivities] = useState<('line_diving' | 'snorkeling')[]>([]);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickerPos, setMapPickerPos] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

  const load = async () => {
    try {
      const [data, counts] = await Promise.all([getAllDiveSites(), getSiteVerificationCounts()]);
      setSites(data);
      setVerificationCounts(counts);
    } catch {
      setError('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Selection helpers
  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));
  const someSelected = filtered.some((s) => selected.has(s.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => { const next = new Set(prev); filtered.forEach((s) => next.delete(s.id)); return next; });
    } else {
      setSelected((prev) => new Set([...prev, ...filtered.map((s) => s.id)]));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  // Bulk actions
  const bulkUpdateStatus = async (status: DiveSite['status']) => {
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => updateDiveSite(id, { status })));
      setSelected(new Set());
      await load();
    } catch { setError('Bulk update failed'); } finally { setBulkWorking(false); }
  };

  const bulkDelete = async () => {
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => deleteDiveSite(id)));
      setSelected(new Set());
      setBulkDeleteConfirm(false);
      await load();
    } catch { setError('Bulk delete failed'); } finally { setBulkWorking(false); }
  };

  const bulkSetCountry = async () => {
    if (!bulkCountry) return;
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => updateDiveSite(id, { country: bulkCountry.label })));
      setSelected(new Set());
      setCountryDialogOpen(false);
      setBulkCountry(null);
      await load();
    } catch { setError('Bulk country update failed'); } finally { setBulkWorking(false); }
  };

  const bulkSetActivity = async () => {
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => updateDiveSite(id, { activities: bulkActivities })));
      setSelected(new Set());
      setActivityDialogOpen(false);
      setBulkActivities([]);
      await load();
    } catch { setError('Bulk activity update failed'); } finally { setBulkWorking(false); }
  };

  // Single site actions
  const openCreate = () => { setEditingSite(null); setDraft(EMPTY_DRAFT); setDialogOpen(true); };

  const openEdit = (site: DiveSite) => {
    setEditingSite(site);
    setDraft({
      name: site.name, location: site.location, country: site.country,
      coordinates: site.coordinates ?? { lat: 0, lng: 0 },
      waterType: site.waterType, maxDepth: site.maxDepth,
      description: site.description, highlights: site.highlights,
      facilities: site.facilities, tags: site.tags ?? [],
      waterTemp: site.waterTemp, visibility: site.visibility,
      bestSeasons: site.bestSeasons, photos: site.photos,
      status: site.status, slug: site.slug,
      activities: site.activities ?? [],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!draft.name || !draft.location) return;
    setSaving(true);
    try {
      if (editingSite) { await updateDiveSite(editingSite.id, draft); }
      else { await createDiveSite(draft); }
      setDialogOpen(false);
      await load();
    } catch (err) {
      setError(`Save failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally { setSaving(false); }
  };

  const handleDelete = async (site: DiveSite) => {
    try {
      await deleteDiveSite(site.id);
      setDeleteConfirm(null);
      await load();
    } catch (err) {
      setError(`Delete failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const updateTemp = (key: keyof WaterTempByMonth, val: string) => {
    const num = parseFloat(val);
    setDraft((d) => ({ ...d, waterTemp: { ...d.waterTemp, [key]: isNaN(num) ? undefined : num } }));
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Dive Sites</Typography>
          {sites.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {sites.length} total · {sites.filter((s) => s.status === 'active').length} active · {sites.filter((s) => s.status === 'pending').length} pending
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} size={isMobile ? 'small' : 'medium'}>
          {isMobile ? 'Add' : 'Add Site'}
        </Button>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Filter bar */}
      <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2 }}>
        {isMobile ? (
          <Stack spacing={1}>
            {/* Search */}
            <TextField
              size="small"
              placeholder="Search name or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
            />
            {/* Status + Type row */}
            <Stack direction="row" spacing={1}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Type</InputLabel>
                <Select label="Type" value={waterTypeFilterAdmin} onChange={(e) => setWaterTypeFilterAdmin(e.target.value)}>
                  <MenuItem value="all">All types</MenuItem>
                  <MenuItem value="sea">Sea</MenuItem>
                  <MenuItem value="lake">Lake</MenuItem>
                  <MenuItem value="deep_tank">Deep Tank</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            {/* Country */}
            <CountryAutocomplete
              value={countryFilterAdmin}
              onChange={(c) => setCountryFilterAdmin(c)}
              label="Country"
              size="small"
              limitToLabels={presentCountries}
            />
            {/* Relevance + count + clear */}
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel>Relevance</InputLabel>
                <Select label="Relevance" value={relevanceFilter} onChange={(e) => setRelevanceFilter(e.target.value)}>
                  <MenuItem value="all">All sites</MenuItem>
                  <MenuItem value="needs-review">Needs review</MenuItem>
                  <MenuItem value="scuba-only">Scuba only</MenuItem>
                  <MenuItem value="depth-unknown">Depth unknown</MenuItem>
                  <MenuItem value="not-scored">Not scored</MenuItem>
                  <MenuItem value="on-shore">On shore</MenuItem>
                  <MenuItem value="has-votes">Has votes</MenuItem>
                </Select>
              </FormControl>
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
                label="Verified"
                size="small"
                clickable
                color={verifiedFilter === 'verified' ? 'success' : 'default'}
                variant={verifiedFilter === 'verified' ? 'filled' : 'outlined'}
                onClick={() => setVerifiedFilter((v) => v === 'verified' ? null : 'verified')}
              />
              <Chip
                label="Not verified"
                size="small"
                clickable
                color={verifiedFilter === 'unverified' ? 'warning' : 'default'}
                variant={verifiedFilter === 'unverified' ? 'filled' : 'outlined'}
                onClick={() => setVerifiedFilter((v) => v === 'unverified' ? null : 'unverified')}
              />
              <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                {filtered.length}/{sites.length}
              </Typography>
              {hasFilters && (
                <IconButton size="small" onClick={clearFilters} color="default">
                  <FilterListOffIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              <TextField
                size="small"
                placeholder="Search name or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ flex: 1, minWidth: 180 }}
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Water type</InputLabel>
                <Select label="Water type" value={waterTypeFilterAdmin} onChange={(e) => setWaterTypeFilterAdmin(e.target.value)}>
                  <MenuItem value="all">All types</MenuItem>
                  <MenuItem value="sea">Sea</MenuItem>
                  <MenuItem value="lake">Lake</MenuItem>
                  <MenuItem value="deep_tank">Deep Tank</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              <Box sx={{ minWidth: 180 }}>
                <CountryAutocomplete
                  value={countryFilterAdmin}
                  onChange={(c) => setCountryFilterAdmin(c)}
                  label="Country"
                  size="small"
                  limitToLabels={presentCountries}
                />
              </Box>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Relevance</InputLabel>
                <Select label="Relevance" value={relevanceFilter} onChange={(e) => setRelevanceFilter(e.target.value)}>
                  <MenuItem value="all">All sites</MenuItem>
                  <MenuItem value="needs-review">Needs review</MenuItem>
                  <MenuItem value="scuba-only">Scuba only</MenuItem>
                  <MenuItem value="depth-unknown">Depth unknown</MenuItem>
                  <MenuItem value="not-scored">Not scored yet</MenuItem>
                  <MenuItem value="on-shore">Coords on shore</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="has-votes">Has votes</MenuItem>
                </Select>
              </FormControl>
              <Button
                size="small"
                variant="outlined"
                startIcon={<ViewColumnIcon />}
                onClick={(e) => setColAnchorEl(e.currentTarget)}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Columns
              </Button>
              <Popover
                open={Boolean(colAnchorEl)}
                anchorEl={colAnchorEl}
                onClose={() => setColAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              >
                <Box sx={{ p: 2, minWidth: 190 }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Visible columns</Typography>
                  {ALL_COLS.map((col) => (
                    <FormControlLabel
                      key={col.id}
                      control={<Checkbox size="small" checked={visibleCols.has(col.id)} onChange={() => toggleCol(col.id)} />}
                      label={<Typography variant="body2">{col.label}</Typography>}
                      sx={{ display: 'flex', mb: 0.5, ml: 0 }}
                    />
                  ))}
                </Box>
              </Popover>
              <Chip
                icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
                label="Verified"
                size="small"
                clickable
                color={verifiedFilter === 'verified' ? 'success' : 'default'}
                variant={verifiedFilter === 'verified' ? 'filled' : 'outlined'}
                onClick={() => setVerifiedFilter((v) => v === 'verified' ? null : 'verified')}
              />
              <Chip
                label="Not verified"
                size="small"
                clickable
                color={verifiedFilter === 'unverified' ? 'warning' : 'default'}
                variant={verifiedFilter === 'unverified' ? 'filled' : 'outlined'}
                onClick={() => setVerifiedFilter((v) => v === 'unverified' ? null : 'unverified')}
              />
              {hasFilters && (
                <Tooltip title="Clear all filters">
                  <Button size="small" startIcon={<FilterListOffIcon />} onClick={clearFilters} color="inherit">Clear</Button>
                </Tooltip>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', whiteSpace: 'nowrap' }}>
                {filtered.length}/{sites.length}
                {selected.size > 0 && ` · ${selected.size} sel`}
              </Typography>
            </Stack>
          </Stack>
        )}
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : isMobile ? (
        /* ── MOBILE CARD LIST ─────────────────────────────────────────────── */
        <Box>
          {/* Bulk toolbar */}
          {selected.size > 0 && (
            <Paper sx={{ mb: 1.5, borderRadius: 2, overflow: 'hidden' }}>
              <Toolbar
                variant="dense"
                sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.08), gap: 0.5, flexWrap: 'wrap', py: 1, minHeight: 'unset' }}
              >
                <Typography fontWeight={600} sx={{ flex: 1, fontSize: 14 }}>{selected.size} selected</Typography>
                <IconButton size="small" color="success" onClick={() => bulkUpdateStatus('active')} disabled={bulkWorking}>
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => bulkUpdateStatus('pending')} disabled={bulkWorking}>
                  <PendingIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => bulkUpdateStatus('archived')} disabled={bulkWorking}>
                  <ArchiveIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => setCountryDialogOpen(true)} disabled={bulkWorking}>
                  <PublicIcon fontSize="small" />
                </IconButton>
                <Tooltip title="Set Activity Type">
                  <IconButton size="small" onClick={() => { setBulkActivities([]); setActivityDialogOpen(true); }} disabled={bulkWorking}>
                    <SportsIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <IconButton size="small" color="error" onClick={() => setBulkDeleteConfirm(true)} disabled={bulkWorking}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Toolbar>
            </Paper>
          )}

          <Stack spacing={1}>
            {paginated.map((site) => {
              const votes = verificationCounts.get(site.id) ?? 0;
              const coords = site.coordinates;
              return (
                <Paper
                  key={site.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: selected.has(site.id) ? '2px solid' : '1px solid transparent',
                    borderColor: selected.has(site.id) ? 'primary.main' : 'divider',
                    boxShadow: 0,
                  }}
                >
                  {/* Top row: checkbox + name + status */}
                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Checkbox
                      size="small"
                      checked={selected.has(site.id)}
                      onChange={() => toggleOne(site.id)}
                      sx={{ mt: -0.5, ml: -0.5 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography fontWeight={700} fontSize={15} sx={{ flex: 1, minWidth: 0 }} noWrap>
                          {site.name}
                        </Typography>
                        <Chip
                          label={site.status}
                          size="small"
                          color={site.status === 'active' ? 'success' : site.status === 'pending' ? 'warning' : 'default'}
                          sx={{ textTransform: 'capitalize', fontSize: '0.7rem', height: 20 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block">{site.location}</Typography>
                    </Box>
                  </Stack>

                  {/* Info chips row */}
                  <Stack direction="row" spacing={0.75} mt={1} flexWrap="wrap" useFlexGap>
                    {site.country && (
                      <Chip label={site.country} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
                    )}
                    <Chip
                      label={site.waterType === 'deep_tank' ? 'Deep Tank' : site.waterType}
                      size="small"
                      color={site.waterType === 'sea' ? 'info' : site.waterType === 'deep_tank' ? 'secondary' : 'default'}
                      sx={{ textTransform: 'capitalize', fontSize: '0.7rem', height: 22 }}
                    />
                    {site.coordinatesOnShore ? (
                      <Chip label="On shore ⚠" size="small" color="error" sx={{ fontSize: '0.7rem', height: 22 }} />
                    ) : site.depthUnknown ? (
                      <Chip label="Depth?" size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                    ) : (
                      <Chip label={`${site.maxDepth}m`} size="small" sx={{ fontSize: '0.7rem', height: 22 }} />
                    )}
                    {site.freediverScore !== undefined && (
                      <Chip
                        label={`Score ${site.freediverScore}`}
                        size="small"
                        color={site.freediverScore >= 45 ? 'success' : site.freediverScore >= 20 ? 'warning' : 'error'}
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    )}
                    {votes > 0 && (
                      <Chip label={`${votes} votes`} size="small" color="success" variant="outlined" sx={{ fontSize: '0.7rem', height: 22 }} />
                    )}
                    {site.verified && (
                      <Chip icon={<VerifiedIcon sx={{ fontSize: '12px !important' }} />} label="Verified" size="small" color="success" sx={{ fontSize: '0.7rem', height: 22 }} />
                    )}
                    {(site.activities?.length ?? 0) === 0 && (
                      <Chip label="⚓ Uncharted" size="small" sx={{ fontSize: '0.7rem', height: 22, bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, border: '1px solid #fcd34d' }} />
                    )}
                    {(site.activities ?? []).includes('line_diving') && (
                      <Chip label="Line Diving" size="small" sx={{ fontSize: '0.7rem', height: 22, bgcolor: '#e3f2fd', color: '#0077be', fontWeight: 700 }} />
                    )}
                    {(site.activities ?? []).includes('snorkeling') && (
                      <Chip label="Snorkeling" size="small" sx={{ fontSize: '0.7rem', height: 22, bgcolor: '#e0f2f1', color: '#00897b', fontWeight: 700 }} />
                    )}
                  </Stack>

                  {/* Coordinates row */}
                  {coords && (
                    <Box sx={{ mt: 1 }}>
                      <CoordPills
                        lat={coords.lat} lng={coords.lng}
                        active={focusedCoordId === site.id}
                        onClick={() => setFocusedCoordId((prev) => prev === site.id ? null : site.id)}
                      />
                    </Box>
                  )}

                  <Divider sx={{ my: 1 }} />

                  {/* Actions */}
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <IconButton
                      size="small"
                      color={site.verified ? 'success' : 'default'}
                      onClick={async () => { await markSiteVerified(site.id, !site.verified); await load(); }}
                    >
                      <VerifiedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" component="a" href={`/dive-sites/${site.slug}`} target="_blank">
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => openEdit(site)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm(site)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[25, 50, 100]}
          />
        </Box>
      ) : (
        /* ── DESKTOP TABLE ────────────────────────────────────────────────── */
        <Paper sx={{ borderRadius: 3, boxShadow: 2, overflow: 'hidden' }}>
          {/* Bulk action toolbar */}
          {selected.size > 0 && (
            <Toolbar sx={{ bgcolor: (t) => alpha(t.palette.primary.main, 0.08), borderBottom: '1px solid', borderColor: 'divider', gap: 1 }}>
              <Typography sx={{ flex: 1 }} fontWeight={600}>{selected.size} selected</Typography>
              <Button size="small" startIcon={<CheckCircleIcon />} color="success" variant="outlined" onClick={() => bulkUpdateStatus('active')} disabled={bulkWorking}>Activate</Button>
              <Button size="small" startIcon={<PendingIcon />} variant="outlined" onClick={() => bulkUpdateStatus('pending')} disabled={bulkWorking}>Pending</Button>
              <Button size="small" startIcon={<ArchiveIcon />} variant="outlined" onClick={() => bulkUpdateStatus('archived')} disabled={bulkWorking}>Archive</Button>
              <Button size="small" startIcon={<PublicIcon />} variant="outlined" onClick={() => setCountryDialogOpen(true)} disabled={bulkWorking}>Set Country</Button>
              <Button size="small" startIcon={<SportsIcon />} variant="outlined" onClick={() => { setBulkActivities([]); setActivityDialogOpen(true); }} disabled={bulkWorking}>Set Activity</Button>
              <Button size="small" startIcon={<DeleteIcon />} color="error" variant="outlined" onClick={() => setBulkDeleteConfirm(true)} disabled={bulkWorking}>Delete</Button>
              {bulkWorking && <CircularProgress size={20} />}
            </Toolbar>
          )}

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell padding="checkbox">
                    <Checkbox indeterminate={someSelected} checked={allSelected} onChange={toggleAll} size="small" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  {show('country') && <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>}
                  {show('type')    && <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>}
                  {show('depth')   && <TableCell sx={{ fontWeight: 700 }}>Depth</TableCell>}
                  {show('score')   && <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>}
                  {show('votes')   && <TableCell sx={{ fontWeight: 700 }}>Votes</TableCell>}
                  {show('coords')  && <TableCell sx={{ fontWeight: 700 }}>Coordinates</TableCell>}
                  {show('status')  && <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>}
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((site) => {
                  const votes = verificationCounts.get(site.id) ?? 0;
                  const coords = site.coordinates;
                  return (
                    <TableRow key={site.id} hover selected={selected.has(site.id)}>
                      <TableCell padding="checkbox" onClick={(e) => { e.stopPropagation(); toggleOne(site.id); }}>
                        <Checkbox checked={selected.has(site.id)} size="small" />
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={600} fontSize={14}>{site.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{site.location}</Typography>
                        <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap">
                          {(site.activities?.length ?? 0) === 0 && (
                            <Chip label="⚓ Uncharted" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#fef3c7', color: '#92400e', fontWeight: 700, border: '1px solid #fcd34d' }} />
                          )}
                          {(site.activities ?? []).includes('line_diving') && (
                            <Chip label="Line Diving" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#e3f2fd', color: '#0077be', fontWeight: 700 }} />
                          )}
                          {(site.activities ?? []).includes('snorkeling') && (
                            <Chip label="Snorkeling" size="small" sx={{ fontSize: '0.65rem', height: 18, bgcolor: '#e0f2f1', color: '#00897b', fontWeight: 700 }} />
                          )}
                        </Stack>
                      </TableCell>

                      {show('country') && (
                        <TableCell>
                          {site.country || <Typography variant="caption" color="error">Missing</Typography>}
                        </TableCell>
                      )}

                      {show('type') && (
                        <TableCell sx={{ textTransform: 'capitalize' }}>{site.waterType}</TableCell>
                      )}

                      {show('depth') && (
                        <TableCell>
                          {site.coordinatesOnShore
                            ? <Tooltip title="Coordinates land on shore"><Typography variant="caption" color="error">Shore ⚠</Typography></Tooltip>
                            : site.depthUnknown
                              ? <Typography variant="caption" color="text.disabled">Unknown</Typography>
                              : `${site.maxDepth}m`}
                        </TableCell>
                      )}

                      {show('score') && (
                        <TableCell>
                          {site.freediverScore !== undefined ? (
                            <Tooltip title={site.scubaFlags?.length ? `Flags: ${site.scubaFlags.join(', ')}` : 'No flags'}>
                              <Chip label={site.freediverScore} size="small" color={site.freediverScore >= 45 ? 'success' : site.freediverScore >= 20 ? 'warning' : 'error'} />
                            </Tooltip>
                          ) : <Typography variant="caption" color="text.disabled">—</Typography>}
                        </TableCell>
                      )}

                      {show('votes') && (
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            {site.verified && <Tooltip title="Verified by admin"><VerifiedIcon sx={{ fontSize: 14, color: 'success.main' }} /></Tooltip>}
                            {votes > 0
                              ? <Chip label={votes} size="small" color="success" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
                              : <Typography variant="caption" color="text.disabled">—</Typography>}
                          </Stack>
                        </TableCell>
                      )}

                      {show('coords') && (
                        <TableCell>
                          {coords
                            ? <CoordPills
                                lat={coords.lat} lng={coords.lng}
                                active={focusedCoordId === site.id}
                                onClick={() => setFocusedCoordId((prev) => prev === site.id ? null : site.id)}
                              />
                            : <Typography variant="caption" color="text.disabled">—</Typography>}
                        </TableCell>
                      )}

                      {show('status') && (
                        <TableCell>
                          <Chip label={site.status} size="small"
                            color={site.status === 'active' ? 'success' : site.status === 'pending' ? 'warning' : 'default'}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                      )}

                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title={site.verified ? 'Unmark verified' : 'Mark verified'}>
                            <IconButton size="small" color={site.verified ? 'success' : 'default'}
                              onClick={async () => { await markSiteVerified(site.id, !site.verified); await load(); }}>
                              <VerifiedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View site">
                            <IconButton size="small" component="a" href={`/dive-sites/${site.slug}`} target="_blank">
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => openEdit(site)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteConfirm(site)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[25, 50, 100]}
          />
        </Paper>
      )}

      {/* ── Create / Edit Dialog ───────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle fontWeight={700}>{editingSite ? `Edit: ${editingSite.name}` : 'Add Dive Site'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} pt={1}>

            {/* ── Activity Types — top of form ─────────────────────────────── */}
            <Box sx={{ p: 2, borderRadius: 2, border: '2px solid', borderColor: (draft.activities?.length ?? 0) === 0 ? '#f59e0b' : '#0077be', bgcolor: (draft.activities?.length ?? 0) === 0 ? '#fffbeb' : '#f0f7ff' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2" fontWeight={700}>Activity Types</Typography>
                {(draft.activities?.length ?? 0) === 0 && (
                  <Chip label="⚓ Uncharted" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#fef3c7', color: '#92400e', border: '1.5px solid #fcd34d' }} />
                )}
              </Stack>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                {([['line_diving', 'Line Diving', '#0077be'], ['snorkeling', 'Snorkeling', '#00897b']] as const).map(([val, label, color]) => (
                  <FormControlLabel
                    key={val}
                    control={
                      <Checkbox
                        size="small"
                        checked={(draft.activities ?? []).includes(val)}
                        onChange={(e) => setDraft((d) => ({
                          ...d,
                          activities: e.target.checked
                            ? [...(d.activities ?? []), val]
                            : (d.activities ?? []).filter((a) => a !== val),
                        }))}
                        sx={{ color, '&.Mui-checked': { color } }}
                      />
                    }
                    label={<Typography variant="body2" fontWeight={600}>{label}</Typography>}
                  />
                ))}
              </Stack>
              {(draft.activities?.length ?? 0) === 0 && (
                <Typography variant="caption" sx={{ color: '#92400e', mt: 0.75, display: 'block' }}>
                  This site is <strong>Uncharted</strong> — it won't appear in the public listing until tagged as Line Diving or Snorkeling.
                </Typography>
              )}
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Site Name" value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} fullWidth required />
              <TextField label="Location / City" value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))} fullWidth required />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CountryAutocomplete
                value={lookupCountry(draft.country) ?? null}
                onChange={(c) => setDraft((d) => ({ ...d, country: c?.label ?? '' }))}
                fullWidth
              />
              <TextField label="Slug (auto-generated)" value={draft.slug || generateSlug(draft.name)}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                fullWidth helperText="URL-friendly identifier" />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Water Type</InputLabel>
                <Select label="Water Type" value={draft.waterType}
                  onChange={(e) => setDraft((d) => ({ ...d, waterType: e.target.value as DiveSite['waterType'] }))}>
                  {([['sea', 'Sea'], ['lake', 'Lake'], ['deep_tank', 'Deep Tank']] as const).map(([val, label]) => (
                    <MenuItem key={val} value={val}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select label="Status" value={draft.status}
                  onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as DiveSite['status'] }))}>
                  {(['active', 'pending', 'archived'] as const).map((s) => (
                    <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Max Depth (m)" type="number" value={draft.maxDepth}
                onChange={(e) => setDraft((d) => ({ ...d, maxDepth: parseFloat(e.target.value) || 0 }))} fullWidth />
              <TextField label="Visibility Min (m)" type="number" value={draft.visibility.min}
                onChange={(e) => setDraft((d) => ({ ...d, visibility: { ...d.visibility, min: parseFloat(e.target.value) || 0 } }))} fullWidth />
              <TextField label="Visibility Max (m)" type="number" value={draft.visibility.max}
                onChange={(e) => setDraft((d) => ({ ...d, visibility: { ...d.visibility, max: parseFloat(e.target.value) || 0 } }))} fullWidth />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
              <TextField label="Latitude" type="number" value={draft.coordinates.lat}
                onChange={(e) => setDraft((d) => ({ ...d, coordinates: { ...d.coordinates, lat: parseFloat(e.target.value) || 0 } }))}
                fullWidth helperText={draft.coordinates.lat ? ddmLat(draft.coordinates.lat) : ''} />
              <TextField label="Longitude" type="number" value={draft.coordinates.lng}
                onChange={(e) => setDraft((d) => ({ ...d, coordinates: { ...d.coordinates, lng: parseFloat(e.target.value) || 0 } }))}
                fullWidth helperText={draft.coordinates.lng ? ddmLng(draft.coordinates.lng) : ''} />
              <Button variant="outlined" startIcon={<MyLocationIcon />}
                onClick={() => { setMapPickerPos({ lat: draft.coordinates.lat || 20, lng: draft.coordinates.lng || 10 }); setMapPickerOpen(true); }}
                sx={{ whiteSpace: 'nowrap', height: 56, flexShrink: 0 }}>
                Pick on Map
              </Button>
            </Stack>

            <TextField label="Description" value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              multiline rows={4} fullWidth />

            <TextField label="Highlights (one per line)" value={draft.highlights.join('\n')}
              onChange={(e) => setDraft((d) => ({ ...d, highlights: e.target.value.split('\n').filter(Boolean) }))}
              multiline rows={3} fullWidth helperText="Enter each highlight on a new line" />

            <TextField label="Facilities (one per line)" value={draft.facilities.join('\n')}
              onChange={(e) => setDraft((d) => ({ ...d, facilities: e.target.value.split('\n').filter(Boolean) }))}
              multiline rows={2} fullWidth helperText="e.g. Parking, Changing rooms, Café nearby" />

            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>Best Seasons</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {(['Spring', 'Summer', 'Autumn', 'Winter'] as const).map((season) => (
                  <FormControlLabel
                    key={season}
                    control={
                      <Checkbox size="small" checked={draft.bestSeasons.includes(season)}
                        onChange={(e) => setDraft((d) => ({
                          ...d,
                          bestSeasons: e.target.checked ? [...d.bestSeasons, season] : d.bestSeasons.filter((s) => s !== season),
                        }))} />
                    }
                    label={season}
                  />
                ))}
              </Stack>
            </Box>


            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Water Temperature by Month (°C)</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {MONTH_KEYS.map((key, i) => (
                  <TextField key={key} label={MONTH_LABELS[i]} type="number"
                    value={draft.waterTemp[key] ?? ''} onChange={(e) => updateTemp(key, e.target.value)}
                    size="small" sx={{ width: 70 }} inputProps={{ step: 0.5 }} />
                ))}
              </Stack>
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch checked={!!draft.thermocline}
                    onChange={(e) => setDraft((d) => ({
                      ...d,
                      thermocline: e.target.checked ? { depth: 10, tempDrop: 5, seasons: [], notes: '' } : undefined,
                    }))} />
                }
                label={<Typography variant="subtitle2" fontWeight={600}>Thermocline present</Typography>}
              />
              {draft.thermocline && (
                <Stack spacing={2} mt={1.5} pl={1} sx={{ borderLeft: '3px solid #0288d1' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Depth (m)" type="number" value={draft.thermocline.depth}
                      onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, depth: parseFloat(e.target.value) || 0 } }))}
                      size="small" sx={{ width: 120 }} helperText="Where it starts" />
                    <TextField label="Temp drop (°C)" type="number" value={draft.thermocline.tempDrop}
                      onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, tempDrop: parseFloat(e.target.value) || 0 } }))}
                      size="small" sx={{ width: 140 }} helperText="Degrees colder below" />
                    <TextField label="Seasons (comma-separated)" value={(draft.thermocline.seasons ?? []).join(', ')}
                      onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, seasons: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } }))}
                      size="small" fullWidth helperText="e.g. Summer, Autumn" />
                  </Stack>
                  <TextField label="Thermocline notes" value={draft.thermocline.notes ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, notes: e.target.value } }))}
                    multiline rows={2} fullWidth
                    placeholder="Describe what divers should expect — buoyancy shift, visibility change, etc." />
                </Stack>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !draft.name || !draft.location}>
            {saving ? <CircularProgress size={20} /> : editingSite ? 'Save Changes' : 'Create Site'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Single delete confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Dive Site?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Bulk delete confirmation */}
      <Dialog open={bulkDeleteConfirm} onClose={() => setBulkDeleteConfirm(false)}>
        <DialogTitle>Delete {selected.size} sites?</DialogTitle>
        <DialogContent>
          <Typography>This will permanently delete <strong>{selected.size} dive sites</strong>. This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDeleteConfirm(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={bulkDelete} disabled={bulkWorking}>
            {bulkWorking ? <CircularProgress size={20} /> : `Delete ${selected.size} sites`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk set country dialog */}
      <Dialog open={countryDialogOpen} onClose={() => setCountryDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Set Country for {selected.size} sites</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <CountryAutocomplete value={bulkCountry} onChange={(c) => setBulkCountry(c)} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCountryDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={bulkSetCountry} disabled={!bulkCountry || bulkWorking}>
            {bulkWorking ? <CircularProgress size={20} /> : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk set activity dialog */}
      <Dialog open={activityDialogOpen} onClose={() => setActivityDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700}>Set Activity for {selected.size} sites</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" color="text.secondary" mb={2}>
            This will <strong>replace</strong> the activity tags on all selected sites. Select at least one activity, or leave both unchecked to mark them as <strong>Uncharted</strong>.
          </Typography>
          <Stack spacing={1}>
            {([['line_diving', 'Line Diving', '#0077be'], ['snorkeling', 'Snorkeling', '#00897b']] as const).map(([val, label, color]) => (
              <FormControlLabel
                key={val}
                control={
                  <Checkbox
                    checked={bulkActivities.includes(val)}
                    onChange={(e) => setBulkActivities((prev) =>
                      e.target.checked ? [...prev, val] : prev.filter((a) => a !== val)
                    )}
                    sx={{ color, '&.Mui-checked': { color } }}
                  />
                }
                label={<Typography fontWeight={600}>{label}</Typography>}
              />
            ))}
          </Stack>
          {bulkActivities.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              No activity selected — sites will be marked as <strong>⚓ Uncharted</strong> and hidden from the public listing.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={bulkSetActivity} disabled={bulkWorking}>
            {bulkWorking ? <CircularProgress size={20} /> : `Apply to ${selected.size} sites`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Coordinate map picker */}
      <Dialog open={mapPickerOpen} onClose={() => setMapPickerOpen(false)} maxWidth="md" fullWidth
        PaperProps={{ sx: { height: '80vh' } }}>
        <DialogTitle fontWeight={700}>
          Pick Location
          <Typography variant="body2" color="text.secondary" mt={0.5}>Drag the pin or click anywhere to move it.</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <Box sx={{ position: 'absolute', inset: 0 }}>
            <CoordinatePickerMap position={mapPickerPos} onChange={setMapPickerPos} />
          </Box>
          <Box sx={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            bgcolor: 'rgba(0,0,0,0.65)', color: '#fff', px: 2, py: 0.75, borderRadius: 2,
            fontSize: 13, fontFamily: 'monospace', pointerEvents: 'none', zIndex: 1000,
          }}>
            {ddmLat(mapPickerPos.lat)}  {ddmLng(mapPickerPos.lng)}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setMapPickerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => {
            setDraft((d) => ({ ...d, coordinates: { lat: parseFloat(mapPickerPos.lat.toFixed(6)), lng: parseFloat(mapPickerPos.lng.toFixed(6)) } }));
            setMapPickerOpen(false);
          }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
