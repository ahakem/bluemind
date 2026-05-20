'use client';

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
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
  Button,
  Collapse,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import WaterIcon from '@mui/icons-material/Water';
import PoolIcon from '@mui/icons-material/Pool';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import CountryAutocomplete from '@/components/CountryAutocomplete';
import { CountryType, lookupCountry } from '@/data/countries';
import { Continent, CONTINENTS, getContinent } from '@/data/continents';
import { getActiveDiveSites } from '@/lib/diveSiteService';
import { DiveSite } from '@/types/admin';
import SubmitSiteButton from '@/components/SubmitSiteButton';

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

function DiveSitesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sites, setSites] = useState<DiveSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [waterTypeFilter, setWaterTypeFilter] = useState<string[]>(
    searchParams.get('waterType') ? searchParams.get('waterType')!.split(',') : []
  );
  const [countryFilter, setCountryFilter] = useState<CountryType | null>(null);
  const [continentFilter, setContinentFilter] = useState<Continent | null>(
    (searchParams.get('continent') as Continent) ?? null
  );
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);

  // Sync filters to URL
  const updateUrl = useCallback((params: Record<string, string | null>) => {
    const current = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([k, v]) => {
      if (v) current.set(k, v); else current.delete(k);
    });
    const qs = current.toString();
    router.replace(`/dive-sites${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router]);

  useEffect(() => {
    getActiveDiveSites().then((data) => {
      setSites(data);
      // Restore country filter from URL after sites load
      const countryParam = searchParams.get('country');
      if (countryParam) {
        const found = data.find((s) => s.country.toLowerCase() === countryParam.toLowerCase());
        if (found) {
          const c = lookupCountry(found.country);
          if (c) setCountryFilter(c);
        }
      }
      setLoading(false);
    });
    const dismissed = localStorage.getItem('diveSiteDisclaimerDismissed');
    if (!dismissed) setDisclaimerVisible(true);
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
      const matchWater = waterTypeFilter.length === 0 || waterTypeFilter.includes(site.waterType);
      const matchCountry = !countryFilter || site.country === countryFilter.label;
      const matchContinent = !continentFilter || (() => {
        const c = lookupCountry(site.country);
        return c ? getContinent(c.code) === continentFilter : false;
      })();
      return matchSearch && matchWater && matchCountry && matchContinent;
    });
  }, [sites, search, waterTypeFilter, countryFilter, continentFilter]);

  const handleWaterType = (_: React.MouseEvent<HTMLElement>, values: string[]) => {
    setWaterTypeFilter(values);
    setVisibleCount(24);
    updateUrl({ waterType: values.length ? values.join(',') : null });
  };
  const handleCountryChange = (c: CountryType | null) => {
    setCountryFilter(c);
    if (c) setContinentFilter(null);
    setVisibleCount(24);
    updateUrl({ country: c?.label ?? null, continent: null });
  };
  const handleContinentChange = (c: Continent | null) => {
    setContinentFilter(c);
    if (c) setCountryFilter(null);
    setVisibleCount(24);
    updateUrl({ continent: c ?? null, country: null });
  };
  const handleSearch = (value: string) => {
    setSearch(value);
    updateUrl({ q: value || null });
  };

  const dismissDisclaimer = () => {
    setDisclaimerVisible(false);
    localStorage.setItem('diveSiteDisclaimerDismissed', '1');
  };

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
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', maxWidth: 520, mx: 'auto', mb: 2 }}>
            Explore freediving locations worldwide. Hover a pin for a quick look, click to view full details.
          </Typography>
          <SubmitSiteButton />
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

      {/* Disclaimer banner */}
      <Collapse in={disclaimerVisible}>
        <Box sx={{ bgcolor: '#e8f4fd', borderBottom: '1px solid #b3d9f5' }}>
          <Container maxWidth="lg">
            <Stack direction="row" alignItems="center" spacing={1.5} py={1.25}>
              <InfoOutlinedIcon sx={{ fontSize: 18, color: '#0077be', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#004d80', flexGrow: 1 }}>
                Dive site data is automatically collected and may be inaccurate.
                Always verify depth, conditions, and local regulations before diving.
              </Typography>
              <IconButton size="small" onClick={dismissDisclaimer} sx={{ color: '#0077be', flexShrink: 0 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Container>
        </Box>
      </Collapse>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        {/* Filters */}
        <Box
          sx={{
            bgcolor: 'white',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            p: 2,
            mb: 3,
            boxShadow: 1,
          }}
        >
          <Stack spacing={1.5}>
            {/* Row 1: search + country */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                placeholder="Search by name or location…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
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
                onChange={handleCountryChange}
                label="Country"
                placeholder="All countries"
                sx={{ minWidth: 200 }}
              />
            </Stack>

            {/* Row 2: continent chips (left) + water type (right) */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
              spacing={1}
            >
              <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center">
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mr: 0.5 }}>
                  CONTINENT
                </Typography>
                {CONTINENTS.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    onClick={() => handleContinentChange(continentFilter === c ? null : c)}
                    color={continentFilter === c ? 'primary' : 'default'}
                    variant={continentFilter === c ? 'filled' : 'outlined'}
                    size="small"
                    sx={{ cursor: 'pointer', fontWeight: continentFilter === c ? 700 : 400 }}
                  />
                ))}
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">
                  WATER TYPE
                </Typography>
                <ToggleButtonGroup value={waterTypeFilter} onChange={handleWaterType} size="small">
                  {(['lake', 'sea'] as const).map((t) => (
                    <ToggleButton key={t} value={t} sx={{ textTransform: 'capitalize', px: 1.5, py: 0.4 }}>
                      {WATER_TYPE_LABELS[t]}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        {/* Results count */}
        <Typography variant="body2" color="text.secondary" mb={3}>
          {loading ? 'Loading…' : `Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} site${filtered.length !== 1 ? 's' : ''}`}
        </Typography>

        {/* Grid */}
        <Grid container spacing={3}>
          {filtered.slice(0, visibleCount).map((site) => {
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
                            : 'linear-gradient(90deg, #26a69a, #80cbc4)',
                      }}
                    />
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.05rem', lineHeight: 1.3 }}>
                          {site.name}
                        </Typography>
                        {site.googleRating && (
                          <Typography variant="body2" fontWeight={700} sx={{ color: '#f59e0b', whiteSpace: 'nowrap', ml: 1 }}>
                            ★ {site.googleRating.toFixed(1)}
                          </Typography>
                        )}
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

        {/* Load more */}
        {!loading && visibleCount < filtered.length && (
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setVisibleCount((n) => n + 24)}
              sx={{ borderRadius: 3, px: 5 }}
            >
              Load more ({filtered.length - visibleCount} remaining)
            </Button>
          </Box>
        )}

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

export default function DiveSiteListingClient() {
  return (
    <Suspense>
      <DiveSitesPageInner />
    </Suspense>
  );
}
