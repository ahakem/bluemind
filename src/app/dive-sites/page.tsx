'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
  TextField,
  InputAdornment,
  Divider,
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import WaterIcon from '@mui/icons-material/Water';
import PoolIcon from '@mui/icons-material/Pool';
import Link from 'next/link';
import CountryAutocomplete from '@/components/CountryAutocomplete';
import { CountryType, lookupCountry } from '@/data/countries';
import { getActiveDiveSites } from '@/lib/diveSiteService';
import { DiveSite } from '@/types/admin';

// Leaflet must be client-side only (no SSR)
const DiveSiteMap = dynamic(() => import('@/components/DiveSiteMap'), {
  ssr: false,
  loading: () => (
    <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 0 }} />
  ),
});

const WATER_TYPE_LABELS: Record<DiveSite['waterType'], string> = {
  lake: 'Lake',
  sea: 'Sea',
  quarry: 'Quarry',
  river: 'River',
  pool: 'Pool',
};

const DIFFICULTY_COLORS: Record<DiveSite['difficulty'], 'success' | 'warning' | 'error'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
};

const DIFFICULTY_LABELS: Record<DiveSite['difficulty'], string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;

function currentMonthTemp(site: DiveSite): number | null {
  const key = MONTH_KEYS[new Date().getMonth()];
  return site.waterTemp[key] ?? null;
}

function TempBadge({ temp }: { temp: number }) {
  const color = temp <= 8 ? '#1e88e5' : temp <= 15 ? '#26a69a' : '#ef6c00';
  return (
    <Box component="span" sx={{ display: 'inline-block', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.75rem', fontWeight: 700, color: 'white', bgcolor: color }}>
      {temp}°C
    </Box>
  );
}

export default function DiveSitesPage() {
  const [sites, setSites] = useState<DiveSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string[]>([]);
  const [waterTypeFilter, setWaterTypeFilter] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState<CountryType | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    getActiveDiveSites().then((data) => {
      setSites(data);
      setLoading(false);
    });
  }, []);

  // Countries that actually have sites — limits what the filter shows
  const presentCountryLabels = useMemo(
    () => [...new Set(sites.map((s) => s.country))],
    [sites]
  );

  const filtered = useMemo(() => {
    return sites.filter((site) => {
      const matchSearch =
        !search ||
        site.name.toLowerCase().includes(search.toLowerCase()) ||
        site.location.toLowerCase().includes(search.toLowerCase()) ||
        site.country.toLowerCase().includes(search.toLowerCase());
      const matchDiff = difficultyFilter.length === 0 || difficultyFilter.includes(site.difficulty);
      const matchWater = waterTypeFilter.length === 0 || waterTypeFilter.includes(site.waterType);
      const matchCountry = !countryFilter || site.country === countryFilter.label;
      return matchSearch && matchDiff && matchWater && matchCountry;
    });
  }, [sites, search, difficultyFilter, waterTypeFilter, countryFilter]);

  const handleDifficulty = (_: React.MouseEvent<HTMLElement>, values: string[]) => setDifficultyFilter(values);
  const handleWaterType = (_: React.MouseEvent<HTMLElement>, values: string[]) => setWaterTypeFilter(values);

  const handleMapSelect = useCallback((site: DiveSite) => {
    setHighlightedId(site.id);
    setTimeout(() => {
      document.getElementById(`site-card-${site.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero header — compact, map is the real hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #001f3f 0%, #003d7a 60%, #0077be 100%)',
          color: 'white',
          pt: { xs: 7, md: 9 },
          pb: 0,
        }}
      >
        <Container maxWidth="lg" sx={{ textAlign: 'center', pb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} mb={1.5}>
            <WaterIcon sx={{ fontSize: 36, color: '#4fc3f7' }} />
            <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.8rem', md: '2.4rem' } }}>
              Dive Sites
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 520, mx: 'auto' }}>
            Explore freediving locations worldwide. Hover a pin for a quick look, click to view full details.
          </Typography>
        </Container>

        {/* Full-width map — flush against the bottom of the hero */}
        <Box sx={{ width: '100%', height: { xs: 340, sm: 420, md: 520 }, mt: 2, position: 'relative' }}>
          {!loading && (
            <DiveSiteMap sites={filtered.length > 0 ? filtered : sites} onSelect={handleMapSelect} />
          )}
          {loading && (
            <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: 'rgba(255,255,255,0.08)' }} />
          )}
          {/* Gradient fade at bottom to blend into white page */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 48,
              background: 'linear-gradient(to bottom, transparent, #f5f5f5)',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          />
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Filters */}
        <Box
          sx={{
            bgcolor: 'white',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: 3,
            mb: 4,
            boxShadow: 1,
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                placeholder="Search by name or location…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <CountryAutocomplete
                limitToLabels={presentCountryLabels}
                value={countryFilter}
                onChange={setCountryFilter}
                label="Country"
                placeholder="All countries"
                sx={{ minWidth: 220 }}
              />
            </Stack>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" mb={0.5} display="block">
                  DIFFICULTY
                </Typography>
                <ToggleButtonGroup value={difficultyFilter} onChange={handleDifficulty} size="small" sx={{ flexWrap: 'wrap' }}>
                  {(['beginner', 'intermediate', 'advanced'] as const).map((d) => (
                    <ToggleButton key={d} value={d} sx={{ textTransform: 'capitalize', px: 2 }}>
                      {DIFFICULTY_LABELS[d]}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

              <Box>
                <Typography variant="caption" fontWeight={600} color="text.secondary" mb={0.5} display="block">
                  WATER TYPE
                </Typography>
                <ToggleButtonGroup value={waterTypeFilter} onChange={handleWaterType} size="small" sx={{ flexWrap: 'wrap' }}>
                  {(['lake', 'sea', 'quarry', 'river'] as const).map((t) => (
                    <ToggleButton key={t} value={t} sx={{ textTransform: 'capitalize', px: 2 }}>
                      {WATER_TYPE_LABELS[t]}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Results count */}
        <Typography variant="body2" color="text.secondary" mb={3}>
          {loading ? 'Loading…' : `${filtered.length} site${filtered.length !== 1 ? 's' : ''} found`}
        </Typography>

        {/* Grid */}
        <Grid container spacing={3}>
          {filtered.map((site) => {
            const temp = currentMonthTemp(site);
            const isHighlighted = highlightedId === site.id;
            return (
              <Grid key={site.id} id={`site-card-${site.id}`} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    boxShadow: isHighlighted ? 8 : 2,
                    outline: isHighlighted ? '2px solid #0077be' : '2px solid transparent',
                    transition: 'transform 0.2s, box-shadow 0.2s, outline 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                  }}
                  onAnimationEnd={() => setHighlightedId(null)}
                >
                  <CardActionArea component={Link} href={`/dive-sites/${site.slug}`} sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        height: 6,
                        background:
                          site.waterType === 'sea'
                            ? 'linear-gradient(90deg, #0077be, #4fc3f7)'
                            : site.waterType === 'lake'
                            ? 'linear-gradient(90deg, #26a69a, #80cbc4)'
                            : site.waterType === 'quarry'
                            ? 'linear-gradient(90deg, #546e7a, #90a4ae)'
                            : 'linear-gradient(90deg, #1565c0, #64b5f6)',
                      }}
                    />
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.05rem', lineHeight: 1.3 }}>
                          {site.name}
                        </Typography>
                        <Chip
                          label={DIFFICULTY_LABELS[site.difficulty]}
                          color={DIFFICULTY_COLORS[site.difficulty]}
                          size="small"
                          sx={{ ml: 1, flexShrink: 0, fontWeight: 600 }}
                        />
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={0.5} mb={2}>
                        <PlaceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {site.location}, {site.country}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 2,
                          lineHeight: 1.5,
                        }}
                      >
                        {site.description}
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          icon={<PoolIcon sx={{ fontSize: '14px !important' }} />}
                          label={WATER_TYPE_LABELS[site.waterType]}
                          size="small"
                          variant="outlined"
                        />
                        <Chip label={`↓ ${site.maxDepth}m`} size="small" variant="outlined" />
                        <Chip label={`${site.visibility.min}–${site.visibility.max}m vis`} size="small" variant="outlined" />
                        {temp !== null && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TempBadge temp={temp} />
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {!loading && filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography variant="h6" color="text.secondary">No sites match your filters.</Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Try adjusting the search or removing filters.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}
