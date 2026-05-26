import type { Metadata } from 'next';
import { Container, Box, Typography, Button } from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import WaterIcon from '@mui/icons-material/Water';

export const metadata: Metadata = {
  title: 'Submit a Dive Site — freedive.one',
  description: 'Know a great freediving location not listed on freedive.one? Submit it and help the community.',
  alternates: { canonical: 'https://freedive.one/submit' },
  robots: { index: true, follow: true },
};

const STEPS = [
  { num: '01', title: 'Name & location', desc: 'Site name, country, nearest city, and GPS coordinates if you have them.' },
  { num: '02', title: 'Depth & conditions', desc: 'Max depth, visibility, water type (sea, lake, tank), and best season.' },
  { num: '03', title: 'Access & notes', desc: 'How to get there, entry point, any hazards or local rules freedivers should know.' },
];

export default function SubmitSitePage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>

      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', bgcolor: '#e8f4fd', mb: 3 }}>
          <AddLocationAltIcon sx={{ fontSize: 36, color: '#0077be' }} />
        </Box>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Submit a Dive Site
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto' }}>
          Know a freediving spot that&apos;s not listed? Help the community by sharing it.
        </Typography>
      </Box>

      {/* Steps */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 8 }}>
        {STEPS.map((s) => (
          <Box key={s.num} sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            <Box sx={{ flexShrink: 0, width: 44, height: 44, borderRadius: '50%', bgcolor: '#001f3f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="caption" fontWeight={800} sx={{ color: '#4fc3f7' }}>{s.num}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>{s.title}</Typography>
              <Typography variant="body2" color="text.secondary">{s.desc}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* CTA */}
      <Box
        sx={{
          bgcolor: '#f0f7ff',
          border: '1px solid #c8e0f4',
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          textAlign: 'center',
        }}
      >
        <WaterIcon sx={{ fontSize: 32, color: '#0077be', mb: 1 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Send us the details
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 440, mx: 'auto' }}>
          Email us the information above and we&apos;ll add it to the directory. All submissions are reviewed before publishing.
        </Typography>
        <Button
          variant="contained"
          size="large"
          href="mailto:info@bluemindfreediving.nl?subject=Dive%20Site%20Submission"
          sx={{ borderRadius: '50px', textTransform: 'none', fontWeight: 700, bgcolor: '#0077be', px: 4, '&:hover': { bgcolor: '#005fa3' } }}
        >
          Submit by email
        </Button>
        <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 2 }}>
          info@bluemindfreediving.nl
        </Typography>
      </Box>
    </Container>
  );
}
