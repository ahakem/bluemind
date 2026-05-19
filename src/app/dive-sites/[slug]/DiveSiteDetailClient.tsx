'use client';

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
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Link from 'next/link';
import { DiveSite, Thermocline } from '@/types/admin';

const DIFFICULTY_COLORS: Record<DiveSite['difficulty'], 'success' | 'warning' | 'error'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'error',
};

const WATER_TYPE_LABELS: Record<DiveSite['waterType'], string> = {
  lake: 'Lake',
  sea: 'Sea',
  quarry: 'Quarry',
  river: 'River',
  pool: 'Pool',
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

      {/* Bars */}
      <Box sx={{ display: 'flex', gap: '3px', alignItems: 'flex-end' }}>
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DiveSiteDetailClient({ site }: { site: DiveSite }) {
  const mapsUrl = `https://www.google.com/maps?q=${site.coordinates.lat},${site.coordinates.lng}`;
  const embedUrl = `https://maps.google.com/maps?q=${site.coordinates.lat},${site.coordinates.lng}&z=13&output=embed`;
  const currentMonthKey = MONTH_KEYS[new Date().getMonth()];
  const currentTemp = site.waterTemp[currentMonthKey];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #001f3f 0%, #0077be 100%)', color: 'white', py: { xs: 6, md: 8 }, px: 2 }}>
        <Container maxWidth="lg">
          <Button
            component={Link}
            href="/dive-sites"
            startIcon={<ArrowBackIcon />}
            sx={{ color: 'rgba(255,255,255,0.75)', mb: 2, '&:hover': { color: 'white' } }}
          >
            All Dive Sites
          </Button>
          <Stack direction="row" spacing={1.5} mb={2} flexWrap="wrap" useFlexGap>
            <Chip label={site.difficulty.charAt(0).toUpperCase() + site.difficulty.slice(1)} color={DIFFICULTY_COLORS[site.difficulty]} size="small" sx={{ fontWeight: 700 }} />
            <Chip label={WATER_TYPE_LABELS[site.waterType]} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white' }} />
            {site.thermocline && (
              <Chip
                icon={<ThermostatIcon sx={{ fontSize: '14px !important', color: '#4fc3f7 !important' }} />}
                label={`Thermocline ~${site.thermocline.depth}m`}
                size="small"
                sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)', border: '1px solid rgba(79,195,247,0.5)' }}
              />
            )}
            {site.bestSeasons.map((s) => (
              <Chip key={s} label={s} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.85)' }} />
            ))}
          </Stack>
          <Typography variant="h2" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '2.8rem' } }}>
            {site.name}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <PlaceIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.7)' }} />
            <Typography sx={{ color: 'rgba(255,255,255,0.7)' }}>
              {site.location}, {site.country}
            </Typography>
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
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <WaterTempChart waterTemp={site.waterTemp} />
            </Paper>

            {/* Facilities */}
            {site.facilities.length > 0 && (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" fontWeight={700} mb={1.5}>Facilities</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {site.facilities.map((f) => (
                    <Chip key={f} label={f} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Paper>
            )}
          </Grid>

          {/* ── Right column ── */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Map */}
            <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', mb: 3 }}>
              <Box
                component="iframe"
                src={embedUrl}
                width="100%"
                height={260}
                sx={{ border: 'none', display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <Box sx={{ p: 2 }}>
                <Button
                  component="a"
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<OpenInNewIcon />}
                  size="small"
                  fullWidth
                  variant="outlined"
                >
                  Open in Google Maps
                </Button>
              </Box>
            </Paper>

            {/* Site details */}
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={2}>
                SITE DETAILS
              </Typography>
              <Stack spacing={1.5} divider={<Divider />}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Difficulty</Typography>
                  <Chip label={site.difficulty} color={DIFFICULTY_COLORS[site.difficulty]} size="small" sx={{ fontWeight: 600, height: 20, fontSize: '0.7rem' }} />
                </Stack>
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
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
