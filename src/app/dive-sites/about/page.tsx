import type { Metadata } from 'next';
import { Container, Box, Typography, Divider, Link as MuiLink } from '@mui/material';
import WaterIcon from '@mui/icons-material/Water';
import PublicIcon from '@mui/icons-material/Public';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Link from 'next/link';
import { getActiveDiveSites } from '@/lib/diveSiteService';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'About freedive.one — Free Global Freediving Resource',
  description:
    'freedive.one is a free, community-built directory of freediving locations worldwide. Built and maintained by Blue Mind Freediving, a registered Dutch non-profit.',
  alternates: { canonical: 'https://freedive.one/about' },
  openGraph: {
    title: 'About freedive.one',
    description:
      'A free global directory of freediving locations, built and maintained by Blue Mind Freediving — a registered Dutch non-profit association.',
    url: 'https://freedive.one/about',
  },
};

export default async function FreediveAboutPage() {
  let siteCount = 0;
  let countryCount = 0;

  try {
    const sites = await getActiveDiveSites();
    siteCount = sites.length;
    countryCount = new Set(sites.map((s) => s.country).filter(Boolean)).size;
  } catch {
    // Firestore unavailable — show no number
  }

  const siteLabel = siteCount > 0 ? `${siteCount.toLocaleString()}+` : '—';
  const countryLabel = countryCount > 0 ? `${countryCount}+` : '80+';

  const STATS = [
    { icon: <WaterIcon sx={{ fontSize: 36, color: '#0077be' }} />, value: siteLabel, label: 'Dive sites worldwide' },
    { icon: <PublicIcon sx={{ fontSize: 36, color: '#0077be' }} />, value: countryLabel, label: 'Countries covered' },
    { icon: <FavoriteIcon sx={{ fontSize: 36, color: '#0077be' }} />, value: '100%', label: 'Free, always' },
  ];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          About freedive.one
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          A free, community-built directory of freediving locations worldwide.
        </Typography>
      </Box>

      {/* Stats */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: { xs: 3, md: 6 },
          flexWrap: 'wrap',
          mb: 8,
        }}
      >
        {STATS.map((s) => (
          <Box key={s.label} sx={{ textAlign: 'center' }}>
            {s.icon}
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {s.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {s.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* Mission */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Our mission
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
          We believe knowledge about freediving locations should be freely accessible to every diver,
          regardless of where they are in the world. freedive.one is our contribution to the global
          freediving community — a comprehensive, data-rich directory with depth, visibility, water
          temperature, and conditions information for sites across {countryLabel} countries.
        </Typography>
      </Box>

      {/* What you find */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          What you&apos;ll find
        </Typography>
        <Box component="ul" sx={{ pl: 3, color: 'text.secondary', lineHeight: 2.2 }}>
          <li>{siteLabel} freediving locations worldwide</li>
          <li>Depth, visibility, and water temperature data</li>
          <li>Monthly water temperature charts</li>
          <li>Location maps and access notes</li>
          <li>Filter by country, continent, and water type</li>
        </Box>
      </Box>

      <Divider sx={{ mb: 6 }} />

      {/* About Blue Mind */}
      <Box
        sx={{
          bgcolor: '#f0f7ff',
          borderRadius: 3,
          p: { xs: 3, md: 4 },
          border: '1px solid #c8e0f4',
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Built by Blue Mind Freediving
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 2 }}>
          freedive.one is built and maintained by{' '}
          <MuiLink
            href="https://bluemindfreediving.nl"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ fontWeight: 600 }}
          >
            Blue Mind Freediving
          </MuiLink>
          , a registered Dutch non-profit association (vereniging) based in Amsterdam, Netherlands.
          Founded in 2024 by AIDA-certified freediving instructors and national record holders, our
          mission is to grow and support the freediving community — in the Netherlands and worldwide.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 3 }}>
          <Box>
            <Typography variant="caption" color="text.disabled" display="block">Organization</Typography>
            <Typography variant="body2" fontWeight={600}>Blue Mind Freediving</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.disabled" display="block">Type</Typography>
            <Typography variant="body2" fontWeight={600}>Registered non-profit (vereniging)</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.disabled" display="block">Chamber of Commerce</Typography>
            <Typography variant="body2" fontWeight={600}>KVK: 96935685</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.disabled" display="block">Website</Typography>
            <MuiLink
              href="https://bluemindfreediving.nl"
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              fontWeight={600}
            >
              bluemindfreediving.nl
            </MuiLink>
          </Box>
        </Box>
      </Box>

      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="body2" color="text.disabled">
          freedive.one is completely free to use and will remain so.
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Link href="/dive-sites" style={{ color: '#0077be', fontWeight: 600, textDecoration: 'none' }}>
            Browse dive sites →
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
