'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stepper, Step, StepLabel, TextField, MenuItem,
  FormControl, InputLabel, Select, Stack, Typography,
  Checkbox, FormControlLabel, FormGroup, Alert, CircularProgress,
  Slider, Box, Divider, Chip,
} from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { SiteSubmissionDraft } from '@/types/admin';
import { submitSite } from '@/lib/communityService';
import CountryAutocomplete from '@/components/CountryAutocomplete';
import { CountryType } from '@/data/countries';

const LocationPickerStep = dynamic(() => import('@/components/LocationPickerStep'), { ssr: false });

const STEPS = ['Basic Info', 'Location on Map', 'Details & Submit'];
const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];

export const DIVE_TAGS = [
  // Activity
  'Freediving', 'Scuba', 'Snorkeling', 'Night Diving', 'Drift Diving', 'Cave Diving', 'Technical Diving',
  // Site type
  'Reef', 'Wreck', 'Wall', 'Cave', 'Pinnacle', 'Drop-off', 'Blue Hole', 'Arch', 'Kelp Forest',
  // Marine life
  'Sharks', 'Mantas', 'Turtles', 'Dolphins', 'Macro Life',
  // Conditions / access
  'Shore Entry', 'Boat Needed', 'Beginner Friendly', 'Strong Currents', 'Training',
];

const EMPTY: SiteSubmissionDraft = {
  name: '', location: '', country: '',
  coordinates: { lat: 0, lng: 0 },
  waterType: 'sea',
  tags: [],
  maxDepth: 20, description: '',
  highlights: [], facilities: [],
  visibility: { min: 5, max: 20 },
  bestSeasons: [],
  submitterEmail: '', submitterNote: '',
  _hp: '', ipFingerprint: '',
};

export default function SubmitSiteDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<SiteSubmissionDraft>(EMPTY);
  const [highlightsText, setHighlightsText] = useState('');
  const [facilitiesText, setFacilitiesText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (key: keyof SiteSubmissionDraft, val: unknown) =>
    setDraft((d) => ({ ...d, [key]: val }));

  const handleCountry = (c: CountryType | null) => set('country', c?.label ?? '');

  const handleCoords = useCallback((pos: { lat: number; lng: number }) => {
    setDraft((d) => ({ ...d, coordinates: pos }));
  }, []);

  const toggleTag = (tag: string) => {
    setDraft((d) => ({
      ...d,
      tags: d.tags.includes(tag) ? d.tags.filter((t) => t !== tag) : [...d.tags, tag],
    }));
  };

  const handleNext = () => {
    setError('');
    if (step === 0) {
      if (!draft.name.trim()) { setError('Site name is required.'); return; }
      if (!draft.country) { setError('Country is required.'); return; }
    }
    if (step === 1) {
      if (draft.coordinates.lat === 0 && draft.coordinates.lng === 0) {
        setError('Please place a pin on the map first.'); return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setError('');
    if (!draft.submitterEmail.trim()) { setError('Your email is required.'); return; }
    const finalDraft: SiteSubmissionDraft = {
      ...draft,
      highlights: highlightsText.split('\n').map((h) => h.trim()).filter(Boolean),
      facilities: facilitiesText.split('\n').map((f) => f.trim()).filter(Boolean),
    };
    setSubmitting(true);
    try {
      await submitSite(finalDraft);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(0);
    setDraft(EMPTY);
    setHighlightsText('');
    setFacilitiesText('');
    setError('');
    setDone(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <AddLocationAltIcon sx={{ color: '#0077be' }} />
          <Typography variant="h6" fontWeight={700}>Submit a Dive Site</Typography>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {done ? (
          <Alert severity="success" sx={{ mt: 1 }}>
            <Typography fontWeight={600}>Thank you! Your submission is under review.</Typography>
            <Typography variant="body2" mt={0.5}>
              Our team will verify the site and publish it if it meets our quality standards.
            </Typography>
          </Alert>
        ) : (
          <>
            <Stepper activeStep={step} sx={{ mb: 3 }}>
              {STEPS.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* ── Step 0: Basic Info ── */}
            {step === 0 && (
              <Stack spacing={2.5}>
                <TextField
                  label="Site Name *" value={draft.name} fullWidth
                  onChange={(e) => set('name', e.target.value)}
                  inputProps={{ maxLength: 120 }}
                />
                <TextField
                  label="City / Region" value={draft.location} fullWidth
                  onChange={(e) => set('location', e.target.value)}
                  inputProps={{ maxLength: 120 }}
                />
                <CountryAutocomplete
                  value={draft.country ? { code: '', label: draft.country, phone: '' } as CountryType : null}
                  onChange={handleCountry}
                />
                <FormControl fullWidth>
                  <InputLabel>Water Type *</InputLabel>
                  <Select value={draft.waterType} label="Water Type *"
                    onChange={(e) => set('waterType', e.target.value)}>
                    {['lake', 'sea', 'quarry', 'river', 'pool'].map((t) => (
                      <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Max Depth (m) *" type="number" value={draft.maxDepth}
                  onChange={(e) => set('maxDepth', Number(e.target.value))}
                  inputProps={{ min: 0, max: 400 }}
                  sx={{ maxWidth: 200 }}
                  helperText="Typical max depth in metres"
                />
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight={600}>Visibility</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {draft.visibility.min}–{draft.visibility.max} m
                    </Typography>
                  </Stack>
                  <Slider
                    value={[draft.visibility.min, draft.visibility.max]}
                    min={0} max={60} step={1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v}m`}
                    onChange={(_, v) => {
                      const [min, max] = v as number[];
                      set('visibility', { min, max });
                    }}
                  />
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">0 m (murky)</Typography>
                    <Typography variant="caption" color="text.secondary">60 m (crystal clear)</Typography>
                  </Stack>
                </Box>
                <TextField
                  label="Description" value={draft.description} fullWidth multiline rows={3}
                  onChange={(e) => set('description', e.target.value)}
                  inputProps={{ maxLength: 2000 }}
                  helperText="What makes this site special for freedivers?"
                />
              </Stack>
            )}

            {/* ── Step 1: Location ── */}
            {step === 1 && (
              <Box sx={{ height: 480 }}>
                <LocationPickerStep position={draft.coordinates} onChange={handleCoords} />
              </Box>
            )}

            {/* ── Step 2: Details & Submit ── */}
            {step === 2 && (
              <Stack spacing={2.5}>
                {/* Tags */}
                <Box>
                  <Typography variant="body2" fontWeight={600} mb={1}>Site Tags</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
                    Select all that apply
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {DIVE_TAGS.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onClick={() => toggleTag(tag)}
                        variant={draft.tags.includes(tag) ? 'filled' : 'outlined'}
                        color={draft.tags.includes(tag) ? 'primary' : 'default'}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>

                <Divider />

                <TextField
                  label="Highlights (one per line)"
                  value={highlightsText} fullWidth multiline rows={3}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  helperText="e.g. Wall dive, Thermocline at 18m, Jellyfish season"
                />
                <TextField
                  label="Facilities (one per line)"
                  value={facilitiesText} fullWidth multiline rows={2}
                  onChange={(e) => setFacilitiesText(e.target.value)}
                  helperText="e.g. Parking, Toilets, Gear rental"
                />
                <Box>
                  <Typography variant="body2" fontWeight={600} mb={1}>Best Seasons</Typography>
                  <FormGroup row>
                    {SEASONS.map((s) => (
                      <FormControlLabel key={s} label={s}
                        control={
                          <Checkbox
                            checked={draft.bestSeasons.includes(s)}
                            onChange={(e) => set('bestSeasons',
                              e.target.checked
                                ? [...draft.bestSeasons, s]
                                : draft.bestSeasons.filter((x) => x !== s)
                            )}
                          />
                        }
                      />
                    ))}
                  </FormGroup>
                </Box>
                <Divider />
                <TextField
                  label="Your Email *" type="email" value={draft.submitterEmail} fullWidth
                  onChange={(e) => set('submitterEmail', e.target.value)}
                  helperText="We won't share this publicly. Used only if we need to follow up."
                />
                <TextField
                  label="Additional Notes (optional)"
                  value={draft.submitterNote} fullWidth multiline rows={2}
                  onChange={(e) => set('submitterNote', e.target.value)}
                  inputProps={{ maxLength: 500 }}
                />
                {/* Honeypot — hidden from real users */}
                <input
                  type="text"
                  name="_hp"
                  value={draft._hp}
                  onChange={(e) => set('_hp', e.target.value)}
                  style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
                  tabIndex={-1}
                  aria-hidden="true"
                  autoComplete="off"
                />
              </Stack>
            )}
          </>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        {done ? (
          <Button onClick={handleClose} variant="contained">Close</Button>
        ) : (
          <>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            {step > 0 && <Button onClick={() => setStep((s) => s - 1)}>Back</Button>}
            {step < 2 ? (
              <Button onClick={handleNext} variant="contained">Next</Button>
            ) : (
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} /> : undefined}
              >
                {submitting ? 'Submitting…' : 'Submit for Review'}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
