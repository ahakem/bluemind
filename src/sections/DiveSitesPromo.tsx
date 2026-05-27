import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import WaterIcon from '@mui/icons-material/Water';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FavoriteIcon from '@mui/icons-material/Favorite';

const STATS = [
  { value: '100+', label: 'Countries' },
  { value: 'All', label: 'Levels' },
  { value: 'Free', label: 'Always' },
];

export default function DiveSitesPromo() {
  return (
    <Box
      component="section"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #001228 0%, #002855 55%, #0060a0 100%)',
        color: 'white',
        py: { xs: 8, md: 10 },
      }}
    >
      {/* Decorative wave rings */}
      {[0.04, 0.025, 0.015].map((opacity, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            borderRadius: '50%',
            border: `1px solid rgba(79,195,247,${opacity * 6})`,
            background: `rgba(0,119,190,${opacity})`,
            width: { xs: 280 + i * 160, md: 400 + i * 220 },
            height: { xs: 280 + i * 160, md: 400 + i * 220 },
            right: { xs: -100 - i * 80, md: -60 - i * 110 },
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
          }}
        />
      ))}

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={{ xs: 5, md: 8 }}
        >
          {/* Left — copy */}
          <Box sx={{ maxWidth: { md: 580 } }}>
            <Chip
              icon={<FavoriteIcon sx={{ fontSize: '14px !important', color: '#f87171 !important' }} />}
              label="For the love of the community"
              size="small"
              sx={{
                mb: 2.5,
                bgcolor: 'rgba(248,113,113,0.12)',
                color: '#fca5a5',
                border: '1px solid rgba(248,113,113,0.25)',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />

            <Typography
              variant="h2"
              fontWeight={800}
              sx={{
                fontSize: { xs: '2rem', sm: '2.4rem', md: '2.8rem' },
                lineHeight: 1.15,
                mb: 2,
                letterSpacing: '-0.5px',
              }}
            >
              The world&apos;s freediving sites,{' '}
              <Box component="span" sx={{ color: '#4fc3f7' }}>
                open to everyone
              </Box>
            </Typography>

            <Typography
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: { xs: '1rem', md: '1.08rem' },
                lineHeight: 1.8,
                mb: 4,
                maxWidth: 500,
              }}
            >
              We built this dive sites directory and give it away — completely free.
              Depth, visibility, marine life, seasonal conditions. Shared by freedivers,
              for freedivers.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
              <Button
                component="a"
                href="https://freedive.one"
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                size="large"
                startIcon={<WaterIcon />}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: '#0077be',
                  '&:hover': { bgcolor: '#005fa3', boxShadow: '0 6px 20px rgba(0,119,190,0.5)' },
                  borderRadius: '50px',
                  px: 3.5,
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: '1rem',
                  boxShadow: '0 4px 14px rgba(0,119,190,0.35)',
                  transition: 'all 0.2s',
                }}
              >
                Explore Dive Sites
              </Button>
            </Stack>
          </Box>

          {/* Right — stat pills */}
          <Stack
            direction={{ xs: 'row', md: 'column' }}
            spacing={{ xs: 2, md: 2.5 }}
            flexShrink={0}
            flexWrap="wrap"
            useFlexGap
          >
            {STATS.map((s) => (
              <Box
                key={s.label}
                sx={{
                  px: { xs: 2.5, md: 4 },
                  py: { xs: 1.5, md: 2.5 },
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(79,195,247,0.18)',
                  backdropFilter: 'blur(10px)',
                  textAlign: 'center',
                  minWidth: { xs: 90, md: 140 },
                }}
              >
                <Typography
                  fontWeight={800}
                  sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, color: '#4fc3f7', lineHeight: 1 }}
                >
                  {s.value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
