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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import WaterIcon from '@mui/icons-material/Water';
import PoolIcon from '@mui/icons-material/Pool';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import TuneIcon from '@mui/icons-material/Tune';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import CountryAutocomplete from '@/components/CountryAutocomplete';
import { CountryType, lookupCountry } from '@/data/countries';
import { Continent, CONTINENTS, getContinent, getContinents } from '@/data/continents';
import StarIcon from '@mui/icons-material/Star';
import ScubaDivingIcon from '@mui/icons-material/ScubaDiving';
import { getActiveDiveSites, getDiveLogCounts, getAverageRatings } from '@/lib/diveSiteService';
import { DiveSite } from '@/types/admin';
import SubmitSiteButton from '@/components/SubmitSiteButton';
import ExploreByCountry from '@/components/ExploreByCountry';
import DiverLoader from '@/components/DiverLoader';

const DiveSiteMap = dynamic(() => import('@/components/DiveSiteMap'), {
  ssr: false,
  loading: () => (
    <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 0 }} />
  ),
});

const WATER_TYPE_LABELS: Record<DiveSite['waterType'], string> = { lake: 'Lake', sea: 'Sea' };
const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;
const BOOKMARKS_KEY = 'bm_saved_sites';

function currentMonthTemp(site: DiveSite): number | null {
  return site.waterTemp[MONTH_KEYS[new Date().getMonth()]] ?? null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : km < 100 ? `${km.toFixed(0)}km` : `${Math.round(km)}km`;
}

function TempBadge({ temp }: { temp: number }) {
  const color = temp <= 8 ? '#1e88e5' : temp <= 15 ? '#26a69a' : '#ef6c00';
  return (
    <Box component="span" sx={{ display: 'inline-block', px: 1, py: 0.25, borderRadius: 1, fontSize: '0.75rem', fontWeight: 700, color: 'white', bgcolor: color }}>
      {temp}°C
    </Box>
  );
}

function DiveSitesPageInner({ initialSites }: { initialSites?: DiveSite[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sites, setSites] = useState<DiveSite[]>(initialSites ?? []);
  const [loading, setLoading] = useState(!initialSites);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(24);
  const [disclaimerVisible, setDisclaimerVisible] = useState(false);

  // Community stats
  const [diveCounts, setDiveCounts] = useState<Map<string, number>>(new Map());
  const [communityRatings, setCommunityRatings] = useState<Map<string, { avg: number; count: number }>>(new Map());

  // Recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState<DiveSite[]>([]);

  // ── Basic filters ─────────────────────────────────────────────────────────
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [waterTypeFilter, setWaterTypeFilter] = useState<string[]>(
    searchParams.get('waterType') ? searchParams.get('waterType')!.split(',') : []
  );
  const [countryFilter, setCountryFilter] = useState<CountryType | null>(null);
  const [continentFilter, setContinentFilter] = useState<Continent | null>(
    (searchParams.get('continent') as Continent) ?? null
  );

  // ── Advanced filters ──────────────────────────────────────────────────────
  const [moreOpen, setMoreOpen] = useState(false);
  const [minDepth, setMinDepth] = useState(0);
  const [minVisibility, setMinVisibility] = useState(0);
  const [minTemp, setMinTemp] = useState(0);

  // ── Bookmarks ─────────────────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [savedOnly, setSavedOnly] = useState(false);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  // ── Near me ───────────────────────────────────────────────────────────────
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeLoading, setNearMeLoading] = useState(false);
  const [nearMeError, setNearMeError] = useState('');

  const handleNearMe = () => {
    if (userPos) { setUserPos(null); return; }
    if (!navigator.geolocation) { setNearMeError('Geolocation not supported'); return; }
    setNearMeLoading(true);
    setNearMeError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearMeLoading(false);
        setVisibleCount(24);
      },
      () => { setNearMeError('Location access denied'); setNearMeLoading(false); },
      { timeout: 8000 }
    );
  };

  // ── Data load ─────────────────────────────────────────────────────────────
  const updateUrl = useCallback((params: Record<string, string | null>) => {
    const current = new URLSearchParams(window.location.search);
    Object.entries(params).forEach(([k, v]) => {
      if (v) current.set(k, v); else current.delete(k);
    });
    const qs = current.toString();
    router.replace(`/dive-sites${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [router]);

  useEffect(() => {
    const loadSites = initialSites
      ? Promise.resolve(initialSites)
      : getActiveDiveSites();

    loadSites.then((data) => {
      if (!initialSites) setSites(data);
      const countryParam = searchParams.get('country');
      if (countryParam) {
        const found = data.find((s) => s.country.toLowerCase() === countryParam.toLowerCase());
        if (found) { const c = lookupCountry(found.country); if (c) setCountryFilter(c); }
      }
      if (!initialSites) setLoading(false);
      // Recently viewed — cross-reference after sites loaded
      try {
        const stored = localStorage.getItem('bm_recently_viewed');
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          const found = ids.map((id) => data.find((s) => s.id === id)).filter(Boolean) as DiveSite[];
          setRecentlyViewed(found);
        }
      } catch {}
    });
    const dismissed = localStorage.getItem('diveSiteDisclaimerDismissed');
    if (!dismissed) setDisclaimerVisible(true);
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY);
      if (stored) setBookmarks(new Set(JSON.parse(stored)));
    } catch {}
    // Community stats — fetch in background, non-blocking
    Promise.all([getDiveLogCounts(), getAverageRatings()])
      .then(([counts, ratings]) => { setDiveCounts(counts); setCommunityRatings(ratings); })
      .catch(() => {});
  }, []);

  const presentCountryLabels = useMemo(
    () => [...new Set(sites.map((s) => s.country))],
    [sites]
  );

  // ── Filtered + sorted sites ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = sites.filter((site) => {
      if (search && !site.name.toLowerCase().includes(search.toLowerCase())
        && !site.location.toLowerCase().includes(search.toLowerCase())
        && !site.country.toLowerCase().includes(search.toLowerCase())) return false;
      if (waterTypeFilter.length > 0 && !waterTypeFilter.includes(site.waterType)) return false;
      if (countryFilter && site.country !== countryFilter.label) return false;
      if (continentFilter) {
        const c = lookupCountry(site.country);
        if (!c || !getContinents(c.code).includes(continentFilter)) return false;
      }
      if (minDepth > 0 && site.maxDepth < minDepth) return false;
      if (minVisibility > 0 && (site.visibility?.max ?? 0) < minVisibility) return false;
      if (minTemp > 0) {
        const temp = currentMonthTemp(site);
        if (temp === null || temp < minTemp) return false;
      }
      if (savedOnly && !bookmarks.has(site.id)) return false;
      return true;
    });

    if (userPos) {
      result = [...result]
        .filter((s) => s.coordinates?.lat && s.coordinates?.lng)
        .sort((a, b) =>
          haversineKm(userPos.lat, userPos.lng, a.coordinates.lat, a.coordinates.lng) -
          haversineKm(userPos.lat, userPos.lng, b.coordinates.lat, b.coordinates.lng)
        );
    }

    return result;
  }, [sites, search, waterTypeFilter, countryFilter, continentFilter, minDepth, minVisibility, minTemp, savedOnly, bookmarks, userPos]);

  // ── Handler helpers ───────────────────────────────────────────────────────
  const handleWaterType = (_: React.MouseEvent<HTMLElement>, values: string[]) => {
    setWaterTypeFilter(values); setVisibleCount(24);
    updateUrl({ waterType: values.length ? values.join(',') : null });
  };
  const handleCountryChange = (c: CountryType | null) => {
    setCountryFilter(c); if (c) setContinentFilter(null);
    setVisibleCount(24); updateUrl({ country: c?.label ?? null, continent: null });
  };
  const handleContinentChange = (c: Continent | null) => {
    setContinentFilter(c); if (c) setCountryFilter(null);
    setVisibleCount(24); updateUrl({ continent: c ?? null, country: null });
  };
  const handleSearch = (value: string) => {
    setSearch(value); updateUrl({ q: value || null });
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

  const hasAdvancedFilters = minDepth > 0 || minVisibility > 0 || minTemp > 0;
  const activeFilterCount = (search ? 1 : 0) + (waterTypeFilter.length > 0 ? 1 : 0)
    + (countryFilter ? 1 : 0) + (continentFilter ? 1 : 0)
    + (hasAdvancedFilters ? 1 : 0) + (savedOnly ? 1 : 0) + (userPos ? 1 : 0);

  // Country stats for banner
  const countryStats = useMemo(() => {
    if (!countryFilter || loading) return null;
    const countrySites = sites.filter((s) => s.country === countryFilter.label);
    if (!countrySites.length) return null;
    const withDepth = countrySites.filter((s) => s.maxDepth > 0);
    const avgDepth = withDepth.length
      ? Math.round(withDepth.reduce((sum, s) => sum + s.maxDepth, 0) / withDepth.length)
      : null;
    const seaCount = countrySites.filter((s) => s.waterType === 'sea').length;
    const lakeCount = countrySites.filter((s) => s.waterType === 'lake').length;
    return { total: countrySites.length, avgDepth, seaCount, lakeCount };
  }, [countryFilter, sites, loading]);

  if (loading) return <DiverLoader />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Compact header bar */}
      <Box sx={{ background: 'linear-gradient(135deg, #001f3f 0%, #003d7a 60%, #0077be 100%)', color: 'white' }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" justifyContent="space-between" py={1.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <WaterIcon sx={{ fontSize: 20, color: '#4fc3f7' }} />
              <Typography fontWeight={800} sx={{ fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
                Dive Sites
              </Typography>
              {!loading && (
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.55)', ml: 0.5 }}>
                  {sites.length.toLocaleString()} locations worldwide
                </Typography>
              )}
            </Stack>
            <SubmitSiteButton />
          </Stack>
        </Container>

        {/* Full-width map — the real hero */}
        <Box sx={{ width: '100%', height: { xs: 340, sm: 420, md: 520 }, position: 'relative' }}>
          <DiveSiteMap sites={filtered.length > 0 ? filtered : sites} onSelect={handleMapSelect} />
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, background: 'linear-gradient(to bottom, transparent, #f5f5f5)', pointerEvents: 'none', zIndex: 1000 }} />
        </Box>
      </Box>

      {/* Disclaimer */}
      <Collapse in={disclaimerVisible}>
        <Box sx={{ bgcolor: '#e8f4fd', borderBottom: '1px solid #b3d9f5' }}>
          <Container maxWidth="lg">
            <Stack direction="row" alignItems="center" spacing={1.5} py={1.25}>
              <InfoOutlinedIcon sx={{ fontSize: 18, color: '#0077be', flexShrink: 0 }} />
              <Typography variant="body2" sx={{ color: '#004d80', flexGrow: 1 }}>
                Dive site data is automatically collected and may be inaccurate. Always verify depth, conditions, and local regulations before diving.
              </Typography>
              <IconButton size="small" onClick={dismissDisclaimer} aria-label="Dismiss disclaimer" sx={{ color: '#0077be', flexShrink: 0 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Container>
        </Box>
      </Collapse>

      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* ── Filter box ── */}
        <Box sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 2, mb: 3, boxShadow: 1 }}>
          <Stack spacing={1.5}>

            {/* Row 1: search + country */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                placeholder="Search by name or location…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                size="small" fullWidth
                inputProps={{ 'aria-label': 'Search dive sites by name or location' }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" aria-hidden="true" /></InputAdornment> }}
              />
              <CountryAutocomplete
                limitToLabels={presentCountryLabels}
                value={countryFilter}
                onChange={handleCountryChange}
                label="Country" placeholder="All countries"
                sx={{ minWidth: 200 }}
              />
            </Stack>

            {/* Row 2: continent + water type */}
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1}>
              <Stack direction="row" flexWrap="wrap" gap={0.75} alignItems="center">
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mr: 0.5 }}>CONTINENT</Typography>
                {CONTINENTS.map((c) => (
                  <Chip key={c} label={c}
                    onClick={() => handleContinentChange(continentFilter === c ? null : c)}
                    color={continentFilter === c ? 'primary' : 'default'}
                    variant={continentFilter === c ? 'filled' : 'outlined'}
                    size="small"
                    aria-pressed={continentFilter === c}
                    sx={{ cursor: 'pointer', fontWeight: continentFilter === c ? 700 : 400 }}
                  />
                ))}
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary">WATER TYPE</Typography>
                <ToggleButtonGroup value={waterTypeFilter} onChange={handleWaterType} size="small" aria-label="Filter by water type">
                  {(['lake', 'sea'] as const).map((t) => (
                    <ToggleButton key={t} value={t} sx={{ textTransform: 'capitalize', px: 1.5, py: 0.4 }}>
                      {WATER_TYPE_LABELS[t]}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            </Stack>

            {/* Row 3: near me + saved + more filters */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {/* Near me */}
                <Button
                  size="small"
                  variant={userPos ? 'contained' : 'outlined'}
                  startIcon={<MyLocationIcon sx={{ fontSize: '15px !important' }} />}
                  onClick={handleNearMe}
                  disabled={nearMeLoading}
                  aria-pressed={!!userPos}
                  sx={{
                    borderRadius: 5, fontSize: '0.75rem', py: 0.4, px: 1.5,
                    ...(userPos ? { bgcolor: '#0077be', '&:hover': { bgcolor: '#005f99' } } : {}),
                  }}
                >
                  {nearMeLoading ? 'Locating…' : userPos ? 'Near me ✓' : 'Near me'}
                </Button>

                {/* Saved */}
                <Button
                  size="small"
                  variant={savedOnly ? 'contained' : 'outlined'}
                  startIcon={savedOnly ? <BookmarkIcon sx={{ fontSize: '15px !important' }} /> : <BookmarkBorderIcon sx={{ fontSize: '15px !important' }} />}
                  onClick={() => { setSavedOnly((v) => !v); setVisibleCount(24); }}
                  aria-pressed={savedOnly}
                  sx={{
                    borderRadius: 5, fontSize: '0.75rem', py: 0.4, px: 1.5,
                    ...(savedOnly ? { bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } } : {}),
                  }}
                >
                  Saved{bookmarks.size > 0 ? ` (${bookmarks.size})` : ''}
                </Button>

                {nearMeError && (
                  <Typography variant="caption" color="error" sx={{ alignSelf: 'center' }}>{nearMeError}</Typography>
                )}
              </Stack>

              {/* More filters toggle */}
              <Button
                size="small"
                variant="text"
                startIcon={<TuneIcon sx={{ fontSize: '15px !important' }} />}
                endIcon={<ExpandMoreIcon sx={{ fontSize: '15px !important', transform: moreOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
                onClick={() => setMoreOpen((v) => !v)}
                aria-expanded={moreOpen}
                aria-controls="advanced-filters"
                sx={{ fontSize: '0.75rem', color: hasAdvancedFilters ? 'primary.main' : 'text.secondary', fontWeight: hasAdvancedFilters ? 700 : 400 }}
              >
                {hasAdvancedFilters ? 'Filters active' : 'More filters'}
              </Button>
            </Stack>

            {/* Row 4: advanced filters (collapsible) */}
            <Collapse in={moreOpen} id="advanced-filters">
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} pt={0.5}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Min depth</InputLabel>
                  <Select label="Min depth" value={minDepth} onChange={(e) => { setMinDepth(e.target.value as number); setVisibleCount(24); }}>
                    <MenuItem value={0}>Any depth</MenuItem>
                    <MenuItem value={10}>10m+</MenuItem>
                    <MenuItem value={20}>20m+</MenuItem>
                    <MenuItem value={30}>30m+</MenuItem>
                    <MenuItem value={50}>50m+</MenuItem>
                    <MenuItem value={100}>100m+</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Min visibility</InputLabel>
                  <Select label="Min visibility" value={minVisibility} onChange={(e) => { setMinVisibility(e.target.value as number); setVisibleCount(24); }}>
                    <MenuItem value={0}>Any visibility</MenuItem>
                    <MenuItem value={5}>5m+</MenuItem>
                    <MenuItem value={10}>10m+</MenuItem>
                    <MenuItem value={20}>20m+</MenuItem>
                    <MenuItem value={30}>30m+</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Min temp this month</InputLabel>
                  <Select label="Min temp this month" value={minTemp} onChange={(e) => { setMinTemp(e.target.value as number); setVisibleCount(24); }}>
                    <MenuItem value={0}>Any temperature</MenuItem>
                    <MenuItem value={15}>15°C+</MenuItem>
                    <MenuItem value={20}>20°C+</MenuItem>
                    <MenuItem value={25}>25°C+</MenuItem>
                    <MenuItem value={28}>28°C+</MenuItem>
                  </Select>
                </FormControl>
                {hasAdvancedFilters && (
                  <Button size="small" onClick={() => { setMinDepth(0); setMinVisibility(0); setMinTemp(0); setVisibleCount(24); }}
                    sx={{ alignSelf: 'center', color: 'text.secondary', fontSize: '0.75rem' }}>
                    Clear
                  </Button>
                )}
              </Stack>
            </Collapse>
          </Stack>
        </Box>

        {/* Country banner */}
        {countryFilter && countryStats && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f7ff', border: '1px solid #b3d9f5', borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}>
              <Box>
                <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                  Freediving in {countryFilter.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.25}>
                  {countryStats.total} sites
                  {countryStats.avgDepth ? ` · avg depth ${countryStats.avgDepth}m` : ''}
                  {countryStats.seaCount > 0 && countryStats.lakeCount > 0
                    ? ` · ${countryStats.seaCount} sea, ${countryStats.lakeCount} lake`
                    : countryStats.seaCount > 0 ? ' · sea sites' : ' · lake sites'}
                </Typography>
              </Box>
              <Button size="small" onClick={() => handleCountryChange(null)} sx={{ flexShrink: 0 }}>
                Clear country
              </Button>
            </Stack>
          </Box>
        )}

        {/* Destination strip — compact country scroll, shown when no filters active */}
        {!loading && !search && !countryFilter && !continentFilter && !savedOnly && !userPos && sites.length > 0 && (
          <ExploreByCountry sites={sites} />
        )}

        {/* Recently viewed strip */}
        {recentlyViewed.length > 0 && !savedOnly && !search && (
          <Box mb={3}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
              RECENTLY VIEWED
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
              {recentlyViewed.map((site) => (
                <Box
                  key={site.id}
                  component={Link}
                  href={`/dive-sites/${site.slug}`}
                  aria-label={`${site.name}, ${site.country}`}
                  sx={{
                    flexShrink: 0, textDecoration: 'none',
                    bgcolor: 'white', border: '1px solid', borderColor: 'divider',
                    borderRadius: 2, px: 1.5, py: 1, minWidth: 160, maxWidth: 200,
                    transition: 'box-shadow 0.15s',
                    '&:hover': { boxShadow: 3, borderColor: '#0077be' },
                    '&:focus-visible': { outline: '2px solid #0077be', outlineOffset: '2px' },
                  }}
                >
                  <Box sx={{ height: 3, borderRadius: 1, mb: 0.75, bgcolor: site.waterType === 'sea' ? '#0077be' : '#26a69a' }} />
                  <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: '0.82rem', color: 'text.primary' }}>
                    {site.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {site.country}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Results count */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="body2" color="text.secondary">
            {`${filtered.length} site${filtered.length !== 1 ? 's' : ''}${activeFilterCount > 0 ? ' match your filters' : ''}`}
          </Typography>
          {userPos && (
            <Typography variant="caption" color="primary" fontWeight={600}>
              Sorted by distance from your location
            </Typography>
          )}
        </Stack>

        {/* Grid */}
        <Grid container spacing={3}>
          {filtered.slice(0, visibleCount).map((site) => {
            const temp = currentMonthTemp(site);
            const isHighlighted = highlightedId === site.id;
            const isBookmarked = bookmarks.has(site.id);
            const dist = userPos && site.coordinates?.lat && site.coordinates?.lng
              ? haversineKm(userPos.lat, userPos.lng, site.coordinates.lat, site.coordinates.lng)
              : null;
            const rating = communityRatings.get(site.id);
            const dives = diveCounts.get(site.id);

            return (
              <Grid key={site.id} id={`site-card-${site.id}`} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    height: '100%', display: 'flex', flexDirection: 'column',
                    borderRadius: 3, position: 'relative',
                    boxShadow: isHighlighted ? 8 : 2,
                    outline: isHighlighted ? '2px solid #0077be' : '2px solid transparent',
                    transition: 'transform 0.2s, box-shadow 0.2s, outline 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                  }}
                  onAnimationEnd={() => setHighlightedId(null)}
                >
                  {/* Bookmark button — outside CardActionArea so clicks don't navigate */}
                  <IconButton
                    size="small"
                    onClick={() => toggleBookmark(site.id)}
                    aria-label={isBookmarked ? `Remove ${site.name} from saved` : `Save ${site.name}`}
                    aria-pressed={isBookmarked}
                    sx={{
                      position: 'absolute', top: 10, right: 10, zIndex: 2,
                      bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)',
                      width: 28, height: 28,
                      '&:hover': { bgcolor: 'white' },
                      '&:focus-visible': { outline: '2px solid #0077be', outlineOffset: '2px' },
                    }}
                  >
                    {isBookmarked
                      ? <BookmarkIcon sx={{ fontSize: 15, color: '#0077be' }} />
                      : <BookmarkBorderIcon sx={{ fontSize: 15 }} />}
                  </IconButton>

                  <CardActionArea component={Link} href={`/dive-sites/${site.slug}`} sx={{ flexGrow: 1 }}>
                    <Box sx={{ height: 6, background: site.waterType === 'sea' ? 'linear-gradient(90deg, #0077be, #4fc3f7)' : 'linear-gradient(90deg, #26a69a, #80cbc4)' }} />
                    <CardContent sx={{ p: 2.5, pr: 5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={0.5}>
                        <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.05rem', lineHeight: 1.3 }}>
                          {site.name}
                        </Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ ml: 1, flexShrink: 0 }}>
                          {rating && (
                            <Stack direction="row" alignItems="center" spacing={0.25}>
                              <StarIcon sx={{ fontSize: 13, color: '#f59e0b' }} />
                              <Typography variant="caption" fontWeight={700} sx={{ color: '#f59e0b', fontSize: '0.72rem' }}>
                                {rating.avg.toFixed(1)}
                              </Typography>
                            </Stack>
                          )}
                          {!rating && site.googleRating && (
                            <Typography variant="caption" fontWeight={700} sx={{ color: '#f59e0b', fontSize: '0.72rem' }}>
                              ★ {site.googleRating.toFixed(1)}
                            </Typography>
                          )}
                          {dives && dives > 0 && (
                            <Stack direction="row" alignItems="center" spacing={0.25}>
                              <ScubaDivingIcon sx={{ fontSize: 13, color: '#0077be' }} />
                              <Typography variant="caption" sx={{ color: '#0077be', fontSize: '0.72rem', fontWeight: 600 }}>
                                {dives}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={0.75} mb={2} flexWrap="wrap" useFlexGap>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <PlaceIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {site.location}, {site.country}
                          </Typography>
                        </Stack>
                        {dist !== null && (
                          <Chip
                            label={formatDist(dist)}
                            size="small"
                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: '#e8f5e9', color: '#2e7d32', border: 'none' }}
                          />
                        )}
                      </Stack>

                      <Typography
                        variant="body2" color="text.secondary"
                        sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2, lineHeight: 1.5 }}
                      >
                        {site.description}
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip icon={<PoolIcon sx={{ fontSize: '14px !important' }} />} label={WATER_TYPE_LABELS[site.waterType]} size="small" variant="outlined" />
                        <Chip label={`↓ ${site.maxDepth}m`} size="small" variant="outlined" />
                        <Chip label={`${site.visibility.min}–${site.visibility.max}m vis`} size="small" variant="outlined" />
                        {temp !== null && <Box sx={{ display: 'flex', alignItems: 'center' }}><TempBadge temp={temp} /></Box>}
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
            <Button variant="outlined" size="large" onClick={() => setVisibleCount((n) => n + 24)} sx={{ borderRadius: 3, px: 5 }}>
              Load more ({filtered.length - visibleCount} remaining)
            </Button>
          </Box>
        )}

        {!loading && filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 12 }}>
            <Typography variant="h6" color="text.secondary">
              {savedOnly && bookmarks.size === 0 ? 'No saved sites yet.' : 'No sites match your filters.'}
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              {savedOnly && bookmarks.size === 0
                ? 'Bookmark sites using the 🔖 icon on any card.'
                : 'Try adjusting the search or removing filters.'}
            </Typography>
          </Box>
        )}

      </Container>
    </Box>
  );
}

export default function DiveSiteListingClient({ initialSites }: { initialSites?: DiveSite[] }) {
  return (
    <Suspense>
      <DiveSitesPageInner initialSites={initialSites} />
    </Suspense>
  );
}
