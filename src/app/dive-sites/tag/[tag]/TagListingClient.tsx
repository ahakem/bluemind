'use client';

import { useState, useMemo } from 'react';
import {
  Box, Container, Typography, Grid, Card, CardContent, CardActionArea,
  Chip, Stack, TextField, InputAdornment, Button, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PlaceIcon from '@mui/icons-material/Place';
import PoolIcon from '@mui/icons-material/Pool';
import WaterIcon from '@mui/icons-material/Water';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Link from 'next/link';
import { DiveSite } from '@/types/admin';

const MONTH_KEYS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'] as const;
const WATER_TYPE_LABELS: Record<DiveSite['waterType'], string> = { lake: 'Lake', sea: 'Sea' };
const PAGE_SIZE = 24;

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

interface Props {
  tag: string;
  tagLabel: string;
  sites: DiveSite[];
}

export default function TagListingClient({ tag, tagLabel, sites }: Props) {
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (!search.trim()) return sites;
    const q = search.toLowerCase();
    return sites.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.location.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
    );
  }, [sites, search]);

  // Related tags — all tags across these sites, excluding current
  const relatedTags = useMemo(() => {
    const counts = new Map<string, number>();
    sites.forEach((s) =>
      s.tags.forEach((t) => {
        const slug = t.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        if (slug !== tag) counts.set(slug, (counts.get(slug) ?? 0) + 1);
      })
    );
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([slug]) => ({ slug, label: slug.replace(/-/g, ' ') }));
  }, [sites, tag]);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero */}
      <Box sx={{ background: 'linear-gradient(135deg, #001f3f 0%, #0077be 100%)', color: 'white', py: { xs: 5, md: 7 }, px: 2 }}>
        <Container maxWidth="lg">
          <Button
            component={Link}
            href="/dive-sites"
            startIcon={<ArrowBackIcon />}
            sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, fontSize: '0.8rem', '&:hover': { color: 'white' } }}
            size="small"
          >
            All Dive Sites
          </Button>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
            <WaterIcon sx={{ fontSize: 32, color: '#4fc3f7' }} />
            <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.8rem', md: '2.2rem' }, textTransform: 'capitalize' }}>
              {tagLabel}
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.75)', mb: 2 }}>
            {sites.length} freediving {sites.length === 1 ? 'site' : 'sites'} tagged &ldquo;{tagLabel}&rdquo; worldwide
          </Typography>

          {/* Related tags */}
          {relatedTags.length > 0 && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', alignSelf: 'center', mr: 0.5 }}>
                Related:
              </Typography>
              {relatedTags.map(({ slug, label }) => (
                <Chip
                  key={slug}
                  label={label}
                  size="small"
                  component={Link}
                  href={`/dive-sites/tag/${slug}`}
                  clickable
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.85)',
                    border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.7rem', height: 22,
                    textTransform: 'capitalize',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' },
                  }}
                />
              ))}
            </Stack>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Search within tag */}
        <Box sx={{ mb: 3, maxWidth: 420 }}>
          <TextField
            placeholder={`Search ${tagLabel} sites…`}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(PAGE_SIZE); }}
            size="small" fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" mb={3}>
          {filtered.length} {filtered.length === 1 ? 'site' : 'sites'}{search ? ' match your search' : ''}
        </Typography>

        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h6" color="text.secondary">No sites match your search.</Typography>
            <Button onClick={() => setSearch('')} sx={{ mt: 1 }}>Clear search</Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {filtered.slice(0, visibleCount).map((site) => {
                const temp = currentMonthTemp(site);
                return (
                  <Grid key={site.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card sx={{
                      height: '100%', borderRadius: 3, boxShadow: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
                    }}>
                      <CardActionArea component={Link} href={`/dive-sites/${site.slug}`} sx={{ height: '100%' }}>
                        <Box sx={{ height: 6, background: site.waterType === 'sea' ? 'linear-gradient(90deg, #0077be, #4fc3f7)' : 'linear-gradient(90deg, #26a69a, #80cbc4)' }} />
                        <CardContent sx={{ p: 2.5 }}>
                          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.05rem', lineHeight: 1.3, mb: 0.5 }}>
                            {site.name}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5} mb={1.5}>
                            <PlaceIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                              {site.location}, {site.country}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary"
                            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', mb: 2, lineHeight: 1.5 }}>
                            {site.description}
                          </Typography>
                          <Divider sx={{ mb: 1.5 }} />
                          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Chip icon={<PoolIcon sx={{ fontSize: '14px !important' }} />} label={WATER_TYPE_LABELS[site.waterType]} size="small" variant="outlined" />
                            <Chip label={`↓ ${site.maxDepth}m`} size="small" variant="outlined" />
                            {temp !== null && <Box sx={{ display: 'flex', alignItems: 'center' }}><TempBadge temp={temp} /></Box>}
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {visibleCount < filtered.length && (
              <Box sx={{ textAlign: 'center', mt: 5 }}>
                <Button variant="outlined" size="large" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)} sx={{ borderRadius: 3, px: 5 }}>
                  Load more ({filtered.length - visibleCount} remaining)
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}
