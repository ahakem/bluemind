'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import CountryAutocomplete from '@/components/CountryAutocomplete';
import { lookupCountry, CountryType } from '@/data/countries';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArchiveIcon from '@mui/icons-material/Archive';
import PendingIcon from '@mui/icons-material/HourglassEmpty';
import PublicIcon from '@mui/icons-material/Public';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import {
  getAllDiveSites,
  createDiveSite,
  updateDiveSite,
  deleteDiveSite,
  generateSlug,
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
};

export default function AdminDiveSitesPage() {
  const [sites, setSites] = useState<DiveSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<DiveSite | null>(null);
  const [draft, setDraft] = useState<DiveSiteDraft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<DiveSite | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilterAdmin, setCountryFilterAdmin] = useState<CountryType | null>(null);
  const [waterTypeFilterAdmin, setWaterTypeFilterAdmin] = useState<string>('all');
  const [relevanceFilter, setRelevanceFilter] = useState<string>('all');

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
    return true;
  });

  const presentCountries = [...new Set(sites.map((s) => s.country).filter(Boolean))].sort();

  const hasFilters = search || statusFilter !== 'all' || countryFilterAdmin || waterTypeFilterAdmin !== 'all' || relevanceFilter !== 'all';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCountryFilterAdmin(null);
    setWaterTypeFilterAdmin('all');
    setRelevanceFilter('all');
    setPage(0);
  };

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  // Reset to page 0 whenever filters change
  useEffect(() => { setPage(0); }, [search, statusFilter, countryFilterAdmin, waterTypeFilterAdmin, relevanceFilter]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Bulk state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkWorking, setBulkWorking] = useState(false);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [countryDialogOpen, setCountryDialogOpen] = useState(false);
  const [bulkCountry, setBulkCountry] = useState<{ code: string; label: string; phone: string } | null>(null);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickerPos, setMapPickerPos] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

  const load = async () => {
    try {
      const data = await getAllDiveSites();
      setSites(data);
    } catch {
      setError('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // --- Selection helpers (operate on filtered rows) ---
  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.id));
  const someSelected = filtered.some((s) => selected.has(s.id)) && !allSelected;

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...filtered.map((s) => s.id)]));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // --- Bulk actions ---
  const bulkUpdateStatus = async (status: DiveSite['status']) => {
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => updateDiveSite(id, { status })));
      setSelected(new Set());
      await load();
    } catch {
      setError('Bulk update failed');
    } finally {
      setBulkWorking(false);
    }
  };

  const bulkDelete = async () => {
    setBulkWorking(true);
    try {
      await Promise.all([...selected].map((id) => deleteDiveSite(id)));
      setSelected(new Set());
      setBulkDeleteConfirm(false);
      await load();
    } catch {
      setError('Bulk delete failed');
    } finally {
      setBulkWorking(false);
    }
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
    } catch {
      setError('Bulk country update failed');
    } finally {
      setBulkWorking(false);
    }
  };

  // --- Single site actions ---
  const openCreate = () => {
    setEditingSite(null);
    setDraft(EMPTY_DRAFT);
    setDialogOpen(true);
  };

  const openEdit = (site: DiveSite) => {
    setEditingSite(site);
    setDraft({
      name: site.name,
      location: site.location,
      country: site.country,
      coordinates: site.coordinates ?? { lat: 0, lng: 0 },
      waterType: site.waterType,
      maxDepth: site.maxDepth,
      description: site.description,
      highlights: site.highlights,
      facilities: site.facilities,
      tags: site.tags ?? [],
      waterTemp: site.waterTemp,
      visibility: site.visibility,
      bestSeasons: site.bestSeasons,
      photos: site.photos,
      status: site.status,
      slug: site.slug,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!draft.name || !draft.location) return;
    setSaving(true);
    try {
      if (editingSite) {
        await updateDiveSite(editingSite.id, draft);
      } else {
        await createDiveSite(draft);
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AdminDiveSites] save failed:', err);
      setError(`Save failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (site: DiveSite) => {
    try {
      await deleteDiveSite(site.id);
      setDeleteConfirm(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[AdminDiveSites] delete failed:', err);
      setError(`Delete failed: ${msg}`);
    }
  };

  const updateTemp = (key: keyof WaterTempByMonth, val: string) => {
    const num = parseFloat(val);
    setDraft((d) => ({ ...d, waterTemp: { ...d.waterTemp, [key]: isNaN(num) ? undefined : num } }));
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Dive Sites</Typography>
          {sites.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {sites.length} total · {sites.filter((s) => s.status === 'active').length} active · {sites.filter((s) => s.status === 'pending').length} pending
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Site
        </Button>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Filter bar */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          <TextField
            size="small"
            placeholder="Search name or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 220 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>Water type</InputLabel>
            <Select label="Water type" value={waterTypeFilterAdmin} onChange={(e) => setWaterTypeFilterAdmin(e.target.value)}>
              <MenuItem value="all">All types</MenuItem>
              <MenuItem value="lake">Lake</MenuItem>
              <MenuItem value="sea">Sea</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ minWidth: 200 }}>
            <CountryAutocomplete
              value={countryFilterAdmin}
              onChange={(c) => setCountryFilterAdmin(c)}
              label="Country"
              size="small"
              limitToLabels={presentCountries}
            />
          </Box>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Relevance</InputLabel>
            <Select label="Relevance" value={relevanceFilter} onChange={(e) => setRelevanceFilter(e.target.value)}>
              <MenuItem value="all">All sites</MenuItem>
              <MenuItem value="needs-review">Needs review</MenuItem>
              <MenuItem value="scuba-only">Scuba only</MenuItem>
              <MenuItem value="depth-unknown">Depth unknown</MenuItem>
              <MenuItem value="not-scored">Not scored yet</MenuItem>
              <MenuItem value="on-shore">Coordinates on shore</MenuItem>
            </Select>
          </FormControl>
          {hasFilters && (
            <Tooltip title="Clear all filters">
              <Button size="small" startIcon={<FilterListOffIcon />} onClick={clearFilters} color="inherit">
                Clear
              </Button>
            </Tooltip>
          )}
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {filtered.length} of {sites.length} sites
            {selected.size > 0 && ` · ${selected.size} selected`}
          </Typography>
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 3, boxShadow: 2, overflow: 'hidden' }}>
          {/* Bulk action toolbar — appears when items are selected */}
          {selected.size > 0 && (
            <Toolbar
              sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                borderBottom: '1px solid',
                borderColor: 'divider',
                gap: 1,
              }}
            >
              <Typography sx={{ flex: 1 }} fontWeight={600}>
                {selected.size} selected
              </Typography>
              <Tooltip title="Activate selected">
                <span>
                  <Button
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    color="success"
                    variant="outlined"
                    onClick={() => bulkUpdateStatus('active')}
                    disabled={bulkWorking}
                  >
                    Activate
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Set selected to pending">
                <span>
                  <Button
                    size="small"
                    startIcon={<PendingIcon />}
                    variant="outlined"
                    onClick={() => bulkUpdateStatus('pending')}
                    disabled={bulkWorking}
                  >
                    Pending
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Archive selected">
                <span>
                  <Button
                    size="small"
                    startIcon={<ArchiveIcon />}
                    variant="outlined"
                    onClick={() => bulkUpdateStatus('archived')}
                    disabled={bulkWorking}
                  >
                    Archive
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Set country for selected">
                <span>
                  <Button
                    size="small"
                    startIcon={<PublicIcon />}
                    variant="outlined"
                    onClick={() => setCountryDialogOpen(true)}
                    disabled={bulkWorking}
                  >
                    Set Country
                  </Button>
                </span>
              </Tooltip>
              <Tooltip title="Delete selected">
                <span>
                  <Button
                    size="small"
                    startIcon={<DeleteIcon />}
                    color="error"
                    variant="outlined"
                    onClick={() => setBulkDeleteConfirm(true)}
                    disabled={bulkWorking}
                  >
                    Delete
                  </Button>
                </span>
              </Tooltip>
              {bulkWorking && <CircularProgress size={20} />}
            </Toolbar>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={someSelected}
                      checked={allSelected}
                      onChange={toggleAll}
                      size="small"
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Country</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Difficulty</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Depth</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Score</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.map((site) => (
                  <TableRow
                    key={site.id}
                    hover
                    selected={selected.has(site.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox" onClick={(e) => { e.stopPropagation(); toggleOne(site.id); }}>
                      <Checkbox checked={selected.has(site.id)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{site.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{site.location}</Typography>
                    </TableCell>
                    <TableCell>{site.country || <Typography variant="caption" color="error">Missing</Typography>}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{site.waterType}</TableCell>
                    <TableCell>
                      {site.coordinatesOnShore
                        ? <Tooltip title="Coordinates land on shore — use map picker to fix"><Typography variant="caption" color="error">On shore ⚠</Typography></Tooltip>
                        : site.depthUnknown
                          ? <Typography variant="caption" color="text.disabled">Unknown</Typography>
                          : `${site.maxDepth}m`}
                    </TableCell>
                    <TableCell>
                      {site.freediverScore !== undefined ? (
                        <Tooltip title={site.scubaFlags?.length ? `Flags: ${site.scubaFlags.join(', ')}` : 'No scuba flags'}>
                          <Chip
                            label={site.freediverScore}
                            size="small"
                            color={site.freediverScore >= 45 ? 'success' : site.freediverScore >= 20 ? 'warning' : 'error'}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={site.status}
                        size="small"
                        color={site.status === 'active' ? 'success' : site.status === 'pending' ? 'warning' : 'default'}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
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
                ))}
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

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>{editingSite ? `Edit: ${editingSite.name}` : 'Add Dive Site'}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} pt={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Site Name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                fullWidth required
              />
              <TextField
                label="Location / City"
                value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                fullWidth required
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <CountryAutocomplete
                value={lookupCountry(draft.country) ?? null}
                onChange={(c) => setDraft((d) => ({ ...d, country: c?.label ?? '' }))}
                fullWidth
              />
              <TextField
                label="Slug (auto-generated)"
                value={draft.slug || generateSlug(draft.name)}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                fullWidth
                helperText="URL-friendly identifier"
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Water Type</InputLabel>
                <Select
                  label="Water Type"
                  value={draft.waterType}
                  onChange={(e) => setDraft((d) => ({ ...d, waterType: e.target.value as DiveSite['waterType'] }))}
                >
                  {(['lake', 'sea'] as const).map((t) => (
                    <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={draft.status}
                  onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as DiveSite['status'] }))}
                >
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
                onChange={(e) => setDraft((d) => ({ ...d, coordinates: { ...d.coordinates, lat: parseFloat(e.target.value) || 0 } }))} fullWidth />
              <TextField label="Longitude" type="number" value={draft.coordinates.lng}
                onChange={(e) => setDraft((d) => ({ ...d, coordinates: { ...d.coordinates, lng: parseFloat(e.target.value) || 0 } }))} fullWidth />
              <Button
                variant="outlined"
                startIcon={<MyLocationIcon />}
                onClick={() => {
                  setMapPickerPos({ lat: draft.coordinates.lat || 20, lng: draft.coordinates.lng || 10 });
                  setMapPickerOpen(true);
                }}
                sx={{ whiteSpace: 'nowrap', height: 56 }}
              >
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
                      <Checkbox
                        size="small"
                        checked={draft.bestSeasons.includes(season)}
                        onChange={(e) => setDraft((d) => ({
                          ...d,
                          bestSeasons: e.target.checked
                            ? [...d.bestSeasons, season]
                            : d.bestSeasons.filter((s) => s !== season),
                        }))}
                      />
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
                  <Switch
                    checked={!!draft.thermocline}
                    onChange={(e) => setDraft((d) => ({
                      ...d,
                      thermocline: e.target.checked ? { depth: 10, tempDrop: 5, seasons: [], notes: '' } : undefined,
                    }))}
                  />
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
          <CountryAutocomplete
            value={bulkCountry}
            onChange={(c) => setBulkCountry(c)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCountryDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={bulkSetCountry} disabled={!bulkCountry || bulkWorking}>
            {bulkWorking ? <CircularProgress size={20} /> : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Coordinate map picker ── */}
      <Dialog
        open={mapPickerOpen}
        onClose={() => setMapPickerOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle fontWeight={700}>
          Pick Location
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Drag the pin or click anywhere on the map to move it.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <Box sx={{ position: 'absolute', inset: 0 }}>
            <CoordinatePickerMap
              position={mapPickerPos}
              onChange={setMapPickerPos}
            />
          </Box>
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: 'rgba(0,0,0,0.65)',
              color: '#fff',
              px: 2,
              py: 0.75,
              borderRadius: 2,
              fontSize: 13,
              fontFamily: 'monospace',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            {mapPickerPos.lat.toFixed(6)}, {mapPickerPos.lng.toFixed(6)}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setMapPickerOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              setDraft((d) => ({
                ...d,
                coordinates: {
                  lat: parseFloat(mapPickerPos.lat.toFixed(6)),
                  lng: parseFloat(mapPickerPos.lng.toFixed(6)),
                },
              }));
              setMapPickerOpen(false);
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
