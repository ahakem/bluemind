'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Switch, FormControlLabel,
  Alert, CircularProgress, Snackbar, Divider,
} from '@mui/material';
import { getSiteFeatures, updateSiteFeatures, SiteFeatures } from '@/lib/siteSettings';

export default function AdminSettingsPage() {
  const [features, setFeatures] = useState<SiteFeatures>({ diveSitesEnabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    getSiteFeatures().then((f) => { setFeatures(f); setLoading(false); });
  }, []);

  const handleToggle = async (key: keyof SiteFeatures, value: boolean) => {
    setSaving(true);
    const updated = { ...features, [key]: value };
    setFeatures(updated);
    try {
      await updateSiteFeatures({ [key]: value });
      setSnackbar({ open: true, message: 'Setting saved', severity: 'success' });
    } catch {
      setFeatures(features); // revert
      setSnackbar({ open: true, message: 'Failed to save', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={4}>Site Settings</Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        These settings control public visibility of features. Changes take effect immediately.
      </Alert>

      <Card sx={{ borderRadius: 3, boxShadow: 2, maxWidth: 600 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} color="text.secondary" mb={2}>
            FEATURES
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={features.diveSitesEnabled}
                onChange={(e) => handleToggle('diveSitesEnabled', e.target.checked)}
                disabled={saving}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography fontWeight={600}>Dive Sites Directory</Typography>
                <Typography variant="caption" color="text.secondary">
                  Shows the Dive Sites link in the navigation and the promo section on the homepage.
                  {' '}
                  <strong>Note:</strong> The dive sites pages remain accessible via direct URL regardless of this setting.
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', mb: 1 }}
          />

          <Divider sx={{ my: 2 }} />

          <Alert severity="warning" sx={{ mt: 1 }}>
            Dive Sites pages have <strong>noindex</strong> set — Google will not index them until you remove it from the code.
          </Alert>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
