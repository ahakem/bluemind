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
import PoolIcon from '@mui/icons-material/Pool';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import TuneIcon from '@mui/icons-material/Tune';
import VerifiedIcon from '@mui/icons-material/Verified';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExploreIcon from '@mui/icons-material/Explore';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import CountryAutocomplete from '@/components/CountryAutocomplete';
import { CountryType, lookupCountry } from '@/data/countries';
import { Continent, CONTINENTS, getContinent, getContinents } from '@/data/continents';
import StarIcon from '@mui/icons-material/Star';
import ScubaDivingIcon from '@mui/icons-material/ScubaDiving';
import { getActiveDiveSites, getDiveLogCounts, getAverageRatings } from '@/lib/diveSiteService';
import { DiveSite } from '@/types/admin';
import ExploreByCountry from '@/components/ExploreByCountry';
import DiverLoader from '@/components/DiverLoader';
import { useDiveSiteNav } from '@/contexts/DiveSiteNavContext';

const DiveSiteMap = dynamic(() => import('@/components/DiveSiteMap'), {
  ssr: false,
  loading: () => (
    <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 0 }} />
  ),
});

const WATER_TYPE_LABELS: Record<DiveSite['waterType'], string> = { lake: 'Lake', sea: 'Sea', deep_tank: 'Deep Tank' };
const WATER_TYPE_COLOR: Record<DiveSite['waterType'], string> = { sea: '#0077be', lake: '#26a69a', deep_tank: '#5c6bc0' };
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
  const { setSiteCount } = useDiveSiteNav();

  const [sites, setSites] = useState<DiveSite[]>(initialSites ?? []);
  const [loading, setLoading] = useState(!initialSites);

  // Push count to navbar as soon as sites are available
  useEffect(() => {
    if (initialSites?.length) setSiteCount(initialSites.length);
  }, [initialSites]);
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
  const [activityFilter, setActivityFilter] = useState<string[]>(
    searchParams.get('activity') ? searchParams.get('activity')!.split(',') : []
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
  const [verifiedOnly, setVerifiedOnly] = useState(false);

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
      setSiteCount(data.length);
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
      if (activityFilter.length > 0) {
        const wantsUncharted = activityFilter.includes('uncharted');
        const wantsTagged = activityFilter.filter((a) => a !== 'uncharted');
        const isUncharted = (site.activities?.length ?? 0) === 0;
        const matchUncharted = wantsUncharted && isUncharted;
        const matchTagged = wantsTagged.length > 0 && wantsTagged.some((a) => site.activities?.includes(a as 'line_diving' | 'snorkeling'));
        if (!matchUncharted && !matchTagged) return false;
      }
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
      if (verifiedOnly && !site.verified) return false;
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
  }, [sites, search, waterTypeFilter, activityFilter, countryFilter, continentFilter, minDepth, minVisibility, minTemp, savedOnly, bookmarks, userPos, verifiedOnly]);

  // ── Handler helpers ───────────────────────────────────────────────────────
  const handleWaterType = (_: React.MouseEvent<HTMLElement>, values: string[]) => {
    setWaterTypeFilter(values); setVisibleCount(24);
    updateUrl({ waterType: values.length ? values.join(',') : null });
  };
  const handleActivityFilter = (_: React.MouseEvent<HTMLElement>, values: string[]) => {
    setActivityFilter(values); setVisibleCount(24);
    updateUrl({ activity: values.length ? values.join(',') : null });
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
    + (activityFilter.length > 0 ? 1 : 0)
    + (countryFilter ? 1 : 0) + (continentFilter ? 1 : 0)
    + (hasAdvancedFilters ? 1 : 0) + (savedOnly ? 1 : 0) + (userPos ? 1 : 0) + (verifiedOnly ? 1 : 0);

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
    const tankCount = countrySites.filter((s) => s.waterType === 'deep_tank').length;
    return { total: countrySites.length, avgDepth, seaCount, lakeCount, tankCount };
  }, [countryFilter, sites, loading]);

  if (loading) return <DiverLoader />;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Map + curation panel */}
      <Box sx={{ display: { xs: 'block', md: 'flex' }, width: '100%', height: { xs: 'auto', md: 460 } }}>

        {/* Map */}
        <Box sx={{ flex: '0 0 62%', height: { xs: 240, sm: 300, md: '100%' }, position: 'relative' }}>
          <DiveSiteMap sites={filtered.length > 0 ? filtered : sites} onSelect={handleMapSelect} />
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 40, background: 'linear-gradient(to bottom, transparent, rgba(245,245,245,0.8))', pointerEvents: 'none', zIndex: 1000, display: { md: 'none' } }} />
        </Box>

        {/* Curation panel — desktop side panel */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: '0 0 38%',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'linear-gradient(160deg, #001a36 0%, #003166 50%, #004f99 100%)',
            color: 'white',
            p: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
          <Box sx={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(0,180,255,0.05)', pointerEvents: 'none' }} />

          <Typography fontWeight={900} sx={{ fontSize: '1.25rem', letterSpacing: '-0.3px', lineHeight: 1.3, mb: 0.75 }}>
            Help us verify this directory
          </Typography>
          <Typography sx={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.65, mb: 3 }}>
            We&apos;re actively reviewing every listing. Open any site card to take action — no account needed.
          </Typography>

          <Stack spacing={1.25}>
            {[
              { symbol: '✓', label: "Verify it's accurate", sub: 'Confirm depth, type & location', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.25)' },
              { symbol: '✏', label: 'Suggest a correction', sub: 'Fix wrong name, coords or data', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.25)' },
              { symbol: '✕', label: 'Flag for removal', sub: "Not freediving-friendly?", color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
            ].map(({ symbol, label, sub, color, bg, border }) => (
              <Stack key={label} direction="row" alignItems="center" spacing={1.5}
                sx={{ bgcolor: bg, border: `1px solid ${border}`, borderRadius: 2.5, px: 2, py: 1.25 }}
              >
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Typography fontWeight={900} sx={{ fontSize: '0.95rem', color, lineHeight: 1 }}>{symbol}</Typography>
                </Box>
                <Box>
                  <Typography fontWeight={700} sx={{ fontSize: '0.92rem', color, lineHeight: 1.2 }}>{label}</Typography>
                  <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>{sub}</Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Curation strip — mobile only */}
        <Box
          sx={{
            display: { xs: 'flex', md: 'none' },
            background: 'linear-gradient(90deg, #001a36 0%, #003d7a 60%, #0060a8 100%)',
            px: 2, py: 1.5,
            gap: 1,
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', alignSelf: 'center', flexShrink: 0, mr: 0.5, fontStyle: 'italic' }}>
            Open any site to:
          </Typography>
          {[
            { symbol: '✓', label: 'Verify', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
            { symbol: '✏', label: 'Correct', color: '#60a5fa', border: 'rgba(96,165,250,0.3)' },
            { symbol: '✕', label: 'Flag removal', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
          ].map(({ symbol, label, color, border }) => (
            <Stack key={label} direction="row" alignItems="center" spacing={0.5}
              sx={{ flexShrink: 0, px: 1.5, py: 0.75, borderRadius: 10, bgcolor: 'rgba(255,255,255,0.07)', border: `1px solid ${border}` }}
            >
              <Typography fontWeight={800} sx={{ fontSize: '0.85rem', color, lineHeight: 1 }}>{symbol}</Typography>
              <Typography fontWeight={600} sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)' }}>{label}</Typography>
            </Stack>
          ))}
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
                  {(['sea', 'lake', 'deep_tank'] as const).map((t) => (
                    <ToggleButton key={t} value={t} sx={{ textTransform: 'none', px: 1.5, py: 0.4 }}>
                      {WATER_TYPE_LABELS[t]}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            </Stack>

            {/* Row 2b: activity type */}
            <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mr: 0.5 }}>ACTIVITY</Typography>
              <ToggleButtonGroup value={activityFilter} onChange={handleActivityFilter} size="small" aria-label="Filter by activity type">
                <ToggleButton value="line_diving" sx={{ textTransform: 'none', px: 1.5, py: 0.4 }}>Line Diving</ToggleButton>
                <ToggleButton value="snorkeling" sx={{ textTransform: 'none', px: 1.5, py: 0.4 }}>Snorkeling</ToggleButton>
                <ToggleButton value="uncharted" sx={{ textTransform: 'none', px: 1.5, py: 0.4 }}>Uncharted</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* Row 3: near me + saved + verified + more filters */}
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

                {/* Verified */}
                <Button
                  size="small"
                  variant={verifiedOnly ? 'contained' : 'outlined'}
                  startIcon={<VerifiedIcon sx={{ fontSize: '15px !important' }} />}
                  onClick={() => { setVerifiedOnly((v) => !v); setVisibleCount(24); }}
                  aria-pressed={verifiedOnly}
                  sx={{
                    borderRadius: 5, fontSize: '0.75rem', py: 0.4, px: 1.5,
                    ...(verifiedOnly ? { bgcolor: '#0077be', '&:hover': { bgcolor: '#005f99' } } : {}),
                  }}
                >
                  Verified
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

            {/* Row 4 (collapsible): advanced filters */}
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
                  {[
                    countryStats.seaCount > 0 ? `${countryStats.seaCount} sea` : null,
                    countryStats.lakeCount > 0 ? `${countryStats.lakeCount} lake` : null,
                    countryStats.tankCount > 0 ? `${countryStats.tankCount} deep tank` : null,
                  ].filter(Boolean).map((s) => ` · ${s}`).join('')}
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
                  <Box sx={{ height: 3, borderRadius: 1, mb: 0.75, bgcolor: WATER_TYPE_COLOR[site.waterType] }} />
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
                    <Box sx={{ height: 6, bgcolor: WATER_TYPE_COLOR[site.waterType] }} />
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
                      <Stack direction="row" spacing={0.75} mt={1} flexWrap="wrap" useFlexGap>
                        {(site.activities?.length ?? 0) === 0 ? (
                          <Chip
                            label="Uncharted"
                            icon={<ExploreIcon sx={{ fontSize: '13px !important', color: '#92400e !important' }} />}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#fef3c7', color: '#92400e', border: '1.5px solid #fcd34d' }}
                          />
                        ) : (
                          <>
                            {(site.activities ?? []).includes('line_diving') && (
                              <Chip label="Line Diving" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#e3f2fd', color: '#0055a5', border: '1.5px solid #90caf9' }} />
                            )}
                            {(site.activities ?? []).includes('snorkeling') && (
                              <Chip label="Snorkeling" size="small" sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: '#e0f2f1', color: '#00695c', border: '1.5px solid #80cbc4' }} />
                            )}
                          </>
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

        {/* Community curation callout */}
        <Box mt={8} mb={2}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #001f3f 0%, #003d7a 55%, #0077be 100%)',
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', bottom: -40, left: 60, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(0,200,255,0.05)', pointerEvents: 'none' }} />
            <Stack direction={{ xs: 'column', lg: 'row' }} alignItems={{ lg: 'center' }} justifyContent="space-between" spacing={{ xs: 3, lg: 4 }}>
              <Box sx={{ maxWidth: 520 }}>
                <Typography fontWeight={900} sx={{ fontSize: { xs: '1.15rem', md: '1.35rem' }, letterSpacing: '-0.3px', lineHeight: 1.25, mb: 1 }}>
                  Help us build the world&apos;s most accurate freediving directory
                </Typography>
                <Typography sx={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
                  Every site in this list is being reviewed. Open any site card and you&apos;ll find three ways to contribute — no account needed.
                </Typography>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={1.25} sx={{ flexShrink: 0 }}>
                {[
                  { symbol: '✓', label: "Verify it's accurate", sub: 'Confirm depth, type & location', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)', color: '#4ade80' },
                  { symbol: '✏', label: 'Suggest a correction', sub: 'Fix wrong name, coords, or data', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)', color: '#60a5fa' },
                  { symbol: '✕', label: 'Flag for removal', sub: 'Not freediving-friendly?', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', color: '#f87171' },
                ].map(({ symbol, label, sub, bg, border, color }) => (
                  <Stack key={label} direction="row" alignItems="center" spacing={1.25}
                    sx={{ bgcolor: bg, border: `1px solid ${border}`, borderRadius: 2.5, px: 2, py: 1.25, minWidth: 230 }}
                  >
                    <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: border, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography fontWeight={800} sx={{ fontSize: '0.95rem', color, lineHeight: 1 }}>{symbol}</Typography>
                    </Box>
                    <Box>
                      <Typography fontWeight={700} sx={{ fontSize: '0.92rem', color, lineHeight: 1.2 }}>{label}</Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.3 }}>{sub}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Box>
        </Box>

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
