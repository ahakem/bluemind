import { Container, Box, Typography, Button, Chip, Divider } from '@mui/material';
import Link from 'next/link';
import PoolIcon from '@mui/icons-material/Pool';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const highlights = [
  'Handles any pool length — 25 m, 33 m, 50 m, or custom sizes',
  'Calculates exact distance from laps + metres on the final length',
  'No more mental maths after surface protocol on odd-sized pools',
  'Supports DYN, DYNB, and DNF pool disciplines',
  'Automatic Under AP penalty calculation',
  'Half-metre resolution — no rounding debates',
  'Simple, distraction-free interface for pool-deck use',
  'Works offline on phones, tablets, and laptops',
  'No sign-up, no installation — just open and go',
  'AIDA v17.7 compliant distance scoring',
];

export default function PoolDistancePage() {
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
              background: 'linear-gradient(135deg, #00838f, #26c6da)',
              mb: 3,
              boxShadow: '0 8px 32px rgba(0, 131, 143, 0.25)',
            }}
          >
            <PoolIcon sx={{ fontSize: '2.2rem', color: '#ffffff' }} />
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
            Pool Distance Calculator
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
            Instantly calculate realised distances for any pool size —
            standard or non-standard — so you never have to do the maths
            poolside again.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Chip label="DYN / DYNB / DNF" size="small" sx={{ bgcolor: '#e0f7fa', color: '#00838f', fontWeight: 600 }} />
            <Chip label="AIDA v17.7" size="small" sx={{ bgcolor: '#e0f7fa', color: '#00838f', fontWeight: 600 }} />
            <Chip label="Free" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
          </Box>

          <Button
            variant="contained"
            size="large"
            href="https://judgesuite.com/pool-distance"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon />}
            sx={{
              background: 'linear-gradient(135deg, #00838f, #26c6da)',
              fontWeight: 700,
              fontSize: '1.05rem',
              px: 5,
              py: 1.5,
              borderRadius: '50px',
              textTransform: 'none',
              boxShadow: '0 4px 20px rgba(0, 131, 143, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #006064, #00acc1)',
                boxShadow: '0 6px 28px rgba(0, 131, 143, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Open Distance Tracker
          </Button>

          <Typography variant="body2" sx={{ mt: 1.5, color: '#90a4ae' }}>
            judgesuite.com/pool-distance
          </Typography>
        </Box>

        <Divider sx={{ mb: { xs: 5, md: 7 } }} />

        {/* Article */}
        <Box component="article" sx={{ maxWidth: 680, mx: 'auto' }}>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, fontWeight: 800, color: '#0d2137', mb: 2 }}
          >
            The Problem with Non-Standard Pools
          </Typography>
          <Typography sx={{ mb: 3, lineHeight: 1.85, color: '#444' }}>
            Not every freediving competition takes place in a clean 25&nbsp;m
            or 50&nbsp;m pool. Many venues are 33&nbsp;m, 20&nbsp;m, or even
            odd lengths like 28&nbsp;m. When an athlete surfaces mid-length
            in a 33&nbsp;m pool after completing several laps, calculating the
            exact realised distance on the spot is surprisingly tricky —
            especially under the pressure of Surface Protocol, where every
            second counts.
          </Typography>
          <Typography sx={{ mb: 3, lineHeight: 1.85, color: '#444' }}>
            The <strong>Pool Distance Calculator</strong> solves this
            instantly. Set the pool length once — whether it&apos;s 25, 33,
            50, or any custom size — and the tool does the rest. Enter the
            number of completed laps and the metres covered on the final
            length, and you get the precise realised distance with zero
            mental arithmetic.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, fontWeight: 800, color: '#0d2137', mb: 2, mt: 5 }}
          >
            How It Works
          </Typography>
          <Box component="ol" sx={{ pl: 2.5, mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography component="li" sx={{ lineHeight: 1.85, color: '#444' }}>
              <strong>Set the pool size</strong> — choose a standard length
              or type a custom one like 33&nbsp;m.
            </Typography>
            <Typography component="li" sx={{ lineHeight: 1.85, color: '#444' }}>
              <strong>Enter laps &amp; final metres</strong> — the tool
              multiplies laps by pool length and adds the remaining metres.
            </Typography>
            <Typography component="li" sx={{ lineHeight: 1.85, color: '#444' }}>
              <strong>Get the result</strong> — the realised distance appears
              instantly, along with any Under&nbsp;AP penalty if the athlete
              fell short of the announcement.
            </Typography>
          </Box>
          <Typography sx={{ mb: 3, lineHeight: 1.85, color: '#444' }}>
            No more pulling out a calculator poolside, no more second-guessing
            whether 4&nbsp;laps in a 33&nbsp;m pool plus 12 extra metres is
            144&nbsp;m or 145&nbsp;m. The answer is right there.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, fontWeight: 800, color: '#0d2137', mb: 2, mt: 5 }}
          >
            Built for the Pool Deck
          </Typography>
          <Typography sx={{ mb: 3, lineHeight: 1.85, color: '#444' }}>
            We designed the interface specifically for competition
            environments. Large tap targets, high-contrast colours, and a
            minimal layout mean you can use it on a phone in direct sunlight,
            from a tablet at the timing desk, or on a laptop in the warm-up
            area. It works offline too — if the venue Wi-Fi drops, your data
            stays safe.
          </Typography>
          <Typography sx={{ mb: 5, lineHeight: 1.85, color: '#444' }}>
            Whether you&apos;re an experienced AIDA judge or running your
            first pool event, the Pool Distance Calculator removes the mental
            maths so you can focus on the athlete and the Surface Protocol
            window.
          </Typography>

          {/* Highlights */}
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, fontWeight: 800, color: '#0d2137', mb: 3 }}
          >
            Features at a Glance
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 5 }}>
            {highlights.map((item) => (
              <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <CheckCircleOutlineIcon sx={{ color: '#2e7d32', fontSize: 22, mt: 0.2 }} />
                <Typography sx={{ lineHeight: 1.6, color: '#444' }}>{item}</Typography>
              </Box>
            ))}
          </Box>

          {/* CTA */}
          <Box
            sx={{
              mt: 6,
              p: { xs: 3, md: 5 },
              background: 'linear-gradient(135deg, #00838f 0%, #26c6da 100%)',
              borderRadius: 3,
              textAlign: 'center',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.6rem' }, mb: 1.5 }}>
              Try the Pool Distance Calculator
            </Typography>
            <Typography sx={{ mb: 3, opacity: 0.9, maxWidth: 440, mx: 'auto', lineHeight: 1.6 }}>
              Set your pool length, enter laps, and get instant results —
              no sign-up required.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="https://judgesuite.com/pool-distance"
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon />}
              sx={{
                bgcolor: '#fff',
                color: '#00838f',
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
              Open Distance Tracker
            </Button>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 5, flexWrap: 'wrap' }}>
            <Link href="/judging" style={{ color: '#0056b3', fontSize: '0.9rem', fontWeight: 600 }}>
              ← All Judge Suite Tools
            </Link>
            <Link href="/judging/scoring" style={{ color: '#0056b3', fontSize: '0.9rem', fontWeight: 600 }}>
              Scoring Calculator →
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
