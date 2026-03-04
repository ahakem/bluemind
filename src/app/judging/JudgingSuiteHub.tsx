'use client';

import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
} from '@mui/material';
import Link from 'next/link';
import GavelIcon from '@mui/icons-material/Gavel';
import CalculateIcon from '@mui/icons-material/Calculate';
import StraightenIcon from '@mui/icons-material/Straighten';

export default function JudgingSuiteHub() {
  return (
    <Box
      component="main"
      sx={{
        background: 'linear-gradient(180deg, #f0f6fc 0%, #ffffff 100%)',
        minHeight: '80vh',
        pt: { xs: 4, sm: 6 },
        pb: { xs: 6, sm: 8 },
        px: { xs: 2, sm: 0 },
      }}
    >
      <Container maxWidth="md">
        {/* ── Header ── */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, sm: 5 } }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #0056b3, #1a75cf)',
              mb: 2,
              boxShadow: '0 8px 32px rgba(0, 86, 179, 0.25)',
            }}
          >
            <GavelIcon sx={{ fontSize: '2rem', color: '#ffffff' }} />
          </Box>
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '1.6rem', sm: '2.2rem' },
              fontWeight: 900,
              color: '#0056b3',
              mb: 1,
              lineHeight: 1.2,
            }}
          >
            AIDA Freediving Judge Suite
          </Typography>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '0.95rem', sm: '1.1rem' },
              fontWeight: 500,
              color: '#5a7da5',
              maxWidth: 520,
              mx: 'auto',
            }}
          >
            Professional tools for freediving judges, updated for AIDA v17.7 rules
          </Typography>
          <Chip
            label="AIDA 2025 • v17.7"
            size="small"
            sx={{
              mt: 1.5,
              fontWeight: 700,
              fontSize: '0.7rem',
              backgroundColor: '#e8f0fe',
              color: '#0056b3',
              borderRadius: '8px',
            }}
          />
        </Box>

        {/* ── Feature Cards Grid ── */}
        <Grid container spacing={3} sx={{ mb: { xs: 5, sm: 6 } }}>
          {/* Card 1: Scoring & Penalties */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                border: '1.5px solid #e0e7ef',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 86, 179, 0.08)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 86, 179, 0.15)',
                  borderColor: '#0056b3',
                },
              }}
            >
              <CardContent sx={{ flex: 1, p: { xs: 2.5, sm: 3 } }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: '#e8f0fe',
                    mb: 2,
                  }}
                >
                  <CalculateIcon sx={{ fontSize: '1.5rem', color: '#0056b3' }} />
                </Box>
                <Typography
                  variant="h3"
                  component="h3"
                  sx={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#212121',
                    mb: 1,
                  }}
                >
                  Scoring
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.9rem',
                    color: '#5a7da5',
                    lineHeight: 1.6,
                  }}
                >
                  Automated point calculation and penalty coding (UNDER AP, EARLY/LATE
                  START, TURN, PULL) for all pool disciplines. Covers all DQ codes
                  and score breakdowns.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                  {['STA', 'DYN', 'DYNB', 'DNF'].map((d) => (
                    <Chip
                      key={d}
                      label={d}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 22,
                        backgroundColor: '#f0f6fc',
                        color: '#0056b3',
                        borderRadius: '6px',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ p: { xs: 2.5, sm: 3 }, pt: 0 }}>
                <Link href="/judging/scoring" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      py: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #0056b3, #1a75cf)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(0, 86, 179, 0.25)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #003d80, #0056b3)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(0, 86, 179, 0.35)',
                      },
                    }}
                  >
                    Open Scoring
                  </Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>

          {/* Card 2: Pool Distance Tracker */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#ffffff',
                border: '1.5px solid #e0e7ef',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 86, 179, 0.08)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0, 86, 179, 0.15)',
                  borderColor: '#0056b3',
                },
              }}
            >
              <CardContent sx={{ flex: 1, p: { xs: 2.5, sm: 3 } }}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    backgroundColor: '#e8f5f0',
                    mb: 2,
                  }}
                >
                  <StraightenIcon sx={{ fontSize: '1.5rem', color: '#0095b0' }} />
                </Box>
                <Typography
                  variant="h3"
                  component="h3"
                  sx={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#212121',
                    mb: 1,
                  }}
                >
                  Pool Distance Tracker
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.9rem',
                    color: '#5a7da5',
                    lineHeight: 1.6,
                  }}
                >
                  Lap counter and distance calculator for dynamic pool disciplines.
                  Track laps, set pool length, add remaining meters, and get instant
                  total distance.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                  {['Laps', 'Distance', 'Pool Length'].map((d) => (
                    <Chip
                      key={d}
                      label={d}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        height: 22,
                        backgroundColor: '#e8f5f0',
                        color: '#0095b0',
                        borderRadius: '6px',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
              <CardActions sx={{ p: { xs: 2.5, sm: 3 }, pt: 0 }}>
                <Link href="/judging/pool-distance" style={{ textDecoration: 'none', width: '100%' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      py: '10px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #0095b0, #00acc1)',
                      color: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(0, 149, 176, 0.25)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #007a8a, #0095b0)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(0, 149, 176, 0.35)',
                      },
                    }}
                  >
                    Open Tracker
                  </Button>
                </Link>
              </CardActions>
            </Card>
          </Grid>
        </Grid>

        {/* ── SEO Content Section ── */}
        <Box
          component="section"
          aria-label="About AIDA Rules"
          sx={{
            backgroundColor: '#ffffff',
            border: '1.5px solid #e0e7ef',
            borderRadius: '16px',
            p: { xs: 3, sm: 4 },
            boxShadow: '0 2px 12px rgba(0, 86, 179, 0.05)',
          }}
        >
          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              fontWeight: 800,
              color: '#0056b3',
              mb: 2,
            }}
          >
            Built on AIDA Rules &amp; Regulations v17.7
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: '#5a7da5',
              lineHeight: 1.8,
              mb: 2,
            }}
          >
            All tools in this Judge Suite are built strictly based on the{' '}
            <strong>AIDA International Rules for Competitions — Version 17.7
            (January 2025)</strong>. The scoring algorithms implement the official
            point formulas for Static Apnea (STA), Dynamic with Fins (DYN),
            Dynamic with Bi-Fins (DYNB), and Dynamic No-Fins (DNF) pool
            disciplines.
          </Typography>
          <Typography
            sx={{
              fontSize: '0.9rem',
              color: '#5a7da5',
              lineHeight: 1.8,
              mb: 2,
            }}
          >
            Penalty calculations cover all major infraction categories: Under
            Announced Performance (UNDER AP), Early and Late Start timing
            violations, technical fouls (TURN, START, PULL), and all
            Disqualification (DQ) codes including Airway, Surface Protocol, and
            equipment violations.
          </Typography>
          <Typography
            sx={{
              fontSize: '0.85rem',
              color: '#90a4ae',
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            These tools are intended as an aid for competition judges and are not a
            substitute for official AIDA documentation. Always refer to the latest
            published AIDA rulebook for authoritative guidance.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
