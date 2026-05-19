'use client';

import { useEffect, useState, useMemo } from 'react';
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
} from '@mui/material';
import CountryAutocomplete from '@/components/CountryAutocomplete';
import { countries, lookupCountry, CountryType } from '@/data/countries';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  getAllDiveSites,
  createDiveSite,
  updateDiveSite,
  deleteDiveSite,
  generateSlug,
} from '@/lib/diveSiteService';
import { DiveSite, DiveSiteDraft, WaterTempByMonth, Thermocline } from '@/types/admin';

const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const EMPTY_DRAFT: DiveSiteDraft = {
  name: '',
  location: '',
  country: 'Netherlands',
  coordinates: { lat: 52.37, lng: 4.9 },
  waterType: 'lake',
  difficulty: 'beginner',
  maxDepth: 20,
  description: '',
  highlights: [],
  facilities: [],
  waterTemp: {},
  visibility: { min: 2, max: 6 },
  bestSeasons: [],
  photos: [],
  status: 'active',
};

const DIFFICULTY_COLORS: Record<DiveSite['difficulty'], 'success' | 'warning' | 'error'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
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

  const load = async () => {
    try {
      const data = await getAllDiveSites();
      setSites(data);
    } catch (e) {
      setError('Failed to load sites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
      coordinates: site.coordinates,
      waterType: site.waterType,
      difficulty: site.difficulty,
      maxDepth: site.maxDepth,
      description: site.description,
      highlights: site.highlights,
      facilities: site.facilities,
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
    } catch (e) {
      setError('Save failed — Firebase may not be configured.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (site: DiveSite) => {
    try {
      await deleteDiveSite(site.id);
      setDeleteConfirm(null);
      await load();
    } catch (e) {
      setError('Delete failed — Firebase may not be configured.');
    }
  };

  const updateTemp = (key: keyof WaterTempByMonth, val: string) => {
    const num = parseFloat(val);
    setDraft((d) => ({ ...d, waterTemp: { ...d.waterTemp, [key]: isNaN(num) ? undefined : num } }));
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>Dive Sites</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add Site
        </Button>
      </Stack>

      {error && <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Difficulty</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Depth</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{site.name}</Typography>
                    <Typography variant="caption" color="text.secondary">/dive-sites/{site.slug}</Typography>
                  </TableCell>
                  <TableCell>{site.location}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{site.waterType}</TableCell>
                  <TableCell>
                    <Chip label={site.difficulty} color={DIFFICULTY_COLORS[site.difficulty]} size="small" sx={{ textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell>{site.maxDepth}m</TableCell>
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
                fullWidth
                required
              />
              <TextField
                label="Location / City"
                value={draft.location}
                onChange={(e) => setDraft((d) => ({ ...d, location: e.target.value }))}
                fullWidth
                required
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
                  {(['lake', 'sea', 'quarry', 'river', 'pool'] as const).map((t) => (
                    <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Difficulty</InputLabel>
                <Select
                  label="Difficulty"
                  value={draft.difficulty}
                  onChange={(e) => setDraft((d) => ({ ...d, difficulty: e.target.value as DiveSite['difficulty'] }))}
                >
                  {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                    <MenuItem key={d} value={d} sx={{ textTransform: 'capitalize' }}>{d}</MenuItem>
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
              <TextField
                label="Max Depth (m)"
                type="number"
                value={draft.maxDepth}
                onChange={(e) => setDraft((d) => ({ ...d, maxDepth: parseFloat(e.target.value) || 0 }))}
                fullWidth
              />
              <TextField
                label="Visibility Min (m)"
                type="number"
                value={draft.visibility.min}
                onChange={(e) => setDraft((d) => ({ ...d, visibility: { ...d.visibility, min: parseFloat(e.target.value) || 0 } }))}
                fullWidth
              />
              <TextField
                label="Visibility Max (m)"
                type="number"
                value={draft.visibility.max}
                onChange={(e) => setDraft((d) => ({ ...d, visibility: { ...d.visibility, max: parseFloat(e.target.value) || 0 } }))}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Latitude"
                type="number"
                value={draft.coordinates.lat}
                onChange={(e) => setDraft((d) => ({ ...d, coordinates: { ...d.coordinates, lat: parseFloat(e.target.value) || 0 } }))}
                fullWidth
              />
              <TextField
                label="Longitude"
                type="number"
                value={draft.coordinates.lng}
                onChange={(e) => setDraft((d) => ({ ...d, coordinates: { ...d.coordinates, lng: parseFloat(e.target.value) || 0 } }))}
                fullWidth
              />
            </Stack>

            <TextField
              label="Description"
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              multiline
              rows={4}
              fullWidth
            />

            <TextField
              label="Highlights (one per line)"
              value={draft.highlights.join('\n')}
              onChange={(e) => setDraft((d) => ({ ...d, highlights: e.target.value.split('\n').filter(Boolean) }))}
              multiline
              rows={3}
              fullWidth
              helperText="Enter each highlight on a new line"
            />

            <TextField
              label="Facilities (one per line)"
              value={draft.facilities.join('\n')}
              onChange={(e) => setDraft((d) => ({ ...d, facilities: e.target.value.split('\n').filter(Boolean) }))}
              multiline
              rows={2}
              fullWidth
              helperText="e.g. Parking, Changing rooms, Café nearby"
            />

            <TextField
              label="Best Seasons (comma-separated)"
              value={draft.bestSeasons.join(', ')}
              onChange={(e) => setDraft((d) => ({ ...d, bestSeasons: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
              fullWidth
              helperText="e.g. Spring, Summer, Autumn"
            />

            {/* Water Temps */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
                Water Temperature by Month (°C)
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {MONTH_KEYS.map((key, i) => (
                  <TextField
                    key={key}
                    label={MONTH_LABELS[i]}
                    type="number"
                    value={draft.waterTemp[key] ?? ''}
                    onChange={(e) => updateTemp(key, e.target.value)}
                    size="small"
                    sx={{ width: 70 }}
                    inputProps={{ step: 0.5 }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Thermocline */}
            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!draft.thermocline}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        thermocline: e.target.checked
                          ? { depth: 10, tempDrop: 5, seasons: [], notes: '' }
                          : undefined,
                      }))
                    }
                  />
                }
                label={<Typography variant="subtitle2" fontWeight={600}>Thermocline present</Typography>}
              />
              {draft.thermocline && (
                <Stack spacing={2} mt={1.5} pl={1} sx={{ borderLeft: '3px solid #0288d1' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Depth (m)"
                      type="number"
                      value={draft.thermocline.depth}
                      onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, depth: parseFloat(e.target.value) || 0 } }))}
                      size="small"
                      sx={{ width: 120 }}
                      helperText="Where it starts"
                    />
                    <TextField
                      label="Temp drop (°C)"
                      type="number"
                      value={draft.thermocline.tempDrop}
                      onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, tempDrop: parseFloat(e.target.value) || 0 } }))}
                      size="small"
                      sx={{ width: 140 }}
                      helperText="Degrees colder below"
                    />
                    <TextField
                      label="Seasons (comma-separated)"
                      value={(draft.thermocline.seasons ?? []).join(', ')}
                      onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, seasons: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) } }))}
                      size="small"
                      fullWidth
                      helperText="e.g. Summer, Autumn"
                    />
                  </Stack>
                  <TextField
                    label="Thermocline notes"
                    value={draft.thermocline.notes ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, thermocline: { ...d.thermocline!, notes: e.target.value } }))}
                    multiline
                    rows={2}
                    fullWidth
                    placeholder="Describe what divers should expect — buoyancy shift, visibility change, etc."
                  />
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

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Dive Site?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
