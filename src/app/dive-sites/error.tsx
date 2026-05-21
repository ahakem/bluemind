'use client';

import { useEffect } from 'react';
import { Button, Box, Typography, Container } from '@mui/material';

export default function DiveSitesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Unable to load dive sites
        </Typography>
        <Typography variant="body1" color="text.secondary">
          There was a problem loading this page. This may be a temporary issue.
        </Typography>
        <Button variant="contained" onClick={reset}>
          Try again
        </Button>
      </Box>
    </Container>
  );
}
