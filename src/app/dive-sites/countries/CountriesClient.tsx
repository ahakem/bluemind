'use client';

import { useMemo, useState } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardActionArea,
  TextField, InputAdornment, Stack, Chip, Avatar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import WaterIcon from '@mui/icons-material/Water';
import Link from 'next/link';
import { DiveSite } from '@/types/admin';
import { lookupCountry } from '@/data/countries';
import { getContinents } from '@/data/continents';

interface CountryStat {
  name: string;
  code: string;
  flag: string;
  count: number;
  avgDepth: number | null;
  maxDepth: number;
  seaCount: number;
  lakeCount: number;
  tankCount: number;
  slug: string;
  continents: string[];
}

function flagEmoji(code: string) {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );
}

function buildCountryStats(sites: DiveSite[]): CountryStat[] {
  const map = new Map<string, DiveSite[]>();
  for (const site of sites) {
    // Skip entries where country isn't a recognized country name
    if (!lookupCountry(site.country)) continue;
    const list = map.get(site.country) ?? [];
    list.push(site);
    map.set(site.country, list);
  }

  return Array.from(map.entries())
    .map(([name, list]) => {
      const country = lookupCountry(name);
      const code = country?.code ?? '';
      const withDepth = list.filter((s) => Number(s.maxDepth) > 0);
      const avgDepth = withDepth.length
        ? Math.round(withDepth.reduce((s, x) => s + Number(x.maxDepth), 0) / withDepth.length)
        : null;
      const maxDepth = list.reduce((m, s) => Math.max(m, Number(s.maxDepth) || 0), 0);
      return {
        name,
        code,
        flag: code ? flagEmoji(code) : '🌐',
        count: list.length,
        avgDepth,
        maxDepth,
        seaCount: list.filter((s) => s.waterType === 'sea').length,
        lakeCount: list.filter((s) => s.waterType === 'lake').length,
        tankCount: list.filter((s) => s.waterType === 'deep_tank').length,
        slug: encodeURIComponent(name.toLowerCase()),
        continents: code ? getContinents(code) : [],
      };
    })
    .sort((a, b) => b.count - a.count);
}

const TYPE_COLOR = { sea: '#0077be', lake: '#26a69a', deep_tank: '#5c6bc0' };

export default function CountriesClient({ sites }: { sites: DiveSite[] }) {
  const [search, setSearch] = useState('');

  const stats = useMemo(() => buildCountryStats(sites), [sites]);

  const filtered = useMemo(() => {
    if (!search.trim()) return stats;
    const q = search.toLowerCase();
    return stats.filter((c) => c.name.toLowerCase().includes(q) || c.continents.some((cn) => cn.toLowerCase().includes(q)));
  }, [stats, search]);

  const totalSites = sites.length;
  const totalCountries = stats.length;

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
        {/* decorative circles */}
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, borderRadius: '50%', bgcolor: 'rgba(0,200,255,0.06)', pointerEvents: 'none' }} />

        <Container maxWidth="lg">
          <Stack spacing={1} mb={3}>
            <Typography
              variant="h3"
              fontWeight={900}
              sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, letterSpacing: '-1px', lineHeight: 1.1 }}
            >
              Freediving by Country
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.05rem', maxWidth: 520 }}>
              {totalSites.toLocaleString()} dive sites across {totalCountries} countries — sorted by community activity.
            </Typography>
          </Stack>

          {/* Stat pills */}
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap mb={3}>
            {[
              { label: `${totalCountries} countries` },
              { label: `${totalSites.toLocaleString()} dive sites` },
              { label: `${stats.filter((c) => c.seaCount > 0).length} with sea sites` },
              { label: `${stats.filter((c) => c.lakeCount > 0).length} with lake sites` },
            ].map(({ label }) => (
              <Box
                key={label}
                sx={{
                  bgcolor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 10,
                  px: 1.75,
                  py: 0.5,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.85)',
                }}
              >
                {label}
              </Box>
            ))}
          </Stack>

          {/* Curation callout — in the fold */}
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 3,
              p: { xs: 2, md: 2.5 },
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={{ xs: 1.5, sm: 2 }}>
              <Box>
                <Typography fontWeight={800} sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, color: 'white', lineHeight: 1.3 }}>
                  Know a country&apos;s waters? Help us get it right.
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', mt: 0.4, lineHeight: 1.5 }}>
                  Open any site listing to verify, correct or flag it for removal.
                </Typography>
              </Box>
              <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0, flexWrap: 'wrap' }} useFlexGap>
                {[
                  { symbol: '✓', label: 'Verify', color: '#4ade80', border: 'rgba(74,222,128,0.35)' },
                  { symbol: '✏', label: 'Correct', color: '#60a5fa', border: 'rgba(96,165,250,0.35)' },
                  { symbol: '✕', label: 'Remove', color: '#f87171', border: 'rgba(248,113,113,0.35)' },
                ].map(({ symbol, label, color, border }) => (
                  <Stack key={label} direction="row" alignItems="center" spacing={0.5}
                    sx={{ px: 1.25, py: 0.6, borderRadius: 10, bgcolor: 'rgba(255,255,255,0.06)', border: `1px solid ${border}` }}
                  >
                    <Typography fontWeight={800} sx={{ fontSize: '0.8rem', color, lineHeight: 1 }}>{symbol}</Typography>
                    <Typography fontWeight={600} sx={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.8)' }}>{label}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search */}
        <TextField
          placeholder="Search countries or continents…"
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
          sx={{ mb: 3, maxWidth: 420, bgcolor: 'white', borderRadius: 2 }}
        />

        {filtered.length === 0 && (
          <Typography color="text.secondary" mt={4}>No countries match your search.</Typography>
        )}

        <Grid container spacing={2.5}>
          {filtered.map((c, i) => (
            <Grid key={c.name} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  boxShadow: 2,
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* rank badge */}
                {i < 3 && (
                  <Box
                    sx={{
                      position: 'absolute', top: 10, right: 10, zIndex: 1,
                      width: 24, height: 24, borderRadius: '50%',
                      bgcolor: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#b45309',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'white' }}>{i + 1}</Typography>
                  </Box>
                )}

                <CardActionArea
                  component={Link}
                  href={`/dive-sites/country/${c.slug}`}
                  sx={{ height: '100%', p: 0 }}
                >
                  {/* color bar by primary water type */}
                  <Box
                    sx={{
                      height: 5,
                      bgcolor: c.seaCount >= c.lakeCount ? TYPE_COLOR.sea : TYPE_COLOR.lake,
                    }}
                  />

                  <Box sx={{ p: 2.5 }}>
                    {/* Flag + name */}
                    <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
                      <Avatar
                        sx={{
                          width: 44, height: 44, fontSize: '1.6rem',
                          bgcolor: 'rgba(0,119,190,0.08)',
                          border: '1.5px solid rgba(0,119,190,0.15)',
                        }}
                      >
                        {c.flag}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={700} noWrap sx={{ fontSize: '0.95rem', color: 'text.primary' }}>
                          {c.name}
                        </Typography>
                        {c.continents.length > 0 && (
                          <Typography variant="caption" color="text.secondary" noWrap display="block">
                            {c.continents[0]}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    {/* Site count headline */}
                    <Stack direction="row" alignItems="baseline" spacing={0.5} mb={1.5}>
                      <Typography fontWeight={900} sx={{ fontSize: '1.6rem', color: '#0077be', lineHeight: 1 }}>
                        {c.count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {c.count === 1 ? 'site' : 'sites'}
                      </Typography>
                    </Stack>

                    {/* Water type chips */}
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap mb={1.5}>
                      {c.seaCount > 0 && (
                        <Chip
                          icon={<WaterIcon sx={{ fontSize: '12px !important', color: `${TYPE_COLOR.sea} !important` }} />}
                          label={`${c.seaCount} sea`}
                          size="small"
                          sx={{ fontSize: '0.7rem', bgcolor: '#e3f2fd', color: '#0055a5', border: 'none', height: 20 }}
                        />
                      )}
                      {c.lakeCount > 0 && (
                        <Chip
                          label={`${c.lakeCount} lake`}
                          size="small"
                          sx={{ fontSize: '0.7rem', bgcolor: '#e0f2f1', color: '#00695c', border: 'none', height: 20 }}
                        />
                      )}
                      {c.tankCount > 0 && (
                        <Chip
                          label={`${c.tankCount} tank`}
                          size="small"
                          sx={{ fontSize: '0.7rem', bgcolor: '#ede7f6', color: '#4527a0', border: 'none', height: 20 }}
                        />
                      )}
                    </Stack>

                    {/* Depth */}
                    {(c.avgDepth || c.maxDepth > 0) && (
                      <Typography variant="caption" color="text.secondary">
                        {c.avgDepth ? `avg ${c.avgDepth}m · ` : ''}max {c.maxDepth}m depth
                      </Typography>
                    )}
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Community curation strip */}
      <Box sx={{ bgcolor: '#f0f7ff', borderTop: '1px solid #dbeafe', mt: 2, py: { xs: 5, md: 6 } }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} justifyContent="space-between" spacing={4}>
            <Box sx={{ maxWidth: 420 }}>
              <Typography fontWeight={900} sx={{ fontSize: { xs: '1.15rem', md: '1.3rem' }, color: '#001f3f', letterSpacing: '-0.3px', lineHeight: 1.3, mb: 0.75 }}>
                Know these waters?
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', color: '#4b6a88', lineHeight: 1.65 }}>
                We&apos;re verifying every site in this directory. If you know a location well, open its page and help us get the details right — or flag it if it shouldn&apos;t be here.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexShrink: 0 }}>
              {[
                { symbol: '✓', label: 'Verify', desc: 'Confirm it\'s accurate & freediving-friendly', accent: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
                { symbol: '✏', label: 'Correct', desc: 'Fix depth, location, or water type', accent: '#0077be', bg: '#eff6ff', border: '#bfdbfe' },
                { symbol: '✕', label: 'Remove', desc: 'Flag if it\'s not suitable for freedivers', accent: '#dc2626', bg: '#fff1f2', border: '#fecdd3' },
              ].map(({ symbol, label, desc, accent, bg, border }) => (
                <Box key={label} sx={{ bgcolor: bg, border: `1.5px solid ${border}`, borderRadius: 3, p: 2, minWidth: { sm: 160 } }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={0.75}>
                    <Box sx={{
                      width: 26, height: 26, borderRadius: '50%',
                      bgcolor: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <Typography fontWeight={900} sx={{ fontSize: '0.82rem', color: 'white', lineHeight: 1 }}>{symbol}</Typography>
                    </Box>
                    <Typography fontWeight={800} sx={{ fontSize: '0.88rem', color: accent }}>{label}</Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.4 }}>{desc}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
          <Typography sx={{ mt: 3, fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
            Open any site listing — you&apos;ll find these options on every page.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
