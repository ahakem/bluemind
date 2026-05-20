'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Paper,
} from '@mui/material';
import Link from 'next/link';
import PlaceIcon from '@mui/icons-material/Place';
import PeopleIcon from '@mui/icons-material/People';
import ExploreIcon from '@mui/icons-material/Explore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const FEATURES = [
  {
    icon: <PlaceIcon sx={{ fontSize: 32, color: '#0077be' }} />,
    title: 'Dive Sites Worldwide',
    body: 'Hundreds of freediving-friendly locations with depth, visibility, water temperature, and seasonal info — all in one place.',
  },
  {
    icon: <ExploreIcon sx={{ fontSize: 32, color: '#0077be' }} />,
    title: 'Interactive Map',
    body: 'Browse sites on a live map. Filter by country, water type, or difficulty level to find your next spot.',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 32, color: '#0077be' }} />,
    title: 'Built for the Community',
    body: 'This directory is our gift to the global freediving community — free to use, always growing, no account needed.',
  },
];

export default function DiveSitesPromo() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        background: 'linear-gradient(160deg, #001f3f 0%, #003366 60%, #005fa3 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background texture circles */}
      <Box sx={{
        position: 'absolute', top: -80, right: -80, width: 400, height: 400,
        borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
      }} />
      <Box sx={{
        position: 'absolute', bottom: -120, left: -60, width: 500, height: 500,
        borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none',
      }} />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center">

          {/* Left — copy */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="overline"
              sx={{ color: '#4fc3f7', fontWeight: 700, letterSpacing: 2, mb: 1, display: 'block' }}
            >
              Free Community Resource
            </Typography>
            <Typography
              variant="h2"
              fontWeight={800}
              sx={{ fontSize: { xs: '2rem', md: '2.75rem' }, lineHeight: 1.15, mb: 3 }}
            >
              Explore Freediving Spots Around the World
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: 'rgba(255,255,255,0.75)', mb: 4, fontSize: '1.05rem', lineHeight: 1.8 }}
            >
              We built a global dive sites directory and we&apos;re giving it away — completely free.
              Find sites near you, check conditions, plan your next open water session, and help
              fellow freedivers discover new locations.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                component={Link}
                href="/dive-sites"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#0077be',
                  '&:hover': { bgcolor: '#005fa3' },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: '1rem',
                }}
              >
                Explore Dive Sites
              </Button>
              <Button
                component={Link}
                href="/membership"
                variant="outlined"
                size="large"
                sx={{
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                }}
              >
                Join the Club
              </Button>
            </Stack>
          </Grid>

          {/* Right — feature cards */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2.5}>
              {FEATURES.map((f) => (
                <Paper
                  key={f.title}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    gap: 2.5,
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ flexShrink: 0, mt: 0.25 }}>{f.icon}</Box>
                  <Box>
                    <Typography fontWeight={700} mb={0.5} sx={{ color: 'white' }}>
                      {f.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>
                      {f.body}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}
