'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Chip,
  Stack,
  Grid,
  Paper,
  Divider,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlaceIcon from '@mui/icons-material/Place';
import WaterIcon from '@mui/icons-material/Water';
import DepthIcon from '@mui/icons-material/VerticalAlignBottom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DirectionsIcon from '@mui/icons-material/Directions';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FlagIcon from '@mui/icons-material/Flag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import Link from 'next/link';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { DiveSite, Thermocline } from '@/types/admin';
import RequestCorrectionDialog from '@/components/RequestCorrectionDialog';
import { submitVerification } from '@/lib/diveSiteService';

const WATER_TYPE_LABELS: Record<DiveSite['waterType'], string> = {
  lake: 'Lake',
  sea: 'Sea',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;

const TEMP_BANDS = [
  { max: 8,  color: '#1565c0', label: '≤8°C  Cold' },
  { max: 14, color: '#0288d1', label: '9–14°C  Cool' },
  { max: 18, color: '#26a69a', label: '15–18°C  Mild' },
  { max: 99, color: '#ef6c00', label: '>18°C  Warm' },
];

function tempColor(t: number) {
  return TEMP_BANDS.find((b) => t <= b.max)?.color ?? '#ef6c00';
}

// ─── Water Temperature Chart ──────────────────────────────────────────────────
function WaterTempChart({ waterTemp }: { waterTemp: DiveSite['waterTemp'] }) {
  const values = MONTH_KEYS.map((k) => waterTemp[k] ?? null);
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length === 0) return null;

  const max = Math.max(...valid);
  const min = Math.min(...valid);
  const CHART_H = 90;
  const currentMonth = new Date().getMonth();

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>Water Temperature</Typography>
          <Typography variant="caption" color="text.secondary">Surface temperature · all months visible</Typography>
        </Box>
        <Stack direction="row" spacing={2.5}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">Coldest</Typography>
            <Typography variant="body2" fontWeight={800} sx={{ color: tempColor(min) }}>{min}°C</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" display="block">Warmest</Typography>
            <Typography variant="body2" fontWeight={800} sx={{ color: tempColor(max) }}>{max}°C</Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Bars — horizontally scrollable on narrow screens */}
      <Box sx={{ overflowX: 'auto', mx: { xs: -0.5, sm: 0 } }}>
      <Box sx={{ display: 'flex', gap: '3px', alignItems: 'flex-end', minWidth: 300 }}>
        {values.map((temp, i) => {
          const isCurrent = i === currentMonth;
          const color = temp !== null ? tempColor(temp) : '#bdbdbd';
          const barH = temp !== null ? Math.max((temp / (max + 3)) * CHART_H, 8) : 8;

          return (
            <Box
              key={i}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0,
              }}
            >
              {/* Always-visible temperature label */}
              <Typography
                sx={{
                  fontSize: '0.62rem',
                  fontWeight: isCurrent ? 800 : 500,
                  color: temp !== null ? (isCurrent ? color : 'text.primary') : 'text.disabled',
                  lineHeight: 1,
                  mb: 0.75,
                  letterSpacing: isCurrent ? 0 : '-0.3px',
                }}
              >
                {temp !== null ? `${temp}°` : '–'}
              </Typography>

              {/* Bar — sits on bottom of fixed-height container */}
              <Box sx={{ height: CHART_H, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: barH,
                    bgcolor: color,
                    borderRadius: '3px 3px 0 0',
                    opacity: temp === null ? 0.25 : isCurrent ? 1 : 0.72,
                    outline: isCurrent ? `2px solid ${color}` : '2px solid transparent',
                    outlineOffset: '2px',
                    transition: 'opacity 0.15s',
                    '&:hover': { opacity: 1 },
                  }}
                />
              </Box>

              {/* Bottom rule */}
              <Box sx={{ width: '100%', height: '2px', bgcolor: isCurrent ? color : 'divider' }} />

              {/* Month label */}
              <Typography
                sx={{
                  fontSize: '0.6rem',
                  mt: 0.5,
                  fontWeight: isCurrent ? 800 : 400,
                  color: isCurrent ? color : 'text.secondary',
                  lineHeight: 1,
                }}
              >
                {MONTHS[i]}
              </Typography>

              {/* Current month dot */}
              {isCurrent && (
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: color, mt: 0.5 }} />
              )}
            </Box>
          );
        })}
      </Box>
      </Box>

      {/* Legend */}
      <Stack direction="row" spacing={2} mt={2.5} flexWrap="wrap" useFlexGap>
        {TEMP_BANDS.map(({ color, label }) => (
          <Stack key={label} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color, flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary">{label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

// ─── Thermocline Card ─────────────────────────────────────────────────────────
function ThermoclineCard({ thermocline, maxDepth }: { thermocline: Thermocline; maxDepth: number }) {
  const { depth, tempDrop, seasons, notes } = thermocline;
  const DIAGRAM_H = 150;
  const DIAGRAM_W = 72;
  // clamp tcY so it's always visible in the diagram
  const tcY = Math.max(24, Math.min((depth / maxDepth) * DIAGRAM_H, DIAGRAM_H - 24));

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
        mb: 3,
        borderColor: '#0288d1',
        borderLeftWidth: 4,
        borderLeftColor: '#0288d1',
        borderLeftStyle: 'solid',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
        <ThermostatIcon sx={{ color: '#0288d1', fontSize: 22 }} />
        <Typography variant="h6" fontWeight={700}>Thermocline</Typography>
        {seasons && seasons.length > 0 && (
          <Stack direction="row" spacing={0.5} ml={0.5}>
            {seasons.map((s) => (
              <Chip key={s} label={s} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
            ))}
          </Stack>
        )}
      </Stack>

      <Grid container spacing={3} alignItems="flex-start">
        {/* Depth profile diagram */}
        <Grid size={{ xs: 'auto' }}>
          <Box sx={{ position: 'relative' }}>
            <svg
              width={DIAGRAM_W + 28}
              height={DIAGRAM_H + 8}
              style={{ display: 'block' }}
            >
              <defs>
                <linearGradient id="tcWarmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#0288d1" stopOpacity="0.85" />
                </linearGradient>
                <linearGradient id="tcColdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1565c0" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#0d47a1" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Warm layer */}
              <rect x="24" y="0" width={DIAGRAM_W} height={tcY} fill="url(#tcWarmGrad)" rx="5" ry="5" />
              {/* Cold layer */}
              <rect x="24" y={tcY} width={DIAGRAM_W} height={DIAGRAM_H - tcY} fill="url(#tcColdGrad)" rx="5" ry="5" />

              {/* Thermocline dashed line */}
              <line
                x1="24" y1={tcY} x2={24 + DIAGRAM_W} y2={tcY}
                stroke="white" strokeWidth="1.5" strokeDasharray="5 3" opacity="0.9"
              />

              {/* Depth label */}
              <text x="20" y={tcY + 4} fontSize="9" fill="#555" textAnchor="end" fontWeight="600">
                {depth}m
              </text>
              {/* Surface */}
              <text x="20" y="9" fontSize="9" fill="#888" textAnchor="end">0m</text>
              {/* Bottom */}
              <text x="20" y={DIAGRAM_H + 4} fontSize="9" fill="#888" textAnchor="end">{maxDepth}m</text>

              {/* Warm label */}
              <text x={24 + DIAGRAM_W / 2} y={Math.max(tcY / 2, 12)} fontSize="9" fill="white"
                textAnchor="middle" opacity="0.9" fontWeight="600">WARM</text>
              {/* Cold label */}
              <text x={24 + DIAGRAM_W / 2} y={tcY + (DIAGRAM_H - tcY) / 2 + 4} fontSize="9" fill="white"
                textAnchor="middle" opacity="0.9" fontWeight="600">COLD</text>
            </svg>
          </Box>
        </Grid>

        {/* Stats + notes */}
        <Grid size={{ xs: 12, sm: 7 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Starts at</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#0288d1', lineHeight: 1.1 }}>
                  ~{depth}m
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">Temp drop</Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: '#1565c0', lineHeight: 1.1 }}>
                  −{tempDrop}°C
                </Typography>
              </Box>
            </Stack>

            <Divider />

            <Stack direction="row" spacing={1} alignItems="flex-start">
              <WarningAmberIcon sx={{ fontSize: 16, color: 'warning.main', mt: 0.15, flexShrink: 0 }} />
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {notes ?? `A thermocline at ~${depth}m causes a sudden ${tempDrop}°C temperature drop. Expect a buoyancy change as water density increases below the layer.`}
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center' }}>
      <Box sx={{ color: '#0077be', mb: 0.5 }}>{icon}</Box>
      <Typography variant="h6" fontWeight={700}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Paper>
  );
}

// ─── Location Photos ─────────────────────────────────────────────────────────
const MAX_PHOTOS = 18;

function LocationPhotos({ lat, lng, siteName }: { lat: number; lng: number; siteName: string }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const placesLib = useMapsLibrary('places');

  useEffect(() => {
    if (!placesLib) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Place = (placesLib as any).Place;
    if (!Place?.searchByText) return;

    type Photo = { getURI: (opts: { maxWidth: number; maxHeight: number }) => string };
    type PlaceWithPhotos = { photos?: Photo[] };

    const collectPhotos = (results: PlaceWithPhotos[]) => {
      if (!results?.length) return;
      const urls: string[] = [];
      for (const place of results.slice(0, 8)) {
        if (!place.photos) continue;
        for (const photo of place.photos.slice(0, 5)) {
          urls.push(photo.getURI({ maxWidth: 1200, maxHeight: 900 }));
          if (urls.length >= MAX_PHOTOS) break;
        }
        if (urls.length >= MAX_PHOTOS) break;
      }
      if (urls.length) setPhotos(urls);
    };

    const hasCoords = !!(lat && lng);
    (Place.searchByText({
      textQuery: siteName,
      fields: ['photos'],
      ...(hasCoords ? { locationBias: { lat, lng } } : {}),
    }) as Promise<{ places: PlaceWithPhotos[] }>)
      .then(({ places }) => {
        if (places.length && places.some((p) => p.photos?.length)) {
          collectPhotos(places);
        } else if (hasCoords) {
          return (Place.searchNearby({
            fields: ['photos'],
            locationRestriction: { center: { lat, lng }, radius: 8000 },
          }) as Promise<{ places: PlaceWithPhotos[] }>).then(({ places: nearby }) => collectPhotos(nearby));
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesLib, lat, lng, siteName]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setSelectedIdx((i) => (i !== null ? Math.min(i + 1, photos.length - 1) : null));
      if (e.key === 'ArrowLeft')  setSelectedIdx((i) => (i !== null ? Math.max(i - 1, 0) : null));
      if (e.key === 'Escape')     setSelectedIdx(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIdx, photos.length]);

  return (
    <>
      {!photos.length ? null : (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={0.5}>Photos</Typography>
        <Typography variant="caption" color="text.secondary" display="block" mb={2}>
          Photos from Google Maps near {siteName} — may show the surrounding area
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
          {photos.map((url, i) => (
            <Box
              key={i}
              component="img"
              src={url}
              alt={`Photo ${i + 1} near ${siteName}`}
              onClick={() => setSelectedIdx(i)}
              sx={{
                width: '100%', aspectRatio: '4/3', objectFit: 'cover',
                borderRadius: 1, cursor: 'pointer',
                transition: 'opacity 0.15s',
                '&:hover': { opacity: 0.85 },
              }}
            />
          ))}
        </Box>

        {/* Lightbox */}
        {selectedIdx !== null && (
          <Box
            onClick={() => setSelectedIdx(null)}
            sx={{
              position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.9)',
              zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {/* Prev */}
            <Box
              onClick={(e) => { e.stopPropagation(); setSelectedIdx((i) => Math.max((i ?? 1) - 1, 0)); }}
              sx={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '50%',
                width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 24, userSelect: 'none',
                opacity: selectedIdx === 0 ? 0.2 : 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              ‹
            </Box>

            <Box
              component="img"
              src={photos[selectedIdx]}
              alt={`Photo ${selectedIdx + 1}`}
              sx={{ maxWidth: '85vw', maxHeight: '90vh', borderRadius: 2, objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next */}
            <Box
              onClick={(e) => { e.stopPropagation(); setSelectedIdx((i) => Math.min((i ?? 0) + 1, photos.length - 1)); }}
              sx={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '50%',
                width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 24, userSelect: 'none',
                opacity: selectedIdx === photos.length - 1 ? 0.2 : 1,
                '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
              }}
            >
              ›
            </Box>

            {/* Counter */}
            <Box sx={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.7)', fontSize: 13,
            }}>
              {selectedIdx + 1} / {photos.length}
            </Box>
          </Box>
        )}
      </Paper>
      )}
    </>
  );
}

// ─── Street View Panel ────────────────────────────────────────────────────────
function StreetViewPanel({ lat, lng, apiKey }: { lat: number; lng: number; apiKey: string }) {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${lat},${lng}&fov=80&pitch=0`;

  useEffect(() => {
    fetch(`https://maps.googleapis.com/maps/api/streetview/metadata?location=${lat},${lng}&key=${apiKey}`)
      .then((r) => r.json())
      .then((data: { status: string }) => {
        // Only hide if Google explicitly says there's no imagery
        // Any other status (API errors, not enabled, etc.) → show iframe anyway
        setStatus(data.status === 'ZERO_RESULTS' ? 'unavailable' : 'available');
      })
      .catch(() => setStatus('available')); // if metadata check fails, try showing it
  }, [lat, lng, apiKey]);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
      <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary">STREET VIEW — SITE ENTRANCE</Typography>
      </Box>
      {status === 'checking' && (
        <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
          <Typography variant="body2" color="text.secondary">Loading…</Typography>
        </Box>
      )}
      {status === 'available' && (
        <Box
          component="iframe"
          src={streetViewUrl}
          width="100%"
          height={200}
          sx={{ border: 'none', display: 'block' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          allow="accelerometer; gyroscope; magnetometer"
        />
      )}
      {status === 'unavailable' && (
        <Box sx={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.50', gap: 1 }}>
          <PlaceIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary">No Street View coverage at this location</Typography>
        </Box>
      )}
    </Paper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DiveSiteDetailClient({ site }: { site: DiveSite }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const lat = site.coordinates?.lat ?? 0;
  const lng = site.coordinates?.lng ?? 0;
  const hasCoordinates = !!(lat && lng);
  const mapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const embedUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=14&maptype=satellite`;
  const currentMonthKey = MONTH_KEYS[new Date().getMonth()];
  const currentTemp = site.waterTemp[currentMonthKey];

  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const [navHeight, setNavHeight] = useState(64);
  const heroRef = useRef<HTMLDivElement>(null);

  const localKey = `bm_verified_${site.id}`;
  const [hasVerified, setHasVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    setHasVerified(!!localStorage.getItem(localKey));
  }, [localKey]);

  const handleVerify = async () => {
    if (hasVerified || verifying || site.verified) return;
    setVerifying(true);
    try {
      await submitVerification(site.id, site.slug, site.name);
      localStorage.setItem(localKey, '1');
      setHasVerified(true);
    } finally {
      setVerifying(false);
    }
  };

  // Measure actual navbar height on mount + resize
  useEffect(() => {
    const measure = () => {
      const nav = document.getElementById('navigation');
      if (nav) setNavHeight(nav.getBoundingClientRect().height);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Show bar after hero scrolls out of view
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* Sticky bar — fixed below navbar, shown after hero scrolls off */}
      {showBar && (
        <Box sx={{
          position: 'fixed', top: navHeight, left: 0, right: 0, zIndex: 1099,
          bgcolor: '#fffbf5',
          borderTop: '1px solid #ffe0b2',
          borderBottom: '1px solid #ffe0b2',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        }}>
          <Container maxWidth="lg" sx={{ py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {site.verified ? (
                <VerifiedIcon sx={{ fontSize: 15, color: '#2e7d32' }} />
              ) : (
                <FlagIcon sx={{ fontSize: 15, color: '#e65100' }} />
              )}
              <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.82rem' }}>
                {site.verified
                  ? <Box component="span" fontWeight={600} color="success.main">Data verified by Blue Mind team</Box>
                  : <>Is the data on <Box component="span" fontWeight={700} color="text.primary">{site.name}</Box> incorrect?</>
                }
              </Typography>
            </Stack>
            {!site.verified && (
              <Stack direction="row" spacing={1}>
                {!hasVerified && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CheckCircleOutlineIcon sx={{ fontSize: '14px !important' }} />}
                    onClick={handleVerify}
                    disabled={verifying}
                    sx={{
                      borderColor: '#2e7d32', color: '#2e7d32', fontWeight: 600,
                      fontSize: '0.78rem', py: 0.4, whiteSpace: 'nowrap',
                      '&:hover': { bgcolor: '#f1f8f1', borderColor: '#1b5e20' },
                    }}
                  >
                    Looks correct
                  </Button>
                )}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FlagIcon sx={{ fontSize: '14px !important' }} />}
                  onClick={() => setCorrectionOpen(true)}
                  sx={{
                    borderColor: '#e65100', color: '#e65100', fontWeight: 600,
                    fontSize: '0.78rem', py: 0.4, whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#fff3e0', borderColor: '#bf360c' },
                  }}
                >
                  Report
                </Button>
              </Stack>
            )}
          </Container>
        </Box>
      )}

      {/* Hero */}
      <Box ref={heroRef} sx={{ background: 'linear-gradient(135deg, #001f3f 0%, #0077be 100%)', color: 'white', py: { xs: 3, md: 4 }, px: 2 }}>
        <Container maxWidth="lg">
          <Button
            component={Link}
            href="/dive-sites"
            startIcon={<ArrowBackIcon />}
            sx={{ color: 'rgba(255,255,255,0.6)', mb: 1.5, fontSize: '0.8rem', '&:hover': { color: 'white' } }}
            size="small"
          >
            All Dive Sites
          </Button>

          {/* Two-column on desktop: title left, meta right */}
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'flex-start' }} justifyContent="space-between" spacing={{ xs: 1.5, md: 3 }}>
            {/* Left: title */}
            <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
              <Typography
                variant="h1"
                fontWeight={800}
                sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, lineHeight: 1.2, mb: 0 }}
              >
                {site.name}
              </Typography>
              {site.verified && (
                <Stack direction="row" alignItems="center" spacing={0.5} mt={0.75}>
                  <VerifiedIcon sx={{ fontSize: 15, color: '#69f0ae' }} />
                  <Typography variant="caption" sx={{ color: '#69f0ae', fontWeight: 600, fontSize: '0.75rem' }}>
                    Verified by Blue Mind team
                  </Typography>
                </Stack>
              )}
            </Box>

            {/* Right: location + chips */}
            <Box sx={{ flex: '0 0 auto', maxWidth: { md: '44%' } }}>
              <Stack direction="row" alignItems="center" spacing={0.5} mb={1}>
                <PlaceIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem' }}>
                  {site.location}{site.location && site.country ? ', ' : ''}{site.country}
                </Typography>
              </Stack>

              {/* Water type + thermocline + seasons */}
              <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap mb={site.tags?.length ? 0.75 : 0}>
                <Chip
                  label={WATER_TYPE_LABELS[site.waterType]}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: 'white', fontSize: '0.7rem', height: 20 }}
                />
                {site.thermocline && (
                  <Chip
                    icon={<ThermostatIcon sx={{ fontSize: '12px !important', color: '#4fc3f7 !important' }} />}
                    label={`Thermocline ~${site.thermocline.depth}m`}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(79,195,247,0.4)', fontSize: '0.7rem', height: 20 }}
                  />
                )}
                {site.bestSeasons.map((s) => (
                  <Chip key={s} label={s} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', fontSize: '0.7rem', height: 20 }} />
                ))}
              </Stack>

              {/* Tags */}
              {site.tags?.length > 0 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {site.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.85)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        fontWeight: 500,
                        fontSize: '0.68rem',
                        height: 20,
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>

          {/* Data accuracy actions */}
          <Stack direction="row" spacing={1} mt={2.5} flexWrap="wrap" useFlexGap>
            {!site.verified && (
              <>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={
                    hasVerified
                      ? <CheckCircleIcon sx={{ fontSize: '15px !important' }} />
                      : <CheckCircleOutlineIcon sx={{ fontSize: '15px !important' }} />
                  }
                  onClick={handleVerify}
                  disabled={hasVerified || verifying}
                  sx={{
                    bgcolor: hasVerified ? 'rgba(56,142,60,0.85)' : 'rgba(56,142,60,0.75)',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    boxShadow: 'none',
                    '&:hover': { bgcolor: 'rgba(56,142,60,0.95)', boxShadow: 'none' },
                    '&.Mui-disabled': { bgcolor: 'rgba(56,142,60,0.5)', color: 'rgba(255,255,255,0.8)' },
                  }}
                >
                  {hasVerified ? 'You verified this' : verifying ? 'Saving…' : 'Data looks correct'}
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FlagIcon sx={{ fontSize: '14px !important' }} />}
                  onClick={() => setCorrectionOpen(true)}
                  sx={{
                    borderColor: 'rgba(255,255,255,0.4)',
                    color: 'rgba(255,255,255,0.75)',
                    fontWeight: 600,
                    fontSize: '0.78rem',
                    '&:hover': { borderColor: 'white', color: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  Report incorrect data
                </Button>
              </>
            )}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={4}>
          {/* ── Left column ── */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Quick stats */}
            <Grid container spacing={2} mb={4}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard icon={<DepthIcon />} label="Max Depth" value={`${site.maxDepth}m`} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard icon={<VisibilityIcon />} label="Visibility" value={`${site.visibility.min}–${site.visibility.max}m`} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard icon={<WaterIcon />} label="Water Type" value={WATER_TYPE_LABELS[site.waterType]} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                  icon={<Typography sx={{ fontWeight: 700, color: '#0077be' }}>°C</Typography>}
                  label="Now"
                  value={currentTemp !== undefined ? `${currentTemp}°C` : 'N/A'}
                />
              </Grid>
            </Grid>

            {/* Description */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={1.5}>About This Site</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                {site.description}
              </Typography>
            </Paper>

            {/* Highlights */}
            {site.highlights.length > 0 && (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={1.5}>Highlights</Typography>
                <Stack spacing={1}>
                  {site.highlights.map((h) => (
                    <Stack key={h} direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main', mt: 0.25, flexShrink: 0 }} />
                      <Typography variant="body2">{h}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Thermocline */}
            {site.thermocline && (
              <ThermoclineCard thermocline={site.thermocline} maxDepth={site.maxDepth} />
            )}

            {/* Water temp chart */}
            <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 2, mb: 3 }}>
              <WaterTempChart waterTemp={site.waterTemp} />
            </Paper>

            {/* Facilities */}
            {site.facilities.length > 0 && (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={1.5}>Facilities</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {site.facilities.map((f) => (
                    <Chip key={f} label={f} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Photos from Google Maps */}
            <APIProvider apiKey={apiKey}>
              <LocationPhotos lat={lat} lng={lng} siteName={site.name} />
            </APIProvider>
          </Grid>

          {/* ── Right column ── */}
          <Grid size={{ xs: 12, md: 4 }}>
            {hasCoordinates ? (
              <>
                {/* Map */}
                <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 2 }}>
                  <Box
                    component="iframe"
                    src={embedUrl}
                    width="100%"
                    height={240}
                    sx={{ border: 'none', display: 'block' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </Paper>

                {/* Street View */}
                <StreetViewPanel lat={lat} lng={lng} apiKey={apiKey} />

                {/* Navigation buttons */}
                <Stack spacing={1} mb={3}>
                  <Button
                    component="a"
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<DirectionsIcon />}
                    variant="contained"
                    fullWidth
                    sx={{ fontWeight: 700 }}
                  >
                    Get Directions
                  </Button>
                  <Button
                    component="a"
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<OpenInNewIcon />}
                    variant="outlined"
                    fullWidth
                    size="small"
                  >
                    Open in Google Maps
                  </Button>
                </Stack>
              </>
            ) : (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3, textAlign: 'center' }}>
                <PlaceIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Location coordinates not yet available for this site.
                </Typography>
              </Paper>
            )}

            {/* Site details */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>
                SITE DETAILS
              </Typography>
              <Stack spacing={1.5} divider={<Divider />}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Water type</Typography>
                  <Typography variant="body2" fontWeight={600}>{WATER_TYPE_LABELS[site.waterType]}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Max depth</Typography>
                  <Typography variant="body2" fontWeight={600}>{site.maxDepth}m</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Visibility</Typography>
                  <Typography variant="body2" fontWeight={600}>{site.visibility.min}–{site.visibility.max}m</Typography>
                </Stack>
                {site.thermocline && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Thermocline</Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#0288d1' }}>~{site.thermocline.depth}m (−{site.thermocline.tempDrop}°C)</Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Best seasons</Typography>
                  <Typography variant="body2" fontWeight={600}>{site.bestSeasons.join(', ')}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Location</Typography>
                  <Typography variant="body2" fontWeight={600}>{site.location}</Typography>
                </Stack>
                {site.googleRating && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Google rating</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Typography variant="body2" fontWeight={700} sx={{ color: '#f59e0b' }}>★ {site.googleRating.toFixed(1)}</Typography>
                      {site.googleRatingsTotal && (
                        <Typography variant="caption" color="text.secondary">({site.googleRatingsTotal.toLocaleString()})</Typography>
                      )}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </Paper>

            {/* CTA */}
            <Paper sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #001f3f, #0077be)', color: 'white' }}>
              <Typography variant="h6" fontWeight={700} mb={1}>
                Shared by the Freediving Community
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 2.5 }}>
                This site guide is maintained by Blue Mind and the wider freediving community — divers helping divers find great spots worldwide.
              </Typography>
              <Stack spacing={1.5}>
                <Button
                  component={Link}
                  href="/community"
                  variant="contained"
                  fullWidth
                  sx={{ bgcolor: 'white', color: '#001f3f', fontWeight: 700, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                >
                  Join the Community
                </Button>
                <Button
                  component={Link}
                  href="/membership"
                  variant="outlined"
                  fullWidth
                  sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', fontWeight: 600, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' } }}
                >
                  Become a Member
                </Button>
              </Stack>
            </Paper>

            {/* Report incorrect data */}
            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 2, borderColor: '#ffcc80', bgcolor: '#fff8f0', mt: 2 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <FlagIcon sx={{ color: 'warning.dark', mt: 0.25, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="warning.dark" mb={0.5}>
                    Is something wrong on this page?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1.5} sx={{ lineHeight: 1.6 }}>
                    Help the community by reporting incorrect depth, location, water type, or other data. Your reports are reviewed by our team.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<FlagIcon />}
                    onClick={() => setCorrectionOpen(true)}
                    size="small"
                    fullWidth
                    sx={{ bgcolor: 'warning.dark', '&:hover': { bgcolor: 'warning.main' } }}
                  >
                    Report Incorrect Data
                  </Button>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <RequestCorrectionDialog
        open={correctionOpen}
        onClose={() => setCorrectionOpen(false)}
        site={site}
      />
    </Box>
  );
}
