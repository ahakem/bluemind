'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Box, Typography, Grid, Card, CardContent, CardActionArea,
  Chip, Stack, TextField, InputAdornment, Button, Divider, Paper,
  Skeleton, IconButton, Dialog, Fab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import PoolIcon from '@mui/icons-material/Pool';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MapIcon from '@mui/icons-material/Map';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';
import { DiveSite } from '@/types/admin';
import { lookupCountry } from '@/data/countries';

const DiveSiteMap = dynamic(() => import('@/components/DiveSiteMap'), {
  ssr: false,
  loading: () => <Skeleton variant="rectangular" width="100%" height="100%" />,
});

const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;
const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WATER_TYPE_LABELS: Record<DiveSite['waterType'], string> = { lake: 'Lake', sea: 'Sea', deep_tank: 'Deep Tank' };
const WATER_TYPE_COLOR: Record<DiveSite['waterType'], string> = { sea: '#0077be', lake: '#26a69a', deep_tank: '#5c6bc0' };
const PAGE_SIZE = 24;
const MAP_WIDTH = 420;

function flagEmoji(code: string) {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );
}

function currentMonthTemp(site: DiveSite): number | null {
  return site.waterTemp[MONTH_KEYS[new Date().getMonth()]] ?? null;
}

function TempBadge({ temp }: { temp: number }) {
  const color = temp <= 8 ? '#1e88e5' : temp <= 15 ? '#26a69a' : '#ef6c00';
  return (
    <Box component="span" sx={{ display: 'inline-block', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.75rem', fontWeight: 700, color: 'white', bgcolor: color }}>
      {temp}°C
    </Box>
  );
}

function bestMonths(sites: DiveSite[]): string[] {
  const avgs = MONTH_KEYS.map((k, i) => {
    const vals = sites.map((s) => s.waterTemp[k]).filter((v): v is number => v !== undefined);
    return { label: MONTH_LABELS[i], avg: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0 };
  });
  const maxAvg = Math.max(...avgs.map((a) => a.avg));
  if (maxAvg === 0) return [];
  return avgs.filter((a) => a.avg >= maxAvg * 0.92).map((a) => a.label);
}

interface Props {
  countrySlug: string;
  countryName: string;
  countryCode: string;
  continent: string;
  sites: DiveSite[];
  nearbySlugs: { name: string; slug: string; count: number }[];
  citySlugs?: { name: string; slug: string; count: number }[];
}

type DepthFilter = 'all' | 'shallow' | 'mid' | 'deep';
type TypeFilter  = 'all' | 'sea' | 'lake' | 'deep_tank';

export default function CountryListingClient({ countryName, countryCode, continent, sites, nearbySlugs, citySlugs = [] }: Props) {
  const [search, setSearch] = useState('');
  const [depthFilter, setDepthFilter] = useState<DepthFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mapOpen, setMapOpen] = useState(true);
  const [mobileMapOpen, setMobileMapOpen] = useState(false);

  const resetPage = () => setVisibleCount(PAGE_SIZE);

  const filtered = useMemo(() => {
    let result = sites;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q));
    }
    if (depthFilter === 'shallow') result = result.filter((s) => s.maxDepth > 0 && s.maxDepth <= 20);
    else if (depthFilter === 'mid')  result = result.filter((s) => s.maxDepth > 20 && s.maxDepth <= 40);
    else if (depthFilter === 'deep') result = result.filter((s) => s.maxDepth > 40);
    if (typeFilter !== 'all') result = result.filter((s) => s.waterType === typeFilter);
    return result;
  }, [sites, search, depthFilter, typeFilter]);

  const seaCount = sites.filter((s) => s.waterType === 'sea').length;
  const lakeCount = sites.filter((s) => s.waterType === 'lake').length;
  const withDepth = sites.filter((s) => s.maxDepth > 0);
  const maxDepth = withDepth.length ? Math.max(...withDepth.map((s) => s.maxDepth)) : null;
  const warm = bestMonths(sites);
  const flag = countryCode ? flagEmoji(countryCode) : '🌊';
  const waterLabel = seaCount > 0 && lakeCount > 0 ? `${seaCount} sea · ${lakeCount} lake` : seaCount > 0 ? 'Sea' : 'Lake';

  const heroGradient = 'linear-gradient(160deg, #001428 0%, #002d5c 55%, #0055a5 100%)';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* Split layout — map starts at top of page on desktop */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>

        {/* Left column */}
        <Box sx={{ flex: 1, minWidth: 0 }}>

          {/* Hero header — desktop: scrolls with content, generous height */}
          <Box sx={{
            background: heroGradient,
            color: 'white',
            px: { xs: 2.5, sm: 4, md: 5 },
            pt: { xs: 3, md: 5 },
            pb: { xs: 3, md: 4.5 },
          }}>
            {/* Breadcrumb */}
            <Stack direction="row" alignItems="center" spacing={0.5} mb={{ xs: 2, md: 3 }}>
              <Typography
                component={Link}
                href="/dive-sites"
                sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', textDecoration: 'none', '&:hover': { color: 'rgba(255,255,255,0.8)' }, transition: 'color 0.15s' }}
              >
                Dive Sites
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>/</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 500 }}>{countryName}</Typography>
            </Stack>

            {/* Title block */}
            <Stack direction="row" alignItems="flex-start" spacing={{ xs: 2, md: 2.5 }}>
              <Typography sx={{ fontSize: { xs: '2.4rem', md: '3rem' }, lineHeight: 1, mt: 0.25, flexShrink: 0 }}>
                {flag}
              </Typography>
              <Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', fontWeight: 500, letterSpacing: '0.04em', mb: 0.5 }}>
                  {continent}
                </Typography>
                <Typography
                  component="h1"
                  fontWeight={800}
                  sx={{ fontSize: { xs: '1.6rem', sm: '1.85rem', md: '2.1rem' }, lineHeight: 1.1, letterSpacing: '-0.01em' }}
                >
                  Freediving in {countryName}
                </Typography>
              </Box>
            </Stack>

            {/* Stats row */}
            <Stack
              direction="row"
              flexWrap="wrap"
              alignItems="center"
              spacing={0}
              useFlexGap
              sx={{ mt: { xs: 2.5, md: 3 }, gap: { xs: '6px 16px', md: '6px 24px' } }}
            >
              <StatItem value={`${sites.length}`} label="sites" />
              {maxDepth && <StatItem value={`${maxDepth}m`} label="max depth" />}
              <StatItem value={waterLabel} />
              {warm.length > 0 && <StatItem value={warm.slice(0, 3).join(' · ')} label="best months" />}
            </Stack>
          </Box>

          {/* Sticky filter bar */}
          <Box sx={{ position: 'sticky', top: 0, zIndex: 20, bgcolor: 'background.paper', borderBottom: '1px solid', borderColor: 'divider' }}>

            {/* Row 1: search + count + map toggle */}
            <Stack direction="row" spacing={1.5} alignItems="center"
              sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 1, md: 1.25 } }}>
              <TextField
                placeholder={`Search in ${countryName}…`}
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                size="small"
                fullWidth
                inputProps={{ 'aria-label': `Search dive sites in ${countryName}` }}
                sx={{
                  flex: 1,
                  maxWidth: { sm: 400 },
                  '& .MuiInputBase-root': { borderRadius: 2.5, fontSize: { xs: '0.9rem', md: '0.875rem' } },
                }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} color="action" aria-hidden="true" /></InputAdornment> }}
              />
              <Typography variant="body2" color="text.disabled" sx={{ display: { xs: 'none', sm: 'block' }, whiteSpace: 'nowrap', fontSize: '0.78rem' }}>
                {filtered.length} {filtered.length === 1 ? 'site' : 'sites'}
              </Typography>
              <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />
              <IconButton
                onClick={() => setMapOpen((v) => !v)}
                size="small"
                aria-label={mapOpen ? 'Hide map' : 'Show map'}
                aria-pressed={mapOpen}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  border: '1px solid',
                  borderColor: mapOpen ? '#0077be' : 'divider',
                  bgcolor: mapOpen ? 'rgba(0,119,190,0.06)' : 'transparent',
                  color: mapOpen ? '#0077be' : 'text.secondary',
                  borderRadius: 1.5,
                  width: 34, height: 34,
                  '&:hover': { bgcolor: mapOpen ? 'rgba(0,119,190,0.12)' : 'grey.100' },
                }}
              >
                <MapIcon sx={{ fontSize: 17 }} aria-hidden="true" />
              </IconButton>
            </Stack>

            {/* Row 2: depth + type filters */}
            <FilterChipsRow
              depthFilter={depthFilter} setDepthFilter={(v) => { setDepthFilter(v); resetPage(); }}
              typeFilter={typeFilter}  setTypeFilter={(v) => { setTypeFilter(v);  resetPage(); }}
              hasBothTypes={seaCount > 0 && lakeCount > 0}
            />

            {/* Row 3: areas chips (horizontal scroll) */}
            {citySlugs.length > 0 && (
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', position: 'relative' }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 0.75,
                  px: { xs: 2, sm: 3, md: 4 }, py: 0.75,
                  overflowX: 'auto',
                  scrollbarWidth: 'thin',
                  '&::-webkit-scrollbar': { height: 3 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 99 },
                }}>
                  <Stack direction="row" alignItems="center" spacing={0.4} sx={{ flexShrink: 0, mr: 0.5 }}>
                    <LocationCityIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                    <Typography variant="caption" sx={{ fontSize: '0.64rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, color: 'text.disabled', whiteSpace: 'nowrap' }}>
                      Areas
                    </Typography>
                  </Stack>
                  {citySlugs.map(({ name, slug, count }) => (
                    <Chip
                      key={slug}
                      component={Link}
                      href={`/dive-sites/city/${slug}`}
                      label={`${name} · ${count}`}
                      size="small"
                      clickable
                      variant="outlined"
                      sx={{ flexShrink: 0, fontSize: '0.72rem', height: 22, textDecoration: 'none', '&:hover': { borderColor: '#0077be', bgcolor: '#f0f7ff' } }}
                    />
                  ))}
                </Box>
                <Box sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 48, background: 'linear-gradient(to right, transparent, white)', pointerEvents: 'none' }} />
              </Box>
            )}
          </Box>

          {/* Cards */}
          <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
            <Typography variant="body2" color="text.secondary" mb={2.5} sx={{ display: { sm: 'none' } }}>
              {filtered.length} {filtered.length === 1 ? 'site' : 'sites'} in {countryName}
            </Typography>

            {filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="h6" color="text.secondary">No sites match your search.</Typography>
                <Button onClick={() => setSearch('')} sx={{ mt: 1 }}>Clear search</Button>
              </Box>
            ) : (
              <>
                <Grid container spacing={2.5}>
                  {filtered.slice(0, visibleCount).map((site) => {
                    const temp = currentMonthTemp(site);
                    return (
                      <Grid key={site.id} size={{ xs: 12, sm: 6, lg: mapOpen ? 6 : 4 }}>
                        <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 1, transition: 'transform 0.2s, box-shadow 0.2s', '&:hover': { transform: 'translateY(-3px)', boxShadow: 5 } }}>
                          <CardActionArea component={Link} href={`/dive-sites/${site.slug}`} sx={{ height: '100%' }}>
                            <Box sx={{ height: 5, bgcolor: WATER_TYPE_COLOR[site.waterType] }} />
                            <CardContent sx={{ p: 2 }}>
                              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '0.98rem', lineHeight: 1.3, mb: 0.5 }}>{site.name}</Typography>
                              {site.location && (
                                <Stack direction="row" alignItems="center" spacing={0.5} mb={1.25}>
                                  <PlaceIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>{site.location}</Typography>
                                </Stack>
                              )}
                              <Typography variant="body2" color="text.secondary"
                                sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 1.5, lineHeight: 1.5, fontSize: '0.82rem' }}>
                                {site.description}
                              </Typography>
                              <Divider sx={{ mb: 1.25 }} />
                              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                <Chip icon={<PoolIcon sx={{ fontSize: '13px !important' }} />} label={WATER_TYPE_LABELS[site.waterType]} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
                                <Chip label={`↓ ${site.maxDepth}m`} size="small" variant="outlined" sx={{ fontSize: '0.72rem', height: 22 }} />
                                {temp !== null && <TempBadge temp={temp} />}
                              </Stack>
                            </CardContent>
                          </CardActionArea>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
                {visibleCount < filtered.length && (
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button variant="outlined" size="large" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)} sx={{ borderRadius: 3, px: 5 }}>
                      Load more ({filtered.length - visibleCount} remaining)
                    </Button>
                  </Box>
                )}
              </>
            )}

            {/* Nearby countries */}
            {nearbySlugs.length > 0 && (
              <Box mt={8}>
                <Divider sx={{ mb: 4 }} />
                <Typography variant="h6" fontWeight={700} mb={2.5}>Also explore in {continent}</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1.5}>
                  {nearbySlugs.map(({ name, slug, count }) => {
                    const c = lookupCountry(name);
                    return (
                      <Paper key={slug} component={Link} href={`/dive-sites/country/${slug}`} variant="outlined"
                        sx={{ px: 2, py: 1.25, borderRadius: 2, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 1, transition: 'all 0.15s', '&:hover': { boxShadow: 3, borderColor: '#0077be', transform: 'translateY(-2px)' } }}>
                        {c && <Typography sx={{ fontSize: '1.2rem', lineHeight: 1 }}>{flagEmoji(c.code)}</Typography>}
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>{name}</Typography>
                          <Typography variant="caption" color="text.secondary">{count} sites</Typography>
                        </Box>
                        <TrendingFlatIcon sx={{ fontSize: 16, color: 'text.disabled', ml: 0.5 }} />
                      </Paper>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>

        {/* Right: map panel — outer clips for layout, inner keeps full width so map never resets */}
        <Box sx={{
          display: { xs: 'none', md: 'block' },
          flexShrink: 0,
          width: mapOpen ? MAP_WIDTH : 0,
          overflow: 'hidden',
          transition: 'width 0.25s ease',
        }}>
          <Box sx={{
            width: MAP_WIDTH,
            position: 'sticky',
            top: 0,
            height: '100vh',
            borderLeft: '1px solid',
            borderColor: 'divider',
          }}>
            <DiveSiteMap sites={filtered} />
          </Box>
        </Box>
      </Box>

      {/* Floating map collapse button */}
      <IconButton
        onClick={() => setMapOpen((v) => !v)}
        size="small"
        aria-label={mapOpen ? 'Hide map panel' : 'Show map panel'}
        aria-pressed={mapOpen}
        sx={{
          display: { xs: 'none', md: 'flex' },
          position: 'fixed',
          right: mapOpen ? MAP_WIDTH : 0,
          top: '50vh',
          transform: 'translateY(-50%)',
          zIndex: 30,
          bgcolor: '#0062b1',
          color: 'white',
          border: 'none',
          borderRadius: '8px 0 0 8px',
          width: 20,
          height: 48,
          boxShadow: '-3px 0 12px rgba(0,0,0,0.18)',
          transition: 'right 0.25s ease',
          '&:hover': { bgcolor: '#004e96' },
          '&:focus-visible': { outline: '2px solid white', outlineOffset: '2px' },
        }}
      >
        {mapOpen ? <ChevronRightIcon sx={{ fontSize: 15 }} aria-hidden="true" /> : <ChevronLeftIcon sx={{ fontSize: 15 }} aria-hidden="true" />}
      </IconButton>

      {/* Mobile: floating Show Map button */}
      <Fab variant="extended" size="medium" onClick={() => setMobileMapOpen(true)}
        aria-label="Open map view"
        sx={{ display: { xs: 'flex', md: 'none' }, position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 50, bgcolor: '#001f3f', color: 'white', px: 3, gap: 1, '&:hover': { bgcolor: '#0077be' }, boxShadow: 4 }}>
        <MapIcon sx={{ fontSize: 18 }} aria-hidden="true" /> Show Map
      </Fab>

      {/* Mobile: fullscreen map */}
      <Dialog fullScreen open={mobileMapOpen} onClose={() => setMobileMapOpen(false)} sx={{ display: { xs: 'block', md: 'none' } }}
        aria-label="Map view">
        <Box sx={{ height: '100%', position: 'relative' }}>
          <DiveSiteMap sites={filtered} />
          <IconButton onClick={() => setMobileMapOpen(false)}
            aria-label="Close map"
            sx={{ position: 'absolute', top: 12, right: 12, bgcolor: 'white', boxShadow: 2, '&:hover': { bgcolor: 'grey.100' }, zIndex: 10 }}>
            <CloseIcon aria-hidden="true" />
          </IconButton>
        </Box>
      </Dialog>
    </Box>
  );
}

const DEPTH_OPTIONS: { label: string; value: DepthFilter }[] = [
  { label: 'All depths', value: 'all' },
  { label: '≤ 20m',      value: 'shallow' },
  { label: '20 – 40m',   value: 'mid' },
  { label: '40m+',       value: 'deep' },
];

const TYPE_OPTIONS: { label: string; value: TypeFilter }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Sea',       value: 'sea' },
  { label: 'Lake',      value: 'lake' },
  { label: 'Deep Tank', value: 'deep_tank' },
];

function FilterChipsRow({
  depthFilter, setDepthFilter,
  typeFilter,  setTypeFilter,
  hasBothTypes,
}: {
  depthFilter: DepthFilter; setDepthFilter: (v: DepthFilter) => void;
  typeFilter:  TypeFilter;  setTypeFilter:  (v: TypeFilter)  => void;
  hasBothTypes: boolean;
}) {
  const activeDepth = { bgcolor: '#0062b1', color: 'white', borderColor: '#0062b1', '&:hover': { bgcolor: '#004e96' } };
  const activeType  = { bgcolor: '#1a7f72', color: 'white', borderColor: '#1a7f72', '&:hover': { bgcolor: '#146258' } };
  const inactive    = { '&:hover': { borderColor: '#0062b1', bgcolor: '#f0f7ff' } };

  return (
    <Box sx={{ borderTop: '1px solid', borderColor: 'divider', position: 'relative' }}>
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 0.75,
        px: { xs: 2, sm: 3, md: 4 }, py: 0.75,
        overflowX: 'auto', scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': { height: 3 },
        '&::-webkit-scrollbar-thumb': { bgcolor: 'grey.300', borderRadius: 99 },
      }}>
        <Typography variant="caption" sx={{ fontSize: '0.64rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, color: 'text.disabled', flexShrink: 0, mr: 0.25 }}>
          Depth
        </Typography>
        {DEPTH_OPTIONS.map(({ label, value }) => (
          <Chip key={value} label={label} size="small" clickable
            onClick={() => setDepthFilter(value)}
            aria-pressed={depthFilter === value}
            variant={depthFilter === value ? 'filled' : 'outlined'}
            sx={{ flexShrink: 0, fontSize: '0.72rem', height: 24, ...(depthFilter === value ? activeDepth : inactive) }}
          />
        ))}

        {hasBothTypes && (
          <>
            <Box aria-hidden="true" sx={{ width: "1px", height: 16, bgcolor: "divider", flexShrink: 0, mx: 0.5 }} />
            <Typography variant="caption" sx={{ fontSize: '0.64rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, color: 'text.disabled', flexShrink: 0, mr: 0.25 }}>
              Type
            </Typography>
            {TYPE_OPTIONS.map(({ label, value }) => (
              <Chip key={value} label={label} size="small" clickable
                onClick={() => setTypeFilter(value)}
                aria-pressed={typeFilter === value}
                variant={typeFilter === value ? 'filled' : 'outlined'}
                sx={{ flexShrink: 0, fontSize: '0.72rem', height: 24, ...(typeFilter === value ? activeType : inactive) }}
              />
            ))}
          </>
        )}
      </Box>
      <Box sx={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, background: 'linear-gradient(to right, transparent, white)', pointerEvents: 'none' }} />
    </Box>
  );
}

function StatItem({ value, label }: { value: string; label?: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>
        {value}
      </Typography>
      {label && (
        <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>
          {label}
        </Typography>
      )}
    </Box>
  );
}
