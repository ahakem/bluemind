import type { Metadata } from 'next';
import { Container, Box, Typography, Divider } from '@mui/material';

export const metadata: Metadata = {
  title: 'Privacy Policy — freedive.one',
  description: 'Privacy policy for freedive.one, a free global freediving directory.',
  alternates: { canonical: 'https://freedive.one/privacy-policy' },
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

export default function FreedivePrivacyPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Privacy Policy</Typography>
        <Typography variant="body2" color="text.disabled">freedive.one · Last updated: {LAST_UPDATED}</Typography>
      </Box>

      <Divider sx={{ mb: 5 }} />

      <Section title="1. Who we are">
        <P>
          freedive.one is a free global freediving directory operated by Blue Mind Freediving, a
          registered Dutch non-profit association (vereniging), KVK: 96935685, based in Amsterdam,
          the Netherlands.
        </P>
        <P>
          For privacy-related questions, contact us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#0077be' }}>{CONTACT_EMAIL}</a>.
        </P>
      </Section>

      <Section title="2. Data we collect">
        <P>
          freedive.one does not require registration or login. We collect minimal data necessary to
          operate the site:
        </P>
        <Box component="ul" sx={{ pl: 3, color: 'text.secondary', lineHeight: 2.2 }}>
          <li>
            <strong>Usage analytics</strong> — page views, session duration, and general navigation
            patterns via Google Analytics. This data is anonymised and aggregated; no personally
            identifiable information is stored.
          </li>
          <li>
            <strong>Server logs</strong> — standard web server logs (IP address, browser type,
            pages requested) retained for up to 90 days for security and performance monitoring.
          </li>
          <li>
            <strong>Contact form submissions</strong> — if you contact us, we retain your name and
            email address solely to respond to your enquiry.
          </li>
        </Box>
      </Section>

      <Section title="3. Cookies">
        <P>
          We use the following cookies:
        </P>
        <Box component="ul" sx={{ pl: 3, color: 'text.secondary', lineHeight: 2.2 }}>
          <li>
            <strong>Google Analytics (_ga, _gid)</strong> — anonymous usage statistics. You can
            opt out via your browser settings or the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" style={{ color: '#0077be' }}>
              Google Analytics Opt-out Add-on
            </a>.
          </li>
          <li>
            <strong>Functional cookies</strong> — preferences such as map view or filter settings,
            stored locally in your browser. No personal data is transmitted.
          </li>
        </Box>
        <P>
          We do not use advertising cookies or sell any data to third parties.
        </P>
      </Section>

      <Section title="4. Google Maps">
        <P>
          Dive site maps are powered by Google Maps. When you view a map, Google may collect data
          according to their own{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#0077be' }}>
            Privacy Policy
          </a>.
        </P>
      </Section>

      <Section title="5. How we use your data">
        <P>We use collected data only to:</P>
        <Box component="ul" sx={{ pl: 3, color: 'text.secondary', lineHeight: 2.2 }}>
          <li>Operate and improve the freedive.one directory</li>
          <li>Understand which regions and features are most useful to the community</li>
          <li>Respond to enquiries sent directly to us</li>
        </Box>
        <P>We do not sell, rent, or share personal data with third parties for marketing purposes.</P>
      </Section>

      <Section title="6. Your rights (GDPR)">
        <P>
          If you are based in the European Union, you have the right to access, correct, or request
          deletion of any personal data we hold about you. To exercise these rights, email us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: '#0077be' }}>{CONTACT_EMAIL}</a>. We
          will respond within 30 days.
        </P>
      </Section>

      <Section title="7. Data retention">
        <P>
          Analytics data is retained for 26 months. Server logs are retained for 90 days. Contact
          form data is retained until your enquiry is resolved, or at your request.
        </P>
      </Section>

      <Section title="8. Changes to this policy">
        <P>
          We may update this policy from time to time. The date at the top of this page reflects
          the most recent revision. Continued use of freedive.one after changes constitutes
          acceptance of the updated policy.
        </P>
      </Section>

      <Section title="9. Governing law">
        <P>
          This policy is governed by Dutch law. Any disputes shall be subject to the jurisdiction
          of the courts of Amsterdam, the Netherlands.
        </P>
      </Section>
    </Container>
  );
}
