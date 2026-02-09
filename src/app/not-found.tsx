'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 10,
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Typography
          variant="h1"
          fontFamily="Poppins"
          fontWeight={700}
          color="primary"
          sx={{ fontSize: { xs: '4rem', md: '6rem' }, mb: 2 }}
        >
          404
        </Typography>
        <Typography variant="h4" fontFamily="Poppins" fontWeight={600} mb={2}>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          component={Link}
          href="/"
          sx={{
            borderRadius: '50px',
            px: 4,
            py: 1.5,
            textTransform: 'none',
          }}
        >
          Back to Home
        </Button>
      </Container>
    </Box>
  );
}
