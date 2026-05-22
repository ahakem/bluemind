'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Typography, Alert,
  CircularProgress, Checkbox, Divider, Box, Chip,
  useMediaQuery, useTheme, LinearProgress,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import PlaceIcon from '@mui/icons-material/Place';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { DiveSite } from '@/types/admin';
import { SiteCorrectionDraft } from '@/types/admin';
import { submitCorrection } from '@/lib/communityService';

const LocationPickerStep = dynamic(() => import('@/components/LocationPickerStep'), { ssr: false });

const CORRECTABLE_FIELDS: { key: keyof DiveSite | 'coordinates'; label: string; hint?: string }[] = [
  { key: 'name',        label: 'Site Name' },
  { key: 'location',    label: 'City / Region' },
  { key: 'country',     label: 'Country' },
  { key: 'maxDepth',    label: 'Max Depth',      hint: 'Enter depth in metres, e.g. 40' },
  { key: 'waterType',   label: 'Water Type',     hint: 'sea or lake' },
  { key: 'activities',  label: 'Activity Type',  hint: 'Line Diving, Snorkeling, or both' },
  { key: 'description', label: 'Description' },
  { key: 'coordinates', label: 'Map Location',   hint: 'Pin the correct location on the map' },
];

function formatValue(key: string, site: DiveSite): string {
  if (key === 'coordinates') {
    const c = site.coordinates;
    return c ? `${c.lat.toFixed(5)}, ${c.lng.toFixed(5)}` : '—';
  }
  if (key === 'activities') {
    const a = site.activities ?? [];
    if (!a.length) return 'Uncharted (no activity tagged)';
    return a.map((v) => v === 'line_diving' ? 'Line Diving' : 'Snorkeling').join(', ');
  }
  const v = site[key as keyof DiveSite];
  if (v === null || v === undefined) return '—';
  return String(v);
}

function truncate(s: string, n = 60) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

export default function RequestCorrectionDialog({
  open, onClose, site,
}: {
  open: boolean;
  onClose: () => void;
  site: DiveSite;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [step, setStep] = useState<1 | 2>(1);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [suggested, setSuggested] = useState<Partial<Record<string, string>>>({});
  const [suggestedActivities, setSuggestedActivities] = useState<('line_diving' | 'snorkeling')[]>(
    site.activities ?? []
  );
  const [newCoords, setNewCoords] = useState<{ lat: number; lng: number }>(
    site.coordinates ?? { lat: 0, lng: 0 }
  );
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [hp, setHp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const selectedFields = CORRECTABLE_FIELDS.filter((f) => checked.has(f.key));
  const coordinatesChecked = checked.has('coordinates');

  const toggle = (key: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const handleSubmit = async () => {
    setError('');
    if (!email.trim()) { setError('Your email is required.'); return; }

    const fields: SiteCorrectionDraft['fields'] = {};
    checked.forEach((key) => {
      if (key === 'coordinates') {
        fields.coordinates = { current: site.coordinates, suggested: newCoords };
      } else if (key === 'activities') {
        fields.activities = { current: site.activities ?? [], suggested: suggestedActivities };
      } else {
        fields[key] = {
          current: site[key as keyof DiveSite],
          suggested: suggested[key] ?? formatValue(key, site),
        };
      }
    });

    const draft: SiteCorrectionDraft = {
      siteId: site.id,
      siteSlug: site.slug,
      siteName: site.name,
      fields,
      submitterEmail: email,
      correctionNote: note,
      _hp: hp,
    };

    setSubmitting(true);
    try {
      await submitCorrection(draft);
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setChecked(new Set());
    setSuggested({});
    setSuggestedActivities(site.activities ?? []);
    setNewCoords(site.coordinates ?? { lat: 0, lng: 0 });
    setEmail('');
    setNote('');
    setHp('');
    setError('');
    setDone(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={coordinatesChecked && step === 2 ? 'md' : 'sm'}
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3, overflow: 'hidden' } }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 36, height: 36, borderRadius: '50%',
                bgcolor: '#fdecea', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <FlagIcon sx={{ fontSize: 18, color: '#e53935' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                Report Incorrect Data
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {site.name} · {site.country}
              </Typography>
            </Box>
            {!done && (
              <Chip
                label={`Step ${step} / 2`}
                size="small"
                sx={{ bgcolor: '#f5f5f5', fontWeight: 600, fontSize: '0.72rem' }}
              />
            )}
          </Stack>
        </Box>
        {/* Progress bar */}
        {!done && (
          <LinearProgress
            variant="determinate"
            value={step === 1 ? 50 : 100}
            sx={{
              height: 3,
              bgcolor: '#f0f0f0',
              '& .MuiLinearProgress-bar': { bgcolor: '#e53935' },
            }}
          />
        )}
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {/* ── Done state ─────────────────────────────────────────────────── */}
        {done ? (
          <Stack alignItems="center" spacing={2} py={3}>
            <Box
              sx={{
                width: 56, height: 56, borderRadius: '50%',
                bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <CheckIcon sx={{ fontSize: 28, color: '#2e7d32' }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700} mb={0.5}>Correction Submitted</Typography>
              <Typography variant="body2" color="text.secondary">
                Thank you! Our team will review your report and update the site if the information is accurate.
              </Typography>
            </Box>
          </Stack>
        ) : step === 1 ? (
          /* ── Step 1: Select fields ─────────────────────────────────── */
          <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary" mb={1.5}>
              Which fields contain incorrect information?
            </Typography>

            {CORRECTABLE_FIELDS.map(({ key, label }) => {
              const isChecked = checked.has(key);
              const currentVal = formatValue(key, site);

              return (
                <Box
                  key={key}
                  onClick={() => toggle(key)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: '1.5px solid',
                    borderColor: isChecked ? '#e53935' : 'divider',
                    bgcolor: isChecked ? '#fff5f5' : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    '&:hover': {
                      borderColor: isChecked ? '#c62828' : '#bdbdbd',
                      bgcolor: isChecked ? '#fff5f5' : '#fafafa',
                    },
                  }}
                >
                  {/* Custom checkbox */}
                  <Box
                    sx={{
                      width: 20, height: 20, borderRadius: 0.75, flexShrink: 0,
                      border: '2px solid',
                      borderColor: isChecked ? '#e53935' : '#bdbdbd',
                      bgcolor: isChecked ? '#e53935' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isChecked && <CheckIcon sx={{ fontSize: 13, color: 'white' }} />}
                  </Box>

                  {key === 'coordinates' && (
                    <PlaceIcon sx={{ fontSize: 16, color: isChecked ? '#e53935' : 'text.disabled', flexShrink: 0 }} />
                  )}

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: isChecked ? '#c62828' : 'text.primary' }}>
                      {label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      {truncate(currentVal, 55)}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        ) : (
          /* ── Step 2: Fill in corrections ───────────────────────────── */
          <Stack spacing={2.5}>
            {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

            {selectedFields.map(({ key, label, hint }) => (
              <Box key={key}>
                <Typography variant="body2" fontWeight={700} mb={0.5}>
                  {label}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Current: <Box component="span" sx={{ fontStyle: 'italic' }}>{truncate(formatValue(key, site), 80)}</Box>
                </Typography>

                {key === 'activities' ? (
                  <Box>
                    <Stack spacing={0.75}>
                      {([['line_diving', 'Line Diving', '#0077be'], ['snorkeling', 'Snorkeling', '#00897b']] as const).map(([val, label, color]) => {
                        const on = suggestedActivities.includes(val);
                        return (
                          <Box
                            key={val}
                            onClick={() => setSuggestedActivities((prev) =>
                              prev.includes(val) ? prev.filter((a) => a !== val) : [...prev, val]
                            )}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25,
                              borderRadius: 2, border: '1.5px solid', cursor: 'pointer', transition: 'all 0.15s',
                              borderColor: on ? color : 'divider',
                              bgcolor: on ? (val === 'line_diving' ? '#e3f2fd' : '#e0f2f1') : 'background.paper',
                              '&:hover': { borderColor: color },
                            }}
                          >
                            <Box sx={{
                              width: 20, height: 20, borderRadius: 0.75, flexShrink: 0,
                              border: '2px solid', borderColor: on ? color : '#bdbdbd',
                              bgcolor: on ? color : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {on && <CheckIcon sx={{ fontSize: 13, color: 'white' }} />}
                            </Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: on ? color : 'text.primary' }}>
                              {label}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                    {suggestedActivities.length === 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                        Leave both unchecked to suggest this site is Uncharted / unclassified.
                      </Typography>
                    )}
                  </Box>
                ) : key === 'coordinates' ? (
                  <Box>
                    {newCoords.lat !== 0 && (
                      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, display: 'block', mb: 0.75 }}>
                        📍 New pin: {newCoords.lat.toFixed(5)}, {newCoords.lng.toFixed(5)}
                      </Typography>
                    )}
                    <Box sx={{ height: 300, borderRadius: 1.5, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                      <LocationPickerStep position={newCoords} onChange={(pos) => setNewCoords(pos)} />
                    </Box>
                  </Box>
                ) : (
                  <TextField
                    size="small"
                    fullWidth
                    value={suggested[key] ?? ''}
                    onChange={(e) => setSuggested((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={hint ?? `Enter correct ${label.toLowerCase()}…`}
                    multiline={key === 'description'}
                    rows={key === 'description' ? 3 : 1}
                  />
                )}
              </Box>
            ))}

            <Divider />

            <TextField
              label="Your Email *"
              type="email"
              value={email}
              fullWidth
              size="small"
              onChange={(e) => setEmail(e.target.value)}
              helperText="Not shown publicly — only used if we need to follow up."
            />
            <TextField
              label="Additional context (optional)"
              value={note}
              fullWidth
              multiline
              rows={2}
              size="small"
              onChange={(e) => setNote(e.target.value)}
              inputProps={{ maxLength: 1000 }}
            />

            {/* Honeypot */}
            <input
              type="text" name="_hp" value={hp}
              onChange={(e) => setHp(e.target.value)}
              style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
              tabIndex={-1} aria-hidden="true" autoComplete="off"
            />
          </Stack>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {done ? (
          <Button onClick={handleClose} variant="contained" fullWidth>Close</Button>
        ) : step === 1 ? (
          <>
            <Button onClick={handleClose} color="inherit" sx={{ mr: 'auto' }}>Cancel</Button>
            <Button
              variant="contained"
              disabled={checked.size === 0}
              onClick={() => setStep(2)}
              sx={{ bgcolor: '#e53935', '&:hover': { bgcolor: '#c62828' }, minWidth: 120 }}
            >
              Next →
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => { setStep(1); setError(''); }}
              startIcon={<ArrowBackIcon />}
              color="inherit"
              sx={{ mr: 'auto' }}
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} /> : <FlagIcon />}
              sx={{ bgcolor: '#e53935', '&:hover': { bgcolor: '#c62828' }, minWidth: 160 }}
            >
              {submitting ? 'Submitting…' : 'Submit Correction'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
