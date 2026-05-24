'use client';

import { useMemo } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardActionArea,
  Stack, LinearProgress, Chip,
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import WaterIcon from '@mui/icons-material/Water';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DiveSite } from '@/types/admin';
import { lookupCountry } from '@/data/countries';
import { Continent, CONTINENTS, getContinents } from '@/data/continents';

const CONTINENT_META: Record<Continent, { emoji: string; tagline: string; gradient: [string, string] }> = {
  Europe:          { emoji: '🌊', tagline: 'Crystal-clear lakes, rugged Atlantic coasts & Mediterranean warmth', gradient: ['#1a237e', '#1565c0'] },
  Africa:          { emoji: '🐠', tagline: 'Red Sea reefs, Indian Ocean walls & untouched freshwater depths', gradient: ['#1b5e20', '#388e3c'] },
  'Middle East':   { emoji: '🪸', tagline: 'World-class Red Sea visibility & dramatic Gulf diving', gradient: ['#b71c1c', '#d32f2f'] },
  'Asia & Pacific':{ emoji: '🐋', tagline: 'Diverse reefs, whale shark encounters & deep Pacific blue holes', gradient: ['#4a148c', '#7b1fa2'] },
  Americas:        { emoji: '🦈', tagline: 'Caribbean coral gardens, Pacific kelp forests & Andean lakes', gradient: ['#e65100', '#f57c00'] },
  Oceania:         { emoji: '🐬', tagline: 'Pristine reefs, the Great Barrier & remote Pacific atolls', gradient: ['#006064', '#00838f'] },
};

function flagEmoji(code: string) {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );
}

interface ContinentStat {
  name: Continent;
  count: number;
  countries: string[];
  countryCount: number;
  avgDepth: number | null;
  maxDepth: number;
  seaCount: number;
  lakeCount: number;
  tankCount: number;
  topCountries: Array<{ name: string; code: string; count: number }>;
}

function buildStats(sites: DiveSite[]): ContinentStat[] {
  const byCont = new Map<Continent, DiveSite[]>(CONTINENTS.map((c) => [c, []]));

  for (const site of sites) {
    const country = lookupCountry(site.country);
    if (!country) continue;
    const conts = getContinents(country.code);
    for (const cont of conts) {
      byCont.get(cont)?.push(site);
    }
  }

  return CONTINENTS.map((name) => {
    const list = byCont.get(name) ?? [];
    const withDepth = list.filter((s) => Number(s.maxDepth) > 0);
    const avgDepth = withDepth.length
      ? Math.round(withDepth.reduce((s, x) => s + Number(x.maxDepth), 0) / withDepth.length)
      : null;
    const maxDepth = list.reduce((m, s) => Math.max(m, Number(s.maxDepth) || 0), 0);

    // Country breakdown
    const countryMap = new Map<string, number>();
    for (const site of list) {
      countryMap.set(site.country, (countryMap.get(site.country) ?? 0) + 1);
    }
    const topCountries = Array.from(countryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cname, count]) => ({
        name: cname,
        code: lookupCountry(cname)?.code ?? '',
        count,
      }));

    return {
      name,
      count: list.length,
      countries: [...new Set(list.map((s) => s.country))],
      countryCount: countryMap.size,
      avgDepth,
      maxDepth,
      seaCount: list.filter((s) => s.waterType === 'sea').length,
      lakeCount: list.filter((s) => s.waterType === 'lake').length,
      tankCount: list.filter((s) => s.waterType === 'deep_tank').length,
      topCountries,
    };
  }).sort((a, b) => b.count - a.count);
}

export default function ContinentsClient({ sites }: { sites: DiveSite[] }) {
  const router = useRouter();
  const stats = useMemo(() => buildStats(sites), [sites]);
  const totalSites = sites.length;
  const maxCount = Math.max(...stats.map((s) => s.count), 1);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7fafd' }}>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #001f3f 0%, #003d7a 55%, #0077be 100%)',
          color: 'white',
          pt: { xs: 6, md: 8 },
          pb: { xs: 4, md: 6 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 360, height: 360, borderRadius: '50%', bgcolor: 'rgba(0,200,255,0.05)', pointerEvents: 'none' }} />

        <Container maxWidth="lg">
          <Stack spacing={1} mb={3}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <PublicIcon sx={{ fontSize: 32, color: '#4fc3f7' }} />
              <Typography
                variant="h3"
                fontWeight={900}
                sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px', lineHeight: 1.1 }}
              >
                Dive the World
              </Typography>
            </Stack>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 540 }}>
              {totalSites.toLocaleString()} freediving sites across {stats.filter((s) => s.count > 0).length} continents.
              Explore every ocean, lake, and blue hole on the planet.
            </Typography>
          </Stack>

          {/* Mini globe stats */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={3}>
            {stats.filter((s) => s.count > 0).map((s) => (
              <Box
                key={s.name}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  px: 1.75, py: 0.5,
                  fontSize: '0.78rem', fontWeight: 600,
                  color: 'rgba(255,255,255,0.8)',
                }}
              >
                {CONTINENT_META[s.name].emoji} {s.name} · {s.count}
              </Box>
            ))}
          </Stack>

          {/* Curation phase note */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              bgcolor: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.13)',
              borderRadius: 3,
              px: 2.5, py: 1.5,
              flexWrap: 'wrap',
            }}
          >
            <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic', flexShrink: 0 }}>
              Open any site to:
            </Typography>
            {[
              { symbol: '✓', label: 'Verify', color: '#4ade80' },
              { symbol: '✏', label: 'Correct data', color: '#60a5fa' },
              { symbol: '✕', label: 'Flag for removal', color: '#f87171' },
            ].map(({ symbol, label, color }, i) => (
              <Stack key={label} direction="row" alignItems="center" spacing={0.5}>
                {i > 0 && <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />}
                <Typography fontWeight={800} sx={{ fontSize: '0.82rem', color, lineHeight: 1 }}>{symbol}</Typography>
                <Typography fontWeight={600} sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.75)' }}>{label}</Typography>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Grid container spacing={3}>
          {stats.map((s) => {
            const meta = CONTINENT_META[s.name];
            const pct = Math.round((s.count / maxCount) * 100);

            return (
              <Grid key={s.name} size={{ xs: 12, md: 6 }}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    boxShadow: 3,
                    overflow: 'hidden',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 8 },
                  }}
                >
                  <CardActionArea
                    component={Link}
                    href={`/dive-sites?continent=${encodeURIComponent(s.name)}`}
                    sx={{ height: '100%' }}
                  >
                    {/* Gradient header */}
                    <Box
                      sx={{
                        background: `linear-gradient(135deg, ${meta.gradient[0]} 0%, ${meta.gradient[1]} 100%)`,
                        p: 3,
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Decorative circle */}
                      <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />
                      <Box sx={{ position: 'absolute', bottom: -20, right: 40, width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)' }} />

                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography sx={{ fontSize: '2.4rem', lineHeight: 1, mb: 0.5 }}>{meta.emoji}</Typography>
                          <Typography variant="h5" fontWeight={900} color="white" sx={{ letterSpacing: '-0.5px' }}>
                            {s.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mt: 0.5, maxWidth: 280, lineHeight: 1.4 }}>
                            {meta.tagline}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 2 }}>
                          <Typography fontWeight={900} sx={{ fontSize: '2.6rem', color: 'white', lineHeight: 1 }}>
                            {s.count}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                            SITES
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Progress bar */}
                      <Box mt={2}>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 4, borderRadius: 2,
                            bgcolor: 'rgba(255,255,255,0.15)',
                            '& .MuiLinearProgress-bar': { bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 },
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Body */}
                    <Box sx={{ p: 2.5, bgcolor: 'white' }}>
                      {/* Stats row */}
                      <Stack direction="row" spacing={2} mb={2}>
                        <Box>
                          <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}>
                            {s.countryCount}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>COUNTRIES</Typography>
                        </Box>
                        {s.avgDepth && (
                          <Box>
                            <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}>
                              {s.avgDepth}m
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>AVG DEPTH</Typography>
                          </Box>
                        )}
                        {s.maxDepth > 0 && (
                          <Box>
                            <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}>
                              {s.maxDepth}m
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>MAX DEPTH</Typography>
                          </Box>
                        )}
                      </Stack>

                      {/* Water type pills */}
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap mb={2}>
                        {s.seaCount > 0 && (
                          <Chip
                            icon={<WaterIcon sx={{ fontSize: '12px !important', color: '#0077be !important' }} />}
                            label={`${s.seaCount} sea`}
                            size="small"
                            sx={{ fontSize: '0.72rem', bgcolor: '#e3f2fd', color: '#0055a5', border: 'none', height: 22 }}
                          />
                        )}
                        {s.lakeCount > 0 && (
                          <Chip
                            label={`${s.lakeCount} lake`}
                            size="small"
                            sx={{ fontSize: '0.72rem', bgcolor: '#e0f2f1', color: '#00695c', border: 'none', height: 22 }}
                          />
                        )}
                        {s.tankCount > 0 && (
                          <Chip
                            label={`${s.tankCount} tank`}
                            size="small"
                            sx={{ fontSize: '0.72rem', bgcolor: '#ede7f6', color: '#4527a0', border: 'none', height: 22 }}
                          />
                        )}
                      </Stack>

                      {/* Top countries — use button to avoid nested <a> inside CardActionArea */}
                      {s.topCountries.length > 0 && (
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                          {s.topCountries.map((tc) => (
                            <Box
                              key={tc.name}
                              component="button"
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                e.preventDefault();
                                router.push(`/dive-sites/country/${encodeURIComponent(tc.name.toLowerCase())}`);
                              }}
                              sx={{
                                all: 'unset',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: 0.5,
                                px: 1, py: 0.4,
                                borderRadius: 2,
                                bgcolor: '#f5f5f5',
                                border: '1px solid #e0e0e0',
                                transition: 'all 0.15s',
                                '&:hover': { bgcolor: '#e3f2fd', borderColor: '#0077be' },
                              }}
                            >
                              <Typography sx={{ fontSize: '0.9rem', lineHeight: 1 }}>
                                {tc.code ? flagEmoji(tc.code) : '🌐'}
                              </Typography>
                              <Typography sx={{ fontSize: '0.72rem', fontWeight: 600, color: 'text.secondary' }}>
                                {tc.name}
                              </Typography>
                              <Typography sx={{ fontSize: '0.68rem', color: '#0077be', fontWeight: 700 }}>
                                {tc.count}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </Box>
  );
}
