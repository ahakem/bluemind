'use client';

import { useState, useMemo } from 'react';
import {
  Box, Typography, Stack, Chip, Paper, Button, Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PublicIcon from '@mui/icons-material/Public';
import Link from 'next/link';
import { DiveSite } from '@/types/admin';
import { CONTINENTS, Continent, getContinents } from '@/data/continents';
import { lookupCountry } from '@/data/countries';

function countryToSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
}

function flagEmoji(code: string) {
  return code.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );
}

interface CountryEntry {
  name: string;
  slug: string;
  code: string;
  flag: string;
  count: number;
}

export default function ExploreByCountry({ sites }: { sites: DiveSite[] }) {
  const [activeContinent, setActiveContinent] = useState<Continent | 'All'>('All');
  const [expanded, setExpanded] = useState(false);

  const { byContinent, topCountries, continentsWithSites } = useMemo(() => {
    const map = new Map<string, { count: number; code: string }>();
    sites.forEach((s) => {
      const c = lookupCountry(s.country);
      const prev = map.get(s.country) ?? { count: 0, code: c?.code ?? '' };
      map.set(s.country, { count: prev.count + 1, code: prev.code || (c?.code ?? '') });
    });

    const allEntries: CountryEntry[] = [];
    const byContinent = new Map<Continent, CountryEntry[]>();

    map.forEach(({ count, code }, name) => {
      const entry: CountryEntry = { name, slug: countryToSlug(name), code, flag: code ? flagEmoji(code) : '🌊', count };
      allEntries.push(entry);
      const continentList = code ? getContinents(code) : [];
      continentList.forEach((continent) => {
        const existing = byContinent.get(continent) ?? [];
        byContinent.set(continent, [...existing, entry]);
      });
    });

    byContinent.forEach((entries, k) => byContinent.set(k, entries.sort((a, b) => b.count - a.count)));
    const topCountries = allEntries.sort((a, b) => b.count - a.count);
    const continentsWithSites = CONTINENTS.filter((c) => (byContinent.get(c)?.length ?? 0) > 0);
    return { byContinent, topCountries, continentsWithSites };
  }, [sites]);

  const displayed = useMemo(() => {
    const list = activeContinent === 'All'
      ? (() => { const seen = new Set<string>(); return topCountries.filter((e) => seen.has(e.slug) ? false : (seen.add(e.slug), true)); })()
      : (byContinent.get(activeContinent) ?? []);
    return expanded ? list : list.slice(0, 16);
  }, [activeContinent, byContinent, topCountries, expanded]);

  const totalInView = activeContinent === 'All'
    ? topCountries.length
    : (byContinent.get(activeContinent)?.length ?? 0);

  if (sites.length === 0) return null;

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header row */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PublicIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
            BROWSE BY DESTINATION
          </Typography>
        </Stack>
      </Stack>

      {/* Continent tabs */}
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
        <Chip
          label="All"
          size="small"
          onClick={() => { setActiveContinent('All'); setExpanded(false); }}
          variant={activeContinent === 'All' ? 'filled' : 'outlined'}
          color={activeContinent === 'All' ? 'primary' : 'default'}
          sx={{ fontWeight: activeContinent === 'All' ? 700 : 400, cursor: 'pointer' }}
        />
        {continentsWithSites.map((c) => (
          <Chip
            key={c}
            label={c}
            size="small"
            onClick={() => { setActiveContinent(c); setExpanded(false); }}
            variant={activeContinent === c ? 'filled' : 'outlined'}
            color={activeContinent === c ? 'primary' : 'default'}
            sx={{ fontWeight: activeContinent === c ? 700 : 400, cursor: 'pointer' }}
          />
        ))}
      </Box>

      {/* Country chips — horizontal wrap */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {displayed.map((entry) => (
          <Paper
            key={`${entry.slug}-${activeContinent}`}
            component={Link}
            href={`/dive-sites/country/${entry.slug}`}
            variant="outlined"
            sx={{
              display: 'inline-flex', alignItems: 'center', gap: 0.75,
              px: 1.5, py: 0.75, borderRadius: 5, textDecoration: 'none',
              transition: 'all 0.15s',
              '&:hover': { borderColor: '#0077be', bgcolor: '#f0f7ff', transform: 'translateY(-1px)', boxShadow: 2 },
            }}
          >
            <Typography sx={{ fontSize: '1rem', lineHeight: 1 }}>{entry.flag}</Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary', whiteSpace: 'nowrap' }}>
              {entry.name}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 500 }}>
              {entry.count}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Show more */}
      {totalInView > 16 && (
        <Button
          size="small"
          endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
          onClick={() => setExpanded((v) => !v)}
          sx={{ mt: 1.5, color: 'text.secondary', fontSize: '0.78rem' }}
        >
          {expanded ? 'Show less' : `Show all ${totalInView} countries`}
        </Button>
      )}
    </Box>
  );
}
