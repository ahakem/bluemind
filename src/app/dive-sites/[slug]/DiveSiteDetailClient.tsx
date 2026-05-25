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
  IconButton,
  Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ShareIcon from '@mui/icons-material/Share';
import ScubaDivingIcon from '@mui/icons-material/ScubaDiving';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
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
import BlockIcon from '@mui/icons-material/Block';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SetMealIcon from '@mui/icons-material/SetMeal';
import PestControlIcon from '@mui/icons-material/PestControl';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import WavesIcon from '@mui/icons-material/Waves';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import Link from 'next/link';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
import { DiveSite, Thermocline } from '@/types/admin';
import RequestCorrectionDialog from '@/components/RequestCorrectionDialog';
import NotFreedivingFriendlyDialog from '@/components/NotFreedivingFriendlyDialog';
import { submitVerification, submitDiveLog, submitRating, getSiteRatingsSummary } from '@/lib/diveSiteService';
import { useAuth } from '@/lib/AuthContext';

const WATER_TYPE_LABELS: Record<DiveSite['waterType'], string> = {
  lake: 'Lake',
  sea: 'Sea',
  deep_tank: 'Deep Tank',
};
const WATER_TYPE_COLOR: Record<DiveSite['waterType'], string> = {
  sea: '#0077be', lake: '#26a69a', deep_tank: '#5c6bc0',
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;

const TEMP_BANDS = [
  { max: 8,  color: '#1565c0', label: '≤8°C  Cold' },
  { max: 14, color: '#0288d1', label: '9–14°C  Cool' },
  { max: 18, color: '#26a69a', label: '15–18°C  Mild' },
  { max: 99, color: '#ef6c00', label: '>18°C  Warm' },
];

function toDDM(lat: number, lng: number): string {
  const fmt = (v: number, pos: string, neg: string) => {
    const d = Math.floor(Math.abs(v));
    const m = ((Math.abs(v) - d) * 60).toFixed(3);
    return `${d} ${m} ${v >= 0 ? pos : neg}`;
  };
  return `${fmt(lat, 'N', 'S')}  ${fmt(lng, 'E', 'W')}`;
}

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

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const chartAriaLabel = `Water temperature chart. Coldest: ${min}°C, warmest: ${max}°C. ${values.map((t, i) => t !== null ? `${monthNames[i]}: ${t}°C` : `${monthNames[i]}: no data`).join(', ')}.`;

  return (
    <Box role="img" aria-label={chartAriaLabel}>
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

// ─── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({
  value, max = 5, interactive = false,
  onRate, onHover,
}: {
  value: number; max?: number; interactive?: boolean;
  onRate?: (n: number) => void; onHover?: (n: number | null) => void;
}) {
  return (
    <Stack
      direction="row"
      spacing={0.25}
      role={interactive ? 'group' : undefined}
      aria-label={interactive ? 'Rate this site' : `Rating: ${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const full = value >= i + 1;
        const half = !full && value >= i + 0.5;
        const Icon = full ? StarIcon : half ? StarHalfIcon : StarBorderIcon;
        return (
          <Box
            key={i}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `Rate ${i + 1} star${i + 1 !== 1 ? 's' : ''}` : undefined}
            onMouseEnter={() => interactive && onHover?.(i + 1)}
            onMouseLeave={() => interactive && onHover?.(null)}
            onClick={() => interactive && onRate?.(i + 1)}
            onKeyDown={(e) => { if (interactive && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onRate?.(i + 1); } }}
            sx={{ cursor: interactive ? 'pointer' : 'default', color: '#f59e0b', display: 'flex',
              ...(interactive ? { '&:focus-visible': { outline: '2px solid #f59e0b', borderRadius: '2px', outlineOffset: '1px' } } : {}),
            }}
          >
            <Icon sx={{ fontSize: interactive ? 26 : 16 }} />
          </Box>
        );
      })}
    </Stack>
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
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }} role="list">
          {photos.map((url, i) => (
            <Box
              key={i}
              role="listitem"
              component="button"
              aria-label={`Open photo ${i + 1} of ${photos.length} near ${siteName}`}
              onClick={() => setSelectedIdx(i)}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedIdx(i); } }}
              sx={{
                p: 0, border: 'none', background: 'none', cursor: 'pointer',
                borderRadius: 1, display: 'block', width: '100%',
                '&:focus-visible': { outline: '2px solid #0077be', outlineOffset: '2px' },
              }}
            >
              <Box
                component="img"
                src={url}
                alt={`Photo ${i + 1} near ${siteName}`}
                sx={{
                  width: '100%', aspectRatio: '4/3', objectFit: 'cover',
                  borderRadius: 1, display: 'block',
                  transition: 'opacity 0.15s',
                  '&:hover': { opacity: 0.85 },
                }}
              />
            </Box>
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
              component="button"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedIdx((i) => Math.max((i ?? 1) - 1, 0)); }}
              aria-label="Previous photo"
              disabled={selectedIdx === 0}
              sx={{
                position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '50%',
                width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: selectedIdx === 0 ? 'default' : 'pointer', fontSize: 24, border: 'none',
                opacity: selectedIdx === 0 ? 0.2 : 1,
                '&:hover:not(:disabled)': { bgcolor: 'rgba(255,255,255,0.25)' },
                '&:focus-visible': { outline: '2px solid white', outlineOffset: '2px' },
              }}
            >
              ‹
            </Box>

            <Box
              component="img"
              src={photos[selectedIdx]}
              alt={`Photo ${selectedIdx + 1} of ${photos.length} near ${siteName}`}
              sx={{ maxWidth: '85vw', maxHeight: '90vh', borderRadius: 2, objectFit: 'contain' }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />

            {/* Next */}
            <Box
              component="button"
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedIdx((i) => Math.min((i ?? 0) + 1, photos.length - 1)); }}
              aria-label="Next photo"
              disabled={selectedIdx === photos.length - 1}
              sx={{
                position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.15)', color: 'white', borderRadius: '50%',
                width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: selectedIdx === photos.length - 1 ? 'default' : 'pointer', fontSize: 24, border: 'none',
                opacity: selectedIdx === photos.length - 1 ? 0.2 : 1,
                '&:hover:not(:disabled)': { bgcolor: 'rgba(255,255,255,0.25)' },
                '&:focus-visible': { outline: '2px solid white', outlineOffset: '2px' },
              }}
            >
              ›
            </Box>

            {/* Counter */}
            <Box aria-live="polite" aria-atomic="true" sx={{
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
          title="Google Street View of dive site location"
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
  const { isAdmin, loading: authLoading } = useAuth();
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
  const [removalOpen, setRemovalOpen] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const localKey = `bm_verified_${site.id}`;
  const [hasVerified, setHasVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [bookmarked, setBookmarked] = useState(false);

  // Dive log
  const [hasDived, setHasDived] = useState(false);
  const [diving, setDiving] = useState(false);
  const [diveCount, setDiveCount] = useState<number | null>(null);

  // Community rating
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingSummary, setRatingSummary] = useState<{ avg: number; count: number } | null>(null);

  // Share
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    setHasVerified(!!localStorage.getItem(localKey));
    setHasDived(!!localStorage.getItem(`bm_dived_${site.id}`));
    try {
      const stored = localStorage.getItem('bm_saved_sites');
      if (stored) setBookmarked((JSON.parse(stored) as string[]).includes(site.id));
    } catch {}
    try {
      const r = localStorage.getItem(`bm_rating_${site.id}`);
      if (r) setUserRating(parseInt(r));
    } catch {}
    // Save to recently viewed
    try {
      const stored = localStorage.getItem('bm_recently_viewed');
      const ids: string[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem('bm_recently_viewed', JSON.stringify([site.id, ...ids.filter((x) => x !== site.id)].slice(0, 12)));
    } catch {}
    // Fetch rating summary
    getSiteRatingsSummary(site.id).then(setRatingSummary).catch(() => {});
  }, [localKey, site.id]);

  const toggleBookmark = () => {
    setBookmarked((prev) => {
      const next = !prev;
      try {
        const stored = localStorage.getItem('bm_saved_sites');
        const ids: string[] = stored ? JSON.parse(stored) : [];
        const updated = next ? [...ids.filter((x) => x !== site.id), site.id] : ids.filter((x) => x !== site.id);
        localStorage.setItem('bm_saved_sites', JSON.stringify(updated));
      } catch {}
      return next;
    });
  };

  const handleDiveLog = async () => {
    if (hasDived || diving) return;
    setDiving(true);
    try {
      await submitDiveLog(site.id, site.slug, site.name);
      localStorage.setItem(`bm_dived_${site.id}`, '1');
      setHasDived(true);
      setDiveCount((c) => (c ?? 0) + 1);
    } finally {
      setDiving(false);
    }
  };

  const handleRating = async (stars: number) => {
    if (userRating !== null || ratingSubmitting) return;
    setRatingSubmitting(true);
    try {
      await submitRating(site.id, site.slug, site.name, stars);
      localStorage.setItem(`bm_rating_${site.id}`, String(stars));
      setUserRating(stars);
      setRatingSummary((prev) => {
        if (!prev) return { avg: stars, count: 1 };
        const nc = prev.count + 1;
        return { avg: Math.round(((prev.avg * prev.count + stars) / nc) * 10) / 10, count: nc };
      });
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: `${site.name} – Freediving Site`, url }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch {}
    }
  };

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

  // Non-active site: wait for auth, then gate
  if (site.status !== 'active') {
    if (authLoading) return null;
    if (!isAdmin) {
      const isPending = site.status === 'pending';
      const accentColor    = isPending ? '#fde047' : '#94a3b8';
      const accentGlow     = isPending ? 'rgba(253,224,71,0.6)' : 'rgba(148,163,184,0.3)';
      const cardBg         = isPending ? '#ca8a04' : '#1e293b';
      const cardBgGrad     = isPending ? '#fde047' : '#334155';
      const cardShadow     = isPending
        ? '0 0 50px rgba(253,224,71,0.55), 0 0 110px rgba(253,224,71,0.2), 0 24px 60px rgba(0,0,0,0.7)'
        : '0 0 40px rgba(100,116,139,0.4), 0 24px 60px rgba(0,0,0,0.7)';
      const cardText       = isPending ? 'HOLD' : 'CLOSED';
      const badgeText      = isPending ? 'SURFACE INTERVAL' : 'SITE ARCHIVED';
      const headline       = isPending ? 'This site is on surface interval.' : 'This site has been pulled from the line.';
      const subText        = isPending
        ? "We're reviewing this listing before it goes live. Check back soon — every great site starts here."
        : "This dive site is no longer listed. It may have been archived or is no longer accessible to freedivers.";
      const statusRows = isPending
        ? [
            { label: 'STATUS',   value: 'PENDING',  color: '#fde047' },
            { label: 'CLEARED',  value: 'NO',       color: '#f87171' },
            { label: 'REVIEW',   value: 'IN QUEUE', color: 'rgba(255,255,255,0.5)' },
            { label: 'ETA',      value: 'UNKNOWN',  color: 'rgba(255,255,255,0.5)' },
          ]
        : [
            { label: 'STATUS',   value: 'ARCHIVED', color: '#94a3b8' },
            { label: 'ACCESS',   value: 'CLOSED',   color: '#f87171' },
            { label: 'DIVES',    value: '— —',      color: 'rgba(255,255,255,0.4)' },
            { label: 'DEPTH',    value: '— m',      color: 'rgba(255,255,255,0.4)' },
          ];
      const SI_MARKS = ['0:00', '0:30', '1:00', '1:30', '2:00', '3:00', '5:00', '10:00', '∞'];

      const BUBBLES = [
        { left: '6%',  size: 7,  delay: '0s',   dur: '7s'  },
        { left: '16%', size: 11, delay: '1.2s', dur: '9s'  },
        { left: '29%', size: 5,  delay: '0.4s', dur: '6s'  },
        { left: '44%', size: 15, delay: '2.1s', dur: '11s' },
        { left: '58%', size: 8,  delay: '0.8s', dur: '8s'  },
        { left: '71%', size: 10, delay: '1.7s', dur: '10s' },
        { left: '83%', size: 6,  delay: '0.3s', dur: '7s'  },
        { left: '93%', size: 12, delay: '2.5s', dur: '9s'  },
      ];

      return (
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #05050e 0%, #010c1c 50%, #000814 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            px: 2,
            '@keyframes rise': {
              '0%':   { transform: 'translateY(0) scale(1)',        opacity: 1 },
              '100%': { transform: 'translateY(-110vh) scale(1.3)', opacity: 0 },
            },
            '@keyframes cardDrop': {
              '0%':   { transform: 'translateY(-90px) rotate(-8deg)',  opacity: 0 },
              '60%':  { transform: 'translateY(10px)  rotate(2deg)',   opacity: 1 },
              '78%':  { transform: 'translateY(-5px)  rotate(-1deg)' },
              '100%': { transform: 'translateY(0)     rotate(0deg)',   opacity: 1 },
            },
            '@keyframes blink': {
              '0%, 49%, 51%, 100%': { opacity: 1 },
              '50%': { opacity: 0 },
            },
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0) rotate(-5deg)' },
              '50%':      { transform: 'translateY(-10px) rotate(5deg)' },
            },
            '@keyframes siScroll': {
              '0%':   { transform: 'translateY(0)' },
              '100%': { transform: 'translateY(-55%)' },
            },
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%':      { opacity: 0.55 },
            },
          }}
        >
          {/* Depth glow */}
          <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 45% at 50% 90%, rgba(0,50,110,0.28) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Accent halo behind card */}
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -65%)',
            width: 260, height: 260, borderRadius: '50%',
            background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          {/* ── SI timer (left, desktop) ─────────────────────────── */}
          <Box sx={{
            position: 'absolute', left: { xs: 12, md: 32 }, top: 0, bottom: 0,
            width: 56, overflow: 'hidden',
            display: { xs: 'none', sm: 'block' },
          }}>
            <Box sx={{ position: 'absolute', left: 6, top: 0, bottom: 0, width: 1.5, background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 80%, transparent 100%)' }} />
            <Box sx={{ position: 'absolute', top: 8, left: 10 }}>
              <Typography sx={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>SI</Typography>
            </Box>
            <Box sx={{ animation: 'siScroll 14s linear infinite', pt: 6 }}>
              {[...SI_MARKS, ...SI_MARKS].map((t, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: '26px' }}>
                  <Box sx={{ width: 10, height: 1, bgcolor: 'rgba(255,255,255,0.22)', mr: 0.5 }} />
                  <Typography sx={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.28)', fontFamily: 'monospace', lineHeight: 1 }}>{t}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          {/* ── Status widget (top-right) ─────────────────────────── */}
          <Box sx={{
            position: 'absolute', top: { xs: 16, md: 28 }, right: { xs: 12, md: 28 },
            bgcolor: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2, px: 2, py: 1.5, backdropFilter: 'blur(8px)', minWidth: 160,
          }}>
            <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 1, fontFamily: 'monospace' }}>
              Dive Status
            </Typography>
            {statusRows.map(({ label, value, color }) => (
              <Stack key={label} direction="row" justifyContent="space-between" alignItems="center" mb={0.6} gap={2}>
                <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>{label}</Typography>
                <Typography sx={{ fontSize: '0.85rem', color, fontFamily: 'monospace', fontWeight: 800 }}>{value}</Typography>
              </Stack>
            ))}
            <Stack direction="row" alignItems="center" spacing={0.5} mt={1} pt={1} sx={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: accentColor, animation: 'blink 1.4s step-end infinite' }} />
              <Typography sx={{ fontSize: '0.68rem', color: accentColor, fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700 }}>
                {isPending ? 'HOLD' : 'OFFLINE'}
              </Typography>
            </Stack>
          </Box>

          {/* ── Bubbles ─────────────────────────────────────────────── */}
          {BUBBLES.map((b, i) => (
            <Box key={i} sx={{
              position: 'absolute', bottom: '-5%', left: b.left,
              width: b.size, height: b.size, borderRadius: '50%',
              border: '1.5px solid rgba(140,220,255,0.55)',
              bgcolor: 'rgba(140,220,255,0.12)',
              boxShadow: '0 0 6px rgba(100,200,255,0.25)',
              animation: `rise ${b.dur} ${b.delay} ease-in infinite`,
              pointerEvents: 'none',
            }} />
          ))}

          {/* ── Floating diver silhouette ─────────────────────────── */}
          <Box sx={{
            position: 'absolute', bottom: 52, right: { xs: 20, md: 80 },
            opacity: 0.2, animation: 'float 4s ease-in-out infinite',
          }}>
            <svg width="52" height="28" viewBox="0 0 52 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Surface line */}
              <line x1="0" y1="10" x2="52" y2="10" stroke="rgba(140,220,255,0.5)" strokeWidth="1" />
              {/* Head (above surface) */}
              <circle cx="12" cy="6" r="4.5" fill="white" />
              {/* Tank */}
              <rect x="9" y="10" width="5" height="3" rx="1" fill="white" />
              {/* Body (horizontal, at surface) */}
              <rect x="12" y="11" width="18" height="7" rx="3" fill="white" />
              {/* Arm stretched forward */}
              <line x1="30" y1="14" x2="42" y2="12" stroke="white" strokeWidth="2" strokeLinecap="round" />
              {/* Legs back */}
              <line x1="12" y1="15" x2="2" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="12" y1="16" x2="2" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              {/* Fins */}
              <ellipse cx="1" cy="18" rx="5" ry="1.8" fill="white" transform="rotate(-10 1 18)" />
              <ellipse cx="1" cy="22" rx="5" ry="1.8" fill="white" transform="rotate(10 1 22)" />
            </svg>
          </Box>

          {/* ── HOLD / CLOSED card ──────────────────────────────────── */}
          <Box sx={{
            width: { xs: 158, sm: 196 }, height: { xs: 216, sm: 272 },
            background: `linear-gradient(160deg, ${cardBg} 0%, ${cardBgGrad} 100%)`,
            borderRadius: 3,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            mb: 4,
            boxShadow: cardShadow,
            animation: 'cardDrop 0.75s cubic-bezier(0.22,1,0.36,1) both',
            position: 'relative', overflow: 'hidden',
          }}>
            {/* sheen */}
            <Box sx={{ position: 'absolute', top: 0, left: '-50%', width: '45%', height: '100%', background: 'linear-gradient(108deg, transparent 38%, rgba(255,255,255,0.07) 50%, transparent 62%)', pointerEvents: 'none' }} />
            {/* scanline */}
            <Box sx={{ position: 'absolute', left: 0, right: 0, height: 2, bgcolor: 'rgba(255,255,255,0.05)', top: '40%', pointerEvents: 'none' }} />

            <Typography sx={{
              fontSize: { xs: isPending ? '3.2rem' : '2.8rem', sm: isPending ? '4rem' : '3.5rem' },
              fontWeight: 900, color: 'white', lineHeight: 1,
              letterSpacing: isPending ? '-2px' : '-1px',
              fontFamily: 'Poppins, sans-serif',
              animation: 'pulse 3s ease-in-out infinite',
              textShadow: '0 2px 24px rgba(0,0,0,0.5)',
            }}>
              {cardText}
            </Typography>

            <Box sx={{ width: 44, height: 2, bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 1, my: 1.5 }} />

            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              {isPending ? 'Not Cleared' : 'Dive Site'}
            </Typography>
          </Box>

          {/* ── Badge ───────────────────────────────────────────────── */}
          <Box sx={{
            display: 'inline-flex', alignItems: 'center', gap: 1,
            bgcolor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, px: 2, py: 0.6, mb: 2.5,
          }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: accentColor }} />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
              {badgeText}
            </Typography>
          </Box>

          {/* Headline */}
          <Typography sx={{
            fontSize: { xs: '1.55rem', sm: '1.9rem' },
            fontWeight: 900, color: 'white',
            letterSpacing: '-0.5px', textAlign: 'center', lineHeight: 1.2,
            mb: 1.25, fontFamily: 'Poppins, sans-serif',
            textShadow: `0 2px 20px ${accentGlow}`,
          }}>
            {headline}
          </Typography>

          <Typography sx={{
            fontSize: { xs: '0.87rem', sm: '0.95rem' },
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center', maxWidth: 340,
            lineHeight: 1.8, mb: 4.5,
          }}>
            {subText}
          </Typography>

          {/* Button */}
          <Button component={Link} href="/dive-sites" variant="contained" size="large" sx={{
            bgcolor: 'white', color: '#07070f', fontWeight: 800,
            borderRadius: 10, px: 3.5, py: 1.25, fontSize: '0.9rem', textTransform: 'none',
            boxShadow: '0 4px 24px rgba(255,255,255,0.1)',
            '&:hover': { bgcolor: '#f0f0f0', transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(255,255,255,0.18)' },
            transition: 'all 0.2s',
          }}>
            ↑ Surface
          </Button>

          {/* Footer */}
          <Typography sx={{
            position: 'absolute', bottom: 18,
            fontSize: '0.62rem', color: 'rgba(255,255,255,0.1)',
            letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace',
          }}>
            {isPending ? 'status: pending · cleared: no · eta: unknown' : 'status: archived · access: closed'}
          </Typography>
        </Box>
      );
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>

      {/* Admin status banner for non-active sites */}
      {site.status !== 'active' && isAdmin && (
        <Box sx={{
          bgcolor: site.status === 'pending' ? '#fff8e1' : '#fce4ec',
          borderBottom: '2px solid',
          borderColor: site.status === 'pending' ? '#f59e0b' : '#e53935',
          px: 3, py: 1.25,
          display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <Chip
            label={site.status.toUpperCase()}
            size="small"
            color={site.status === 'pending' ? 'warning' : 'error'}
            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
          />
          <Typography variant="body2" fontWeight={600}>
            This site is <strong>{site.status}</strong> — only visible to admins.
          </Typography>
          <Button
            size="small"
            variant="outlined"
            color={site.status === 'pending' ? 'warning' : 'error'}
            component={Link}
            href="/admin/dive-sites"
            sx={{ ml: 'auto', fontSize: '0.75rem' }}
          >
            Manage in Admin
          </Button>
        </Box>
      )}

      {/* Sticky bar — fixed below navbar, shown after hero scrolls off */}
      {showBar && (
        <Box sx={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1099,
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
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<BlockIcon sx={{ fontSize: '14px !important' }} />}
                  onClick={() => setRemovalOpen(true)}
                  sx={{
                    borderColor: '#c62828', color: '#c62828', fontWeight: 600,
                    fontSize: '0.78rem', py: 0.4, whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#fff5f5', borderColor: '#b71c1c' },
                  }}
                >
                  Not friendly
                </Button>
              </Stack>
            )}
          </Container>
        </Box>
      )}

      {/* Hero */}
      <Box ref={heroRef} sx={{ background: 'linear-gradient(135deg, #001f3f 0%, #0077be 100%)', color: 'white', py: { xs: 3, md: 4 }, px: 2 }}>
        <Container maxWidth="lg">
          {/* Breadcrumb */}
          <Stack component="nav" aria-label="Breadcrumb" direction="row" alignItems="center" spacing={0.5} mb={2}>
            <Typography
              component={Link} href="/dive-sites"
              sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', textDecoration: 'none', '&:hover': { color: 'rgba(255,255,255,0.8)' }, transition: 'color 0.15s', '&:focus-visible': { outline: '2px solid white', borderRadius: '2px', outlineOffset: '2px' } }}
            >
              Dive Sites
            </Typography>
            {site.country && (() => {
              const countrySlug = site.country.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
              return (
                <>
                  <NavigateNextIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.25)' }} aria-hidden="true" />
                  <Typography
                    component={Link} href={`/dive-sites/country/${countrySlug}`}
                    sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', textDecoration: 'none', '&:hover': { color: 'rgba(255,255,255,0.8)' }, transition: 'color 0.15s', '&:focus-visible': { outline: '2px solid white', borderRadius: '2px', outlineOffset: '2px' } }}
                  >
                    {site.country}
                  </Typography>
                </>
              );
            })()}
            <NavigateNextIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.25)' }} aria-hidden="true" />
            <Typography aria-current="page" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem', fontWeight: 500 }}>
              {site.name}
            </Typography>
          </Stack>

          {/* Two-column on desktop: title left, meta right */}
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'flex-start' }} justifyContent="space-between" spacing={{ xs: 1.5, md: 3 }}>
            {/* Left: title */}
            <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
              <Stack direction="row" alignItems="flex-start" spacing={1}>
                <Typography
                  variant="h1"
                  fontWeight={800}
                  sx={{ fontSize: { xs: '1.6rem', md: '2rem' }, lineHeight: 1.2, mb: 0, flex: '1 1 auto' }}
                >
                  {site.name}
                </Typography>
                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0, mt: 0.25 }}>
                  <Tooltip title={bookmarked ? 'Remove from saved' : 'Save this site'} placement="top">
                    <IconButton
                      onClick={toggleBookmark}
                      size="small"
                      sx={{
                        color: bookmarked ? '#ffcc02' : 'rgba(255,255,255,0.55)',
                        '&:hover': { color: bookmarked ? '#ffe066' : 'rgba(255,255,255,0.9)', bgcolor: 'rgba(255,255,255,0.1)' },
                      }}
                      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this site'}
                    >
                      {bookmarked ? <BookmarkIcon fontSize="medium" /> : <BookmarkBorderIcon fontSize="medium" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={copySuccess ? 'Link copied!' : 'Share this site'} placement="top">
                    <IconButton
                      onClick={handleShare}
                      size="small"
                      sx={{
                        color: copySuccess ? '#69f0ae' : 'rgba(255,255,255,0.55)',
                        '&:hover': { color: 'rgba(255,255,255,0.9)', bgcolor: 'rgba(255,255,255,0.1)' },
                      }}
                      aria-label="Share"
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
              {site.verified && (
                <Stack direction="row" alignItems="center" spacing={0.5} mt={0.75}>
                  <VerifiedIcon sx={{ fontSize: 15, color: '#69f0ae' }} />
                  <Typography variant="caption" sx={{ color: '#69f0ae', fontWeight: 600, fontSize: '0.75rem' }}>
                    Verified by Blue Mind team
                  </Typography>
                </Stack>
              )}
              {(site.activities?.length ?? 0) > 0 && (
                <Stack direction="row" spacing={1} mt={1.25} flexWrap="wrap" useFlexGap>
                  {(site.activities ?? []).includes('line_diving') && (
                    <Chip
                      label="🪢 Line Diving"
                      size="small"
                      sx={{
                        fontWeight: 700, fontSize: '0.8rem', height: 26,
                        bgcolor: 'rgba(0,119,190,0.85)', color: 'white',
                        border: '1.5px solid rgba(79,195,247,0.7)',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  )}
                  {(site.activities ?? []).includes('snorkeling') && (
                    <Chip
                      label="🤿 Snorkeling"
                      size="small"
                      sx={{
                        fontWeight: 700, fontSize: '0.8rem', height: 26,
                        bgcolor: 'rgba(0,137,123,0.85)', color: 'white',
                        border: '1.5px solid rgba(128,203,196,0.7)',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  )}
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

              {/* Tags — link to tag pages */}
              {site.tags?.length > 0 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {site.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      component={Link}
                      href={`/dive-sites/tag/${tag.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`}
                      clickable
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        color: 'rgba(255,255,255,0.85)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        fontWeight: 500,
                        fontSize: '0.68rem',
                        height: 20,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>

          {/* Hero action row */}
          <Stack direction="row" spacing={1} mt={2.5} flexWrap="wrap" useFlexGap alignItems="center">
            {/* Dive log */}
            <Button
              variant={hasDived ? 'outlined' : 'contained'}
              size="small"
              startIcon={<ScubaDivingIcon sx={{ fontSize: '15px !important' }} />}
              onClick={handleDiveLog}
              disabled={hasDived || diving}
              sx={hasDived ? {
                borderColor: 'rgba(255,255,255,0.5)', color: 'rgba(255,255,255,0.85)',
                fontWeight: 600, fontSize: '0.78rem',
                '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.5)' },
              } : {
                bgcolor: 'rgba(0,119,190,0.75)', color: 'white', fontWeight: 600,
                fontSize: '0.78rem', boxShadow: 'none',
                '&:hover': { bgcolor: 'rgba(0,119,190,0.95)', boxShadow: 'none' },
              }}
            >
              {hasDived ? "You've dived here" : diving ? 'Logging…' : "I've dived here"}
            </Button>

            {/* Data accuracy */}
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
                    color: 'white', fontWeight: 600, fontSize: '0.78rem', boxShadow: 'none',
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
                    borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.75)',
                    fontWeight: 600, fontSize: '0.78rem',
                    '&:hover': { borderColor: 'white', color: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  Report incorrect
                </Button>
              </>
            )}
            <Button
              variant="outlined"
              size="small"
              startIcon={<BlockIcon sx={{ fontSize: '14px !important' }} />}
              onClick={() => setRemovalOpen(true)}
              sx={{
                borderColor: 'rgba(255,100,100,0.45)', color: 'rgba(255,160,160,0.9)',
                fontWeight: 600, fontSize: '0.78rem',
                '&:hover': { borderColor: 'rgba(255,100,100,0.8)', color: '#ff8a80', bgcolor: 'rgba(255,80,80,0.08)' },
              }}
            >
              Not freediving friendly
            </Button>
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

            {/* Community curation card */}
            <Box
              sx={{
                mb: 3,
                borderRadius: 3,
                overflow: 'hidden',
                border: '1px solid #e5e0d6',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* Top accent strip */}
              <Box sx={{ height: 4, background: 'linear-gradient(90deg, #d97706 0%, #f59e0b 50%, #10b981 100%)' }} />

              <Box sx={{ bgcolor: '#fdfcf8', px: { xs: 2, sm: 3 }, pt: 2.25, pb: 2.5 }}>
                <Typography fontWeight={800} sx={{ fontSize: '1rem', color: '#1c1917', mb: 0.5, letterSpacing: '-0.01em' }}>
                  Know this site? Help keep the data accurate.
                </Typography>
                <Typography sx={{ fontSize: '0.88rem', color: '#78716c', mb: 2, lineHeight: 1.55 }}>
                  This listing is community-verified. Choose an action below — no account needed.
                </Typography>

                <Stack spacing={1}>
                  {/* Verify */}
                  <Box
                    component="button"
                    onClick={handleVerify}
                    disabled={hasVerified || verifying || site.verified}
                    sx={{
                      all: 'unset',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: hasVerified || site.verified ? 'default' : 'pointer',
                      bgcolor: hasVerified || site.verified ? '#f0fdf4' : '#f0fdf4',
                      border: '1px solid',
                      borderColor: hasVerified || site.verified ? '#86efac' : '#bbf7d0',
                      borderRadius: 2,
                      px: 2, py: 1.25,
                      transition: 'all 0.15s',
                      opacity: verifying ? 0.6 : 1,
                      '&:hover:not(:disabled)': hasVerified || site.verified ? {} : { borderColor: '#4ade80', bgcolor: '#dcfce7' },
                    }}
                  >
                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: hasVerified || site.verified ? '#4ade80' : '#bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography fontWeight={900} sx={{ fontSize: '0.9rem', color: '#15803d', lineHeight: 1 }}>✓</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography fontWeight={700} sx={{ fontSize: '0.92rem', color: '#15803d', lineHeight: 1.2 }}>
                        {site.verified ? 'Verified by Blue Mind team' : hasVerified ? 'You verified this — thank you!' : verifying ? 'Saving…' : 'Data looks correct'}
                      </Typography>
                      {!site.verified && !hasVerified && (
                        <Typography sx={{ fontSize: '0.82rem', color: '#16a34a', opacity: 0.8, lineHeight: 1.3 }}>
                          Confirm depth, location & water type are accurate
                        </Typography>
                      )}
                    </Box>
                    {(site.verified || hasVerified) && (
                      <Typography sx={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 700 }}>✓</Typography>
                    )}
                  </Box>

                  {/* Correct */}
                  <Box
                    component="button"
                    onClick={() => setCorrectionOpen(true)}
                    sx={{
                      all: 'unset',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                      bgcolor: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: 2,
                      px: 2, py: 1.25,
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: '#f59e0b', bgcolor: '#fef3c7' },
                    }}
                  >
                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography fontWeight={900} sx={{ fontSize: '0.88rem', color: '#92400e', lineHeight: 1 }}>✏</Typography>
                    </Box>
                    <Box>
                      <Typography fontWeight={700} sx={{ fontSize: '0.92rem', color: '#92400e', lineHeight: 1.2 }}>Suggest a correction</Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#b45309', opacity: 0.85, lineHeight: 1.3 }}>Fix wrong name, coordinates, depth or type</Typography>
                    </Box>
                  </Box>

                  {/* Flag removal */}
                  <Box
                    component="button"
                    onClick={() => setRemovalOpen(true)}
                    sx={{
                      all: 'unset',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      cursor: 'pointer',
                      bgcolor: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: 2,
                      px: 2, py: 1.25,
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: '#f87171', bgcolor: '#ffe4e6' },
                    }}
                  >
                    <Box sx={{ width: 30, height: 30, borderRadius: '50%', bgcolor: '#fecdd3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography fontWeight={900} sx={{ fontSize: '0.88rem', color: '#be123c', lineHeight: 1 }}>✕</Typography>
                    </Box>
                    <Box>
                      <Typography fontWeight={700} sx={{ fontSize: '0.92rem', color: '#be123c', lineHeight: 1.2 }}>Flag for removal</Typography>
                      <Typography sx={{ fontSize: '0.82rem', color: '#e11d48', opacity: 0.8, lineHeight: 1.3 }}>Not freediving-friendly or inaccessible?</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </Box>

            {/* Description */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>About This Site</Typography>
              {site.description
                .split(/\n\n+/)
                .filter(Boolean)
                .map((para, i) => (
                  <Typography
                    key={i}
                    variant="body1"
                    sx={{
                      lineHeight: 1.85,
                      mb: i < site.description.split(/\n\n+/).length - 1 ? 2 : 0,
                      color: i === 0 ? 'text.primary' : 'text.secondary',
                      fontSize: i === 0 ? '1rem' : '0.95rem',
                    }}
                  >
                    {para}
                  </Typography>
                ))}
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

            {/* Marine Life */}
            {site.marineLife && (
              (() => {
                const ml = site.marineLife!;
                const categories = [
                  { key: 'fish',    label: 'Fish',            icon: <SetMealIcon sx={{ fontSize: 16 }} />,     color: '#0ea5e9', bg: '#f0f9ff', items: ml.fish },
                  { key: 'macro',   label: 'Macro & Critters', icon: <PestControlIcon sx={{ fontSize: 16 }} />, color: '#7c3aed', bg: '#faf5ff', items: ml.macro },
                  { key: 'corals',  label: 'Corals & Plants',  icon: <BubbleChartIcon sx={{ fontSize: 16 }} />, color: '#059669', bg: '#f0fdf4', items: ml.corals },
                  { key: 'pelagic', label: 'Pelagic',          icon: <WavesIcon sx={{ fontSize: 16 }} />,       color: '#0369a1', bg: '#e0f2fe', items: ml.pelagic },
                ].filter(c => c.items && c.items.length > 0);

                if (categories.length === 0 && (!ml.specialSightings || ml.specialSightings.length === 0)) return null;

                return (
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>Marine Life</Typography>

                    <Stack spacing={2.5}>
                      {categories.map(cat => (
                        <Box key={cat.key}>
                          <Stack direction="row" spacing={0.75} alignItems="center" mb={1.25}>
                            <Box sx={{ color: cat.color }}>{cat.icon}</Box>
                            <Typography variant="caption" fontWeight={700} sx={{ color: cat.color, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                              {cat.label}
                            </Typography>
                          </Stack>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                            {cat.items.map((item: Record<string, string>, i: number) => {
                              const name = item.name || item.type || '';
                              const sci = item.scientificName;
                              const freq = item.frequency;
                              return (
                                <Tooltip
                                  key={i}
                                  title={sci ? `${sci}${freq ? ` · ${freq}` : ''}` : (freq || '')}
                                  placement="top"
                                  arrow
                                >
                                  <Chip
                                    label={name}
                                    size="small"
                                    sx={{
                                      bgcolor: cat.bg,
                                      color: cat.color,
                                      border: `1px solid ${cat.color}22`,
                                      fontWeight: 500,
                                      fontSize: '0.75rem',
                                      cursor: sci ? 'help' : 'default',
                                      '& .MuiChip-label': { px: 1.25 },
                                    }}
                                  />
                                </Tooltip>
                              );
                            })}
                          </Box>
                        </Box>
                      ))}

                      {ml.specialSightings && ml.specialSightings.length > 0 && (
                        <Box>
                          <Stack direction="row" spacing={0.75} alignItems="center" mb={1.25}>
                            <AutoAwesomeIcon sx={{ fontSize: 16, color: '#d97706' }} />
                            <Typography variant="caption" fontWeight={700} sx={{ color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>
                              Special Sightings
                            </Typography>
                          </Stack>
                          <Stack spacing={0.75}>
                            {ml.specialSightings.map((s, i) => (
                              <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                                <AutoAwesomeIcon sx={{ fontSize: 14, color: '#d97706', mt: 0.3, flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{s}</Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  </Paper>
                );
              })()
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
            {site.facilitiesEnhanced && (
              (() => {
                const f = site.facilitiesEnhanced!;
                const items = [
                  { key: 'diveCenter',    label: 'Dive Center',    icon: '🤿' },
                  { key: 'restaurant',    label: 'Restaurant',     icon: '🍽️' },
                  { key: 'parking',       label: 'Parking',        icon: '🅿️' },
                  { key: 'equipment',     label: 'Equipment Hire', icon: '🎽' },
                  { key: 'accommodation', label: 'Accommodation',  icon: '🏨' },
                ].filter(item => f[item.key as keyof typeof f] === true);

                if (items.length === 0 && (!f.depthMarkers || f.depthMarkers.length === 0)) return null;

                return (
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                    <Typography variant="h6" fontWeight={700} mb={2}>Facilities</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {items.map(item => (
                        <Chip
                          key={item.key}
                          label={`${item.icon} ${item.label}`}
                          size="small"
                          sx={{ bgcolor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', fontWeight: 500 }}
                        />
                      ))}
                      {f.depthMarkers && f.depthMarkers.length > 0 && (
                        <Chip
                          label={`📏 Depth markers: ${f.depthMarkers.join(', ')}`}
                          size="small"
                          sx={{ bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', fontWeight: 500 }}
                        />
                      )}
                    </Stack>
                  </Paper>
                );
              })()
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
                {(site.activities?.length ?? 0) > 0 && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Activities</Typography>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="flex-end">
                      {(site.activities ?? []).includes('line_diving') && (
                        <Chip label="Line Diving" size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: '#e3f2fd', color: '#0055a5', border: '1.5px solid #90caf9' }} />
                      )}
                      {(site.activities ?? []).includes('snorkeling') && (
                        <Chip label="Snorkeling" size="small" sx={{ fontWeight: 700, fontSize: '0.75rem', bgcolor: '#e0f2f1', color: '#00695c', border: '1.5px solid #80cbc4' }} />
                      )}
                    </Stack>
                  </Stack>
                )}
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
                {hasCoordinates && (
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, mr: 1 }}>Coordinates</Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {toDDM(lat, lng)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                        {lat.toFixed(6)}, {lng.toFixed(6)}
                      </Typography>
                    </Box>
                  </Stack>
                )}
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

            {/* Community rating */}
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1.5}>
                COMMUNITY RATING
              </Typography>
              {ratingSummary ? (
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#f59e0b', lineHeight: 1 }}>
                    {ratingSummary.avg.toFixed(1)}
                  </Typography>
                  <StarRating value={ratingSummary.avg} />
                  <Typography variant="caption" color="text.secondary">({ratingSummary.count})</Typography>
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" mb={1.5} sx={{ fontSize: '0.82rem' }}>
                  No ratings yet — be the first!
                </Typography>
              )}
              {userRating !== null ? (
                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 600, fontSize: '0.82rem' }}>
                  ✓ You rated this {userRating} star{userRating !== 1 ? 's' : ''}
                </Typography>
              ) : (
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>Rate this site:</Typography>
                  <StarRating
                    value={hoverRating ?? 0}
                    interactive
                    onRate={handleRating}
                    onHover={setHoverRating}
                  />
                  {ratingSubmitting && (
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>Saving…</Typography>
                  )}
                </Box>
              )}
            </Paper>

            {/* Dive count */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>Dived Here</Typography>
                  {diveCount !== null && diveCount > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      🤿 {diveCount} {diveCount === 1 ? 'diver' : 'divers'} logged this
                    </Typography>
                  )}
                </Box>
                <Button
                  variant={hasDived ? 'text' : 'outlined'}
                  size="small"
                  disabled={hasDived || diving}
                  onClick={handleDiveLog}
                  sx={hasDived
                    ? { color: 'success.main', fontWeight: 600, fontSize: '0.78rem' }
                    : { borderColor: '#0077be', color: '#0077be', fontWeight: 600, fontSize: '0.78rem', '&:hover': { bgcolor: '#f0f7ff' } }
                  }
                >
                  {hasDived ? '✓ Logged' : diving ? 'Logging…' : "I've dived here"}
                </Button>
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

            {/* Not freediving friendly */}
            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 2, borderColor: '#ffcdd2', bgcolor: '#fff5f5', mt: 2 }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <BlockIcon sx={{ color: 'error.dark', mt: 0.25, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} color="error.dark" mb={0.5}>
                    Not freediving friendly?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1.5} sx={{ lineHeight: 1.6 }}>
                    If this site is scuba-only, inaccessible, or otherwise unsuitable for freediving, request its removal from the directory.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<BlockIcon />}
                    onClick={() => setRemovalOpen(true)}
                    size="small"
                    fullWidth
                    sx={{ bgcolor: 'error.dark', '&:hover': { bgcolor: 'error.main' } }}
                  >
                    Request Removal
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
      <NotFreedivingFriendlyDialog
        open={removalOpen}
        onClose={() => setRemovalOpen(false)}
        site={site}
      />
    </Box>
  );
}
