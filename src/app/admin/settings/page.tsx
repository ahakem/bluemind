'use client';

import { Box, Typography, Alert } from '@mui/material';

export default function AdminSettingsPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={4}>Site Settings</Typography>
      <Alert severity="info">No configurable settings at this time.</Alert>
    </Box>
  );
}
