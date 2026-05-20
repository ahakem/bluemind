'use client';

import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Typography, Alert,
  CircularProgress, Checkbox, FormControlLabel,
  Divider, Box, Chip,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { DiveSite } from '@/types/admin';
import { SiteCorrectionDraft } from '@/types/admin';
import { submitCorrection } from '@/lib/communityService';

const CORRECTABLE_FIELDS: { key: keyof DiveSite; label: string }[] = [
  { key: 'name', label: 'Site Name' },
  { key: 'location', label: 'City / Region' },
  { key: 'country', label: 'Country' },
  { key: 'maxDepth', label: 'Max Depth' },
  { key: 'waterType', label: 'Water Type' },
  { key: 'difficulty', label: 'Difficulty' },
  { key: 'description', label: 'Description' },
];

function formatValue(key: keyof DiveSite, site: DiveSite): string {
  const v = site[key];
  if (v === null || v === undefined) return '—';
  return String(v);
}

export default function RequestCorrectionDialog({
  open, onClose, site,
}: {
  open: boolean;
  onClose: () => void;
  site: DiveSite;
}) {
  const [checked, setChecked] = useState<Set<keyof DiveSite>>(new Set());
  const [suggested, setSuggested] = useState<Partial<Record<keyof DiveSite, string>>>({});
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [hp, setHp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const toggle = (key: keyof DiveSite) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleSubmit = async () => {
    setError('');
    if (checked.size === 0) { setError('Please select at least one field to correct.'); return; }
    if (!email.trim()) { setError('Your email is required.'); return; }

    const fields: SiteCorrectionDraft['fields'] = {};
    checked.forEach((key) => {
      fields[key as string] = {
        current: site[key],
        suggested: suggested[key] ?? formatValue(key, site),
      };
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
    setChecked(new Set());
    setSuggested({});
    setEmail('');
    setNote('');
    setHp('');
    setError('');
    setDone(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <FlagIcon sx={{ color: '#e53935' }} />
          <Typography variant="h6" fontWeight={700}>Report Incorrect Data</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {site.name} · {site.country}
        </Typography>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 2 }}>
        {done ? (
          <Alert severity="success">
            <Typography fontWeight={600}>Thank you! Your correction has been submitted.</Typography>
            <Typography variant="body2" mt={0.5}>
              Our team will review it and update the site if the information is accurate.
            </Typography>
          </Alert>
        ) : (
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <Typography variant="body2" color="text.secondary">
              Select the fields that contain incorrect information and provide the correct values.
            </Typography>

            {CORRECTABLE_FIELDS.map(({ key, label }) => (
              <Box key={key} sx={{ border: '1px solid', borderColor: checked.has(key) ? '#0077be' : 'divider', borderRadius: 1.5, p: 1.5, transition: 'border-color 0.15s' }}>
                <FormControlLabel
                  label={<Typography variant="body2" fontWeight={600}>{label}</Typography>}
                  control={
                    <Checkbox
                      checked={checked.has(key)}
                      onChange={() => toggle(key)}
                      size="small"
                    />
                  }
                />
                <Box sx={{ ml: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={checked.has(key) ? 1 : 0}>
                    <Typography variant="caption" color="text.secondary">Current:</Typography>
                    <Chip label={formatValue(key, site)} size="small" sx={{ fontSize: '0.72rem' }} />
                  </Stack>
                  {checked.has(key) && (
                    <TextField
                      label={`Correct ${label}`}
                      size="small"
                      fullWidth
                      value={suggested[key] ?? ''}
                      onChange={(e) => setSuggested((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={`Enter correct ${label.toLowerCase()}…`}
                      multiline={key === 'description'}
                      rows={key === 'description' ? 3 : 1}
                    />
                  )}
                </Box>
              </Box>
            ))}

            <Divider />

            <TextField
              label="Your Email *" type="email" value={email} fullWidth size="small"
              onChange={(e) => setEmail(e.target.value)}
              helperText="Not shown publicly. Used only if we need to follow up."
            />
            <TextField
              label="Additional context (optional)"
              value={note} fullWidth multiline rows={2} size="small"
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
      <DialogActions sx={{ px: 3, py: 2 }}>
        {done ? (
          <Button onClick={handleClose} variant="contained">Close</Button>
        ) : (
          <>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="error"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} /> : <FlagIcon />}
            >
              {submitting ? 'Submitting…' : 'Submit Correction'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
