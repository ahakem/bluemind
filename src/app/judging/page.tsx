import type { Metadata } from 'next';
import { Container, Box, Typography, Button, Chip, Divider } from '@mui/material';
import Link from 'next/link';
import GavelIcon from '@mui/icons-material/Gavel';
import CalculateIcon from '@mui/icons-material/Calculate';
import StraightenIcon from '@mui/icons-material/Straighten';
import TimerIcon from '@mui/icons-material/Timer';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export const metadata: Metadata = {
  title: 'AIDA Freediving Judge Suite - Free Online Scoring & Penalty Tools | Blue Mind Freediving',
  description:
    'Free professional scoring, penalty calculator, and pool distance tracker for AIDA freediving judges. Built for AIDA v17.7 (2025) rules — covering STA, DYN, DNF, CWT, FIM, CNF, and more.',
  keywords: [
    'AIDA judge tools',
    'freediving judge calculator',
    'AIDA 2025 rules',
    'freediving scoring',
    'freediving penalties',
    'AIDA v17.7',
    'freediving judge suite',
    'judgesuite',
    'pool distance tracker',
    'freediving countdown timer',
    'competition countdown',
  ],
  openGraph: {
    title: 'AIDA Freediving Judge Suite - Free Scoring & Penalty Tools',
    description:
      'Professional scoring, penalty, and distance tools for AIDA freediving judges. Free, open, and updated for v17.7 rules.',
    url: 'https://bluemindfreediving.nl/judging',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIDA Freediving Judge Suite',
    description:
      'Free professional tools for freediving judges — scoring, penalties, pool distance tracker.',
  },
  alternates: {
    canonical: 'https://bluemindfreediving.nl/judging',
  },
};

const features = [
  {
    icon: <CalculateIcon sx={{ fontSize: 32, color: '#0056b3' }} />,
    title: 'Scoring & Penalty Calculator',
    description:
      'Instantly calculate scores and penalties for all AIDA pool and depth disciplines. Supports STA, DYN, DNF, CWT, CWTB, FIM, and CNF with full penalty breakdowns including Under AP, Early/Late Start, technical fouls, and all DQ codes.',
  },
  {
    icon: <StraightenIcon sx={{ fontSize: 32, color: '#0056b3' }} />,
    title: 'Pool Distance Tracker',
    description:
      'Track laps and total distance during competitions with a clean, touch-friendly interface. Configurable pool lengths, remaining meters input, and one-tap lap counting — perfect for poolside use.',
  },
  {
    icon: <TimerIcon sx={{ fontSize: 32, color: '#0056b3' }} />,
    title: 'Countdown Timer',
    description:
      'A full-screen competition countdown timer built for Official Top and warm-up timing. Configurable durations, audio cues, and large digits designed to be visible across the pool deck — even from a distance.',
  },
  {
    icon: <GavelIcon sx={{ fontSize: 32, color: '#0056b3' }} />,
    title: 'Built for AIDA v17.7',
    description:
      'Every rule reference, penalty table, and DQ condition is aligned with the official AIDA Rules & Regulations Version 17.7 (January 2025). Updated whenever AIDA publishes new changes.',
  },
];

const highlights = [
  'Free and open to all AIDA judges',
  'Works offline as a PWA — no internet needed poolside',
  'Mobile-first design for tablets and phones',
  'Covers pool (STA, DYN, DNF) and depth (CWT, CWTB, FIM, CNF)',
  'Automatic penalty calculations with clear rule references',
  'Built by active freedivers and judges in the community',
];

export default function JudgingPage() {
  return (
    <Box
      component="main"
      sx={{
        background: 'linear-gradient(180deg, #f0f6fc 0%, #ffffff 40%)',
        minHeight: '80vh',
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Hero */}
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #0056b3, #1a75cf)',
              mb: 3,
              boxShadow: '0 8px 32px rgba(0, 86, 179, 0.25)',
            }}
          >
            <GavelIcon sx={{ fontSize: '2.2rem', color: '#ffffff' }} />
          </Box>

          <Typography
            component="h1"
            sx={{
              fontSize: { xs: '1.8rem', sm: '2.5rem', md: '2.8rem' },
              fontWeight: 900,
              color: '#0d2137',
              mb: 2,
              lineHeight: 1.15,
            }}
          >
            AIDA Freediving Judge Suite
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '1rem', sm: '1.15rem' },
              color: '#5a7da5',
              maxWidth: 560,
              mx: 'auto',
              mb: 3,
              lineHeight: 1.7,
            }}
          >
            Free, professional-grade scoring and penalty tools for freediving
            judges — built for the latest AIDA 2025 rules and designed to work
            right at the poolside.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Chip label="AIDA 2025" size="small" sx={{ bgcolor: '#e3f0ff', color: '#0056b3', fontWeight: 600 }} />
            <Chip label="v17.7" size="small" sx={{ bgcolor: '#e3f0ff', color: '#0056b3', fontWeight: 600 }} />
            <Chip label="Free" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
          </Box>

          <Button
            variant="contained"
            size="large"
            href="https://judgesuite.com"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon />}
            sx={{
              background: 'linear-gradient(135deg, #0056b3, #0077ed)',
              fontWeight: 700,
              fontSize: '1.05rem',
              px: 5,
              py: 1.5,
              borderRadius: '50px',
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(0, 86, 179, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #004494, #0066d6)',
                boxShadow: '0 6px 28px rgba(0, 86, 179, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Open Judge Suite
          </Button>

          <Typography variant="body2" sx={{ mt: 1.5, color: '#90a4ae' }}>
            judgesuite.com — works on any device
          </Typography>
        </Box>

        <Divider sx={{ mb: { xs: 5, md: 7 } }} />

        {/* Article body */}
        <Box component="article" sx={{ maxWidth: 680, mx: 'auto' }}>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, fontWeight: 800, color: '#0d2137', mb: 2 }}
          >
            What is the Judge Suite?
          </Typography>
          <Typography sx={{ mb: 3, lineHeight: 1.85, color: '#444' }}>
            The <strong>AIDA Freediving Judge Suite</strong> is a free, web-based
            toolkit designed specifically for freediving judges and competition
            organizers. Originally developed as part of the Blue Mind Freediving
            platform, it has grown into a standalone application at{' '}
            <a
              href="https://judgesuite.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0056b3', fontWeight: 600 }}
            >
              judgesuite.com
            </a>{' '}
            to serve the wider global judging community.
          </Typography>
          <Typography sx={{ mb: 3, lineHeight: 1.85, color: '#444' }}>
            Whether you&apos;re judging a local pool competition or an
            international depth event, the suite gives you instant access to
            penalty calculations, scoring breakdowns, distance tracking,
            and a competition countdown timer — all aligned with the official{' '}
            <strong>AIDA Rules &amp; Regulations Version 17.7</strong>{' '}
            (January 2025).
          </Typography>

          {/* Features */}
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, fontWeight: 800, color: '#0d2137', mb: 3, mt: 5 }}
          >
            What&apos;s Inside
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 5 }}>
            {features.map((feature) => (
              <Box
                key={feature.title}
                sx={{
                  display: 'flex',
                  gap: 2.5,
                  p: 3,
                  borderRadius: 3,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e8eef4',
                }}
              >
                <Box sx={{ flexShrink: 0, mt: 0.5 }}>{feature.icon}</Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#0d2137', mb: 0.5 }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ lineHeight: 1.75, color: '#555', fontSize: '0.95rem' }}>
                    {feature.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Countdown spotlight */}
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, fontWeight: 800, color: '#0d2137', mb: 2, mt: 5 }}
          >
            The Competition Countdown Timer
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.85, color: '#444' }}>
            One of the most-requested features, the{' '}
            <a
              href="https://judgesuite.com/countdown"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0056b3', fontWeight: 600 }}
            >
              Countdown Timer
            </a>{' '}
            is purpose-built for freediving competitions. Set your Official Top
            countdown, warm-up intervals, or any custom duration and let the
            full-screen display do the rest.
          </Typography>
          <Typography sx={{ mb: 2, lineHeight: 1.85, color: '#444' }}>
            The oversized digits are designed to be readable from across the
            pool deck, making it perfect for both judges and athletes. Audio
            alerts at key intervals keep everyone on track without needing to
            watch the screen constantly.
          </Typography>
          <Typography sx={{ mb: 5, lineHeight: 1.85, color: '#444' }}>
            Whether you&apos;re timing a single athlete or managing a full
            start list, the countdown timer integrates seamlessly with the rest
            of the Judge Suite at{' '}
            <a
              href="https://judgesuite.com/countdown"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0056b3', fontWeight: 600 }}
            >
              judgesuite.com/countdown
            </a>
            .
          </Typography>

          {/* Highlights */}
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, fontWeight: 800, color: '#0d2137', mb: 3 }}
          >
            Why Judges Love It
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 5 }}>
            {highlights.map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <CheckCircleOutlineIcon sx={{ color: '#2e7d32', fontSize: 22, mt: 0.2 }} />
                <Typography sx={{ lineHeight: 1.6, color: '#444' }}>{item}</Typography>
              </Box>
            ))}
          </Box>

          {/* Closing CTA */}
          <Box
            sx={{
              mt: 6,
              p: { xs: 3, md: 5 },
              background: 'linear-gradient(135deg, #0056b3 0%, #0077ed 100%)',
              borderRadius: 3,
              textAlign: 'center',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, mb: 1.5 }}>
              Ready to use it?
            </Typography>
            <Typography sx={{ mb: 3, opacity: 0.9, maxWidth: 440, mx: 'auto', lineHeight: 1.6 }}>
              Head over to the Judge Suite — it&apos;s free, works offline, and
              you can start scoring in seconds.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="https://judgesuite.com"
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon />}
              sx={{
                bgcolor: '#fff',
                color: '#0056b3',
                fontWeight: 700,
                fontSize: '1.05rem',
                px: 5,
                py: 1.5,
                borderRadius: '50px',
                textTransform: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                '&:hover': {
                  bgcolor: '#f0f4ff',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              Open Judge Suite
            </Button>
          </Box>

          {/* Back to home */}
          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Link href="/" style={{ color: '#90a4ae', fontSize: '0.9rem' }}>
              ← Back to Blue Mind Freediving
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
