'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import Link from 'next/link';

const REDIRECT_URL = 'https://judgesuite.com/';
const REDIRECT_SECONDS = 5;

export default function JudgeSuiteRedirect() {
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = REDIRECT_URL;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        px: 3,
        py: 8,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
        Judge Suite Has Moved
      </Typography>
      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4, maxWidth: 600 }}>
        The Judge Suite tool has moved to its own standalone site. You will be
        redirected automatically in{' '}
        <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}.
      </Typography>
      <CircularProgress size={40} sx={{ mb: 4 }} />
      <Typography variant="body1" sx={{ mb: 2 }}>
        If you are not redirected,{' '}
        <a
          href={REDIRECT_URL}
          style={{ color: '#1976d2', fontWeight: 600 }}
        >
          click here to go to judgesuite.com
        </a>
      </Typography>
      <Link
        href="/"
        style={{ color: '#90a4ae', fontSize: '0.9rem', marginTop: '1rem' }}
      >
        ← Back to Blue Mind Freediving
      </Link>
    </Box>
  );
}
