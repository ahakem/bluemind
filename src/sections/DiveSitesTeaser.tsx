'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import WaterIcon from '@mui/icons-material/Water';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Link from 'next/link';

export default function DiveSitesTeaser() {
  return (
    <Box
      component="div"
      sx={{
        background: 'linear-gradient(90deg, #001228 0%, #002855 50%, #003d7a 100%)',
        borderBottom: '1px solid rgba(79,195,247,0.2)',
        py: { xs: 1.4, md: 1.6 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={{ xs: 1.5, md: 2 }}
          flexWrap="wrap"
          useFlexGap
        >
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '8px',
              background: 'rgba(79,195,247,0.12)',
              border: '1px solid rgba(79,195,247,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <WaterIcon sx={{ fontSize: 17, color: '#4fc3f7' }} />
          </Box>

          <Typography
            sx={{
              color: 'rgba(255,255,255,0.88)',
              fontSize: { xs: '0.83rem', md: '0.92rem' },
              fontWeight: 500,
              lineHeight: 1.2,
            }}
          >
            <Box component="span" sx={{ fontWeight: 700, color: 'white' }}>
              Freediving sites worldwide
            </Box>
            {' '}— shared for the love of the community
          </Typography>

          <Box
            component={Link}
            href="/dive-sites"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              color: '#4fc3f7',
              fontSize: { xs: '0.82rem', md: '0.88rem' },
              fontWeight: 700,
              textDecoration: 'none',
              flexShrink: 0,
              border: '1px solid rgba(79,195,247,0.35)',
              borderRadius: '50px',
              px: 1.8,
              py: 0.5,
              '&:hover': {
                color: 'white',
                borderColor: 'rgba(79,195,247,0.7)',
                background: 'rgba(79,195,247,0.08)',
              },
              transition: 'all 0.15s',
            }}
          >
            Browse the directory
            <ArrowForwardIcon sx={{ fontSize: 14 }} />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
