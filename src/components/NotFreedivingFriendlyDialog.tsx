'use client';

import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Typography, Alert,
  CircularProgress, Divider, Box,
  useMediaQuery, useTheme,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckIcon from '@mui/icons-material/Check';
import { DiveSite } from '@/types/admin';
import { submitRemovalRequest } from '@/lib/communityService';

const REASONS = [
  { key: 'scuba_only', label: 'Scuba only — not suitable for freediving' },
  { key: 'private',    label: 'Private property / access denied' },
  { key: 'dangerous',  label: 'Dangerous or prohibited for freediving' },
  { key: 'closed',     label: 'Site no longer accessible / permanently closed' },
  { key: 'wrong_type', label: 'Wrong water type (e.g. listed as sea but is lake)' },
  { key: 'other',      label: 'Other reason' },
];

export default function NotFreedivingFriendlyDialog({
  open, onClose, site,
}: {
  open: boolean;
  onClose: () => void;
  site: DiveSite;
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const toggle = (key: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const handleSubmit = async () => {
    setError('');
    if (selected.size === 0) { setError('Please select at least one reason.'); return; }
    if (!email.trim()) { setError('Your email is required.'); return; }

    setSubmitting(true);
    try {
      await submitRemovalRequest({
        siteId: site.id,
        siteSlug: site.slug,
        siteName: site.name,
        reasons: [...selected],
        note,
        submitterEmail: email,
        _hp: hp,
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelected(new Set());
    setNote('');
    setEmail('');
    setHp('');
    setError('');
    setDone(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{ sx: { borderRadius: fullScreen ? 0 : 3, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '50%',
              bgcolor: '#fce4ec', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <BlockIcon sx={{ fontSize: 18, color: '#c62828' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                Not Freediving Friendly?
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {site.name} · {site.country}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Divider />
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2.5 }}>
        {done ? (
          <Stack alignItems="center" spacing={2} py={3}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '50%',
              bgcolor: '#e8f5e9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckIcon sx={{ fontSize: 28, color: '#2e7d32' }} />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={700} mb={0.5}>Report Received</Typography>
              <Typography variant="body2" color="text.secondary">
                Thank you. Our team will review this site and remove or update it if your report is confirmed.
              </Typography>
            </Box>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              If this site is not suitable for freediving, let us know why and we'll review it for removal.
            </Typography>

            {error && <Alert severity="error" sx={{ py: 0.5 }}>{error}</Alert>}

            <Stack spacing={1}>
              {REASONS.map(({ key, label }) => {
                const isSelected = selected.has(key);
                return (
                  <Box
                    key={key}
                    onClick={() => toggle(key)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      px: 2, py: 1.25, borderRadius: 2, border: '1.5px solid',
                      borderColor: isSelected ? '#c62828' : 'divider',
                      bgcolor: isSelected ? '#fff5f5' : 'background.paper',
                      cursor: 'pointer', transition: 'all 0.15s',
                      '&:hover': { borderColor: isSelected ? '#b71c1c' : '#bdbdbd', bgcolor: isSelected ? '#fff5f5' : '#fafafa' },
                    }}
                  >
                    <Box sx={{
                      width: 20, height: 20, borderRadius: 0.75, flexShrink: 0,
                      border: '2px solid', borderColor: isSelected ? '#c62828' : '#bdbdbd',
                      bgcolor: isSelected ? '#c62828' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                    }}>
                      {isSelected && <CheckIcon sx={{ fontSize: 13, color: 'white' }} />}
                    </Box>
                    <Typography variant="body2" fontWeight={isSelected ? 600 : 400} sx={{ color: isSelected ? '#b71c1c' : 'text.primary' }}>
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>

            <TextField
              label="Additional details (optional)"
              value={note}
              fullWidth
              multiline
              rows={2}
              size="small"
              onChange={(e) => setNote(e.target.value)}
              inputProps={{ maxLength: 1000 }}
            />

            <TextField
              label="Your Email *"
              type="email"
              value={email}
              fullWidth
              size="small"
              onChange={(e) => setEmail(e.target.value)}
              helperText="Not shown publicly — only used if we need to follow up."
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
        ) : (
          <>
            <Button onClick={handleClose} color="inherit" sx={{ mr: 'auto' }}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={16} /> : <BlockIcon />}
              sx={{ bgcolor: '#c62828', '&:hover': { bgcolor: '#b71c1c' }, minWidth: 160 }}
            >
              {submitting ? 'Submitting…' : 'Submit Report'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
