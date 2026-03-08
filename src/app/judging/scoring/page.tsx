import { Container, Box, Typography, Button, Chip, Divider } from '@mui/material';
import Link from 'next/link';
import CalculateIcon from '@mui/icons-material/Calculate';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const highlights = [
  'Covers all AIDA pool disciplines: STA, DYN, DYNB, DNF',
  'Full depth discipline support: CWT, CWTB, FIM, CNF',
  'Under AP penalties with automatic point deductions',
  'Early & late start penalty calculations',
  'Technical fouls: turn, start, pull, grab violations',
  'All DQ codes: DQAIRWAY, DQSP, DQLATESTART, DQOTHER, DQPULL',
  'Surface Protocol (SP) validation with 15-second window',
  'Clean, instant results — no manual math needed',
];

export default function ScoringPage() {
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
            <CalculateIcon sx={{ fontSize: '2.2rem', color: '#ffffff' }} />
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
            AIDA Scoring &amp; Penalty Calculator
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
            The complete scoring and penalty system for AIDA freediving
            competitions — pool and depth disciplines, all DQ codes, and
            instant results.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Chip label="AIDA 2025" size="small" sx={{ bgcolor: '#e3f0ff', color: '#0056b3', fontWeight: 600 }} />
            <Chip label="v17.7" size="small" sx={{ bgcolor: '#e3f0ff', color: '#0056b3', fontWeight: 600 }} />
            <Chip label="Free" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
          </Box>

          <Button
            variant="contained"
            size="large"
            href="https://judgesuite.com/scoring"
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
            Open Scoring Tool
          </Button>

          <Typography variant="body2" sx={{ mt: 1.5, color: '#90a4ae' }}>
            judgesuite.com/scoring
          </Typography>
        </Box>

        <Divider sx={{ mb: { xs: 5, md: 7 } }} />

        {/* Article */}
        <Box component="article" sx={{ maxWidth: 680, mx: 'auto' }}>
          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, fontWeight: 800, color: '#0d2137', mb: 2 }}
          >
            How It Works
          </Typography>
          <Typography sx={{ mb: 3, lineHeight: 1.85, color: '#444' }}>
            The <strong>Scoring &amp; Penalty Calculator</strong> takes the
            guesswork out of AIDA competition judging. Select a discipline,
            enter the Announced Performance (AP) and Realised Performance (RP),
            and the tool instantly calculates the final score with all
            applicable penalties.
          </Typography>
          <Typography sx={{ mb: 3, lineHeight: 1.85, color: '#444' }}>
            For <strong>pool disciplines</strong> (STA, DYN, DYNB, DNF), the
            calculator handles time-based and distance-based scoring, Under AP
            deductions, early and late start penalties, and technical fouls
            like turn violations, illegal pulls, and grab infractions.
          </Typography>
          <Typography sx={{ mb: 3, lineHeight: 1.85, color: '#444' }}>
            For <strong>depth disciplines</strong> (CWT, CWTB, FIM, CNF), it
            covers tag retrieval, depth shortfalls, no-tag penalties, and all
            depth-specific DQ conditions — giving you the final score and a
            clear breakdown of every deduction.
          </Typography>

          <Typography
            component="h2"
            sx={{ fontSize: { xs: '1.4rem', md: '1.7rem' }, fontWeight: 800, color: '#0d2137', mb: 2, mt: 5 }}
          >
            Disqualifications &amp; Surface Protocol
          </Typography>
          <Typography sx={{ mb: 3, lineHeight: 1.85, color: '#444' }}>
            Every DQ code defined in AIDA v17.7 is supported: airway
            submersion after surfacing (DQAIRWAY), Surface Protocol failure
            (DQSP), late start beyond the allowed window (DQLATESTART),
            illegal pulling (DQPULL), and other infractions (DQOTHER). The
            tool explains each code so judges can verify their calls with
            confidence.
          </Typography>
          <Typography sx={{ mb: 5, lineHeight: 1.85, color: '#444' }}>
            The Surface Protocol check validates the 15-second window for
            removing equipment, giving the OK sign, and providing a verbal
            confirmation — the three steps every athlete must complete to
            avoid a DQSP.
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
              background: 'linear-gradient(135deg, #0056b3 0%, #0077ed 100%)',
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
              Try the Scoring Calculator
            </Typography>
            <Typography sx={{ mb: 3, opacity: 0.9, maxWidth: 440, mx: 'auto', lineHeight: 1.6 }}>
              Open the tool, pick a discipline, and get instant results —
              no sign-up required.
            </Typography>
            <Button
              variant="contained"
              size="large"
              href="https://judgesuite.com/scoring"
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
              Open Scoring Tool
            </Button>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 5, flexWrap: 'wrap' }}>
            <Link href="/judging" style={{ color: '#0056b3', fontSize: '0.9rem', fontWeight: 600 }}>
              ← All Judge Suite Tools
            </Link>
            <Link href="/judging/pool-distance" style={{ color: '#0056b3', fontSize: '0.9rem', fontWeight: 600 }}>
              Pool Distance Tracker →
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
