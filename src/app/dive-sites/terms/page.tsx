import type { Metadata } from 'next';
import { Container, Box, Typography, Divider } from '@mui/material';

export const metadata: Metadata = {
  title: 'Terms of Service — freedive.one',
  description: 'Terms of service for freedive.one, a free global freediving directory.',
  alternates: { canonical: 'https://freedive.one/terms-of-service' },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = 'May 2026';
const CONTACT_EMAIL = 'info@bluemindfreediving.nl';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>{title}</Typography>
      {children}
    </Box>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8, mb: 1.5 }}>
      {children}
    </Typography>
  );
}

export default function FreediveTermsPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Terms of Service</Typography>
        <Typography variant="body2" color="text.disabled">freedive.one · Last updated: {LAST_UPDATED}</Typography>
      </Box>

      <Divider sx={{ mb: 5 }} />

      <Section title="1. About freedive.one">
        <P>
          freedive.one is a free, community-supported directory of freediving locations worldwide,
          operated by Blue Mind Freediving — a registered Dutch non-profit association (vereniging),
          KVK: 96935685. By using this site you agree to these terms.
        </P>
      </Section>

      <Section title="2. Free to use">
        <P>
          freedive.one is provided free of charge with no registration required. We reserve the
          right to introduce optional features in the future, but the core directory will remain
          freely accessible.
        </P>
      </Section>

      <Section title="3. Accuracy of dive site information">
        <P>
          Dive site data on freedive.one is curated from public sources and community contributions.
          While we make reasonable efforts to keep information accurate, we cannot guarantee that
          depth, visibility, temperature, access conditions, or any other data is current or
          correct for any specific site.
        </P>
        <P>
          <strong>
            Always verify local conditions independently before diving. Freediving carries inherent
            risks — never dive alone, and always dive within your training and experience level.
          </strong>
        </P>
      </Section>

      <Section title="4. No liability for diving activities">
        <P>
          freedive.one and Blue Mind Freediving accept no liability for injury, death, loss, or
          damage arising from reliance on information published on this site. Information provided
          is for general reference only and does not constitute professional diving advice.
        </P>
      </Section>

      <Section title="5. Intellectual property">
        <P>
          All original content on freedive.one — including text, compiled data, and design — is
          owned by Blue Mind Freediving or licensed for use on this site. You may not reproduce,
          redistribute, or scrape content for commercial purposes without prior written permission.
        </P>
        <P>
          Dive site names, geographic data, and publicly available factual information are not
          subject to copyright protection.
        </P>
      </Section>

      <Section title="6. User conduct">
        <P>You agree not to:</P>
        <Box component="ul" sx={{ pl: 3, color: 'text.secondary', lineHeight: 2.2 }}>
          <li>Use automated tools to scrape or bulk-download site data for commercial redistribution</li>
          <li>Submit false, misleading, or harmful information about dive sites</li>
          <li>Attempt to disrupt or compromise the security of the site</li>
        </Box>
      </Section>

      <Section title="7. Third-party services">
        <P>
          freedive.one uses Google Maps for location display. Use of embedded maps is subject to{' '}
          <a href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer" style={{ color: '#0077be' }}>
            Google Maps Terms of Service
          </a>
          . We also use Google Analytics for anonymous usage statistics.
        </P>
      </Section>

      <Section title="8. Availability">
        <P>
          We aim to keep freedive.one available at all times but do not guarantee uninterrupted
          access. We may update, modify, or temporarily suspend the site without notice.
        </P>
      </Section>

      <Section title="9. Changes to these terms">
        <P>
          We may update these terms at any time. The date at the top of this page indicates the
          most recent revision. Continued use of the site after changes constitutes acceptance.
        </P>
      </Section>

      <Section title="10. Governing law">
        <P>
          These terms are governed by Dutch law. Any disputes shall be subject to the exclusive
          jurisdiction of the courts of Amsterdam, the Netherlands.
        </P>
      </Section>

      <Section title="11. Contact">
        <P>
          For questions about these terms, contact us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#0077be' }}>{CONTACT_EMAIL}</a>.
        </P>
      </Section>
    </Container>
  );
}
