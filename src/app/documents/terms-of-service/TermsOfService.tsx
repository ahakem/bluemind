'use client';

import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
  ArrowBack,
  CheckCircle,
  Gavel,
  Groups,
  Pool,
  Security,
  Cancel,
  Email,
  HealthAndSafety,
  CameraAlt,
  Storage,
  SmartToy,
} from '@mui/icons-material';

const TermsOfService: React.FC = () => {
  const router = useRouter();

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mt: 5,
    mb: 2,
    pb: 1,
    borderBottom: '2px solid',
    borderColor: 'primary.main',
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="md">
        <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 2 }}>
          Back
        </Button>

        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'left', mb: 4 }}>
            <Typography variant="h3" gutterBottom color="primary" fontWeight="bold">
              Blue Mind Freediving
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Terms of Service
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip label="Effective: May 2026" size="small" color="primary" variant="outlined" />
            </Box>
          </Box>

          <Alert severity="info" sx={{ mb: 4 }}>
            <AlertTitle>About Our Association</AlertTitle>
            Blue Mind Freediving is a registered Dutch non-profit association (vereniging), registered with the
            Dutch Chamber of Commerce (KVK) under number 96935685. By becoming a member or participating in
            our activities, you agree to these terms.
          </Alert>

          {/* Section 1 */}
          <Box sx={sectionHeaderStyle}>
            <Groups color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              1. Association & Membership
            </Typography>
          </Box>
          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Blue Mind Freediving is a non-profit association (vereniging) under Dutch law, KVK number 96935685." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Membership is open to individuals who share our mission of promoting freediving as an accessible sport." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Members must complete the online registration form and receive confirmation before participating in activities." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="All membership contributions are used exclusively for pool lane rental, safety equipment, insurance, and community events." />
            </ListItem>
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Section 2 */}
          <Box sx={sectionHeaderStyle}>
            <Pool color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              2. Training Sessions & Participation
            </Typography>
          </Box>
          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Training sessions take place at Sloterparkbad, Amsterdam, as scheduled on our website calendar." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Pre-registration is required for all sessions. Space is limited to ensure safety and quality instruction." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Participants must follow all instructions from certified instructors and safety divers at all times." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="The association reserves the right to cancel or reschedule sessions due to pool availability or safety concerns." />
            </ListItem>
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Section 3 */}
          <Box sx={sectionHeaderStyle}>
            <HealthAndSafety color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              3. Health, Safety & Liability
            </Typography>
          </Box>
          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            Freediving is an inherently risky activity. By participating in Blue Mind Freediving activities, you acknowledge and accept the following:
          </Typography>
          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="You must declare any medical conditions that could affect your ability to safely participate in freediving." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Valid freediving insurance is required for participation in training sessions." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="You participate at your own risk. The association, its board members, instructors, and safety divers are not liable for injuries or damages unless caused by gross negligence." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="You must never freedive alone. The buddy system is mandatory during all sessions." />
            </ListItem>
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Section 4 */}
          <Box sx={sectionHeaderStyle}>
            <Gavel color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              4. Code of Conduct
            </Typography>
          </Box>
          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Treat all members, instructors, and staff with respect and courtesy." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Follow pool facility rules and regulations at all times." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Report any safety concerns or incidents to an instructor immediately." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Discrimination, harassment, or unsportsmanlike behaviour will not be tolerated and may result in membership termination." />
            </ListItem>
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Section 5 */}
          <Box sx={sectionHeaderStyle}>
            <CameraAlt color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              5. Photography & Media
            </Typography>
          </Box>
          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            Photos and videos may be taken during training sessions for promotional and community purposes. By participating, you consent to the use of such media unless you notify us in writing that you do not wish to be photographed. See our Privacy Policy for details on how media is handled.
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* Section 6 */}
          <Box sx={sectionHeaderStyle}>
            <Cancel color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              6. Cancellation & Termination
            </Typography>
          </Box>
          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Members may cancel their membership at any time by contacting us at info@bluemindfreediving.nl." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="The association may terminate a membership in case of repeated violations of these terms or the code of conduct." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Membership contributions already paid are non-refundable, as they have been allocated to pool rental and operational costs." />
            </ListItem>
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Section 7 — Dive Sites Database */}
          <Box sx={sectionHeaderStyle}>
            <Storage color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              7. Dive Sites Database & Intellectual Property
            </Typography>
          </Box>
          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            The Blue Mind Freediving dive sites database — including all site names, descriptions,
            coordinates, depth data, conditions, tags, and curated metadata — is the intellectual
            property of Blue Mind Freediving and its contributors. This database is made available
            for personal, non-commercial use only.
          </Typography>
          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="You may use individual site information for personal trip planning and reference." />
            </ListItem>
            <ListItem>
              <ListItemIcon><Cancel color="error" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="Reproduction, redistribution, or republication of the database in whole or in part — on any platform, app, or dataset — is strictly prohibited without prior written permission."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Cancel color="error" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="You may not use the database to train, fine-tune, or augment machine learning or AI models, including large language models, without explicit written consent."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Organisations wishing to licence or collaborate on the data are welcome to contact us at info@bluemindfreediving.nl." />
            </ListItem>
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Section 8 — Automated Access */}
          <Box sx={sectionHeaderStyle}>
            <SmartToy color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              8. Automated Access & Scraping
            </Typography>
          </Box>
          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            Access to bluemindfreediving.nl by automated means — including web scrapers, crawlers,
            bots, spiders, and data-extraction scripts — is subject to the following conditions:
          </Typography>
          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Search engine crawlers (Googlebot, Bingbot) are permitted to index publicly accessible pages in accordance with our robots.txt file." />
            </ListItem>
            <ListItem>
              <ListItemIcon><Cancel color="error" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="Bulk automated extraction of dive site data, coordinates, descriptions, or any structured content from this website is prohibited, regardless of the technical method used."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><Cancel color="error" fontSize="small" /></ListItemIcon>
              <ListItemText
                primary="AI training crawlers and data-aggregation bots are prohibited from accessing the /dive-sites/ section of this website, as stated in our robots.txt."
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="We reserve the right to block, throttle, or take legal action against any automated access that violates these terms or overloads our infrastructure." />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Violations may constitute unauthorised computer access under Dutch and EU law (Cybercrime Directive 2013/40/EU) and may result in legal proceedings." />
            </ListItem>
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Section 9 */}
          <Box sx={sectionHeaderStyle}>
            <Security color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              9. Changes to These Terms
            </Typography>
          </Box>
          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            We may update these terms from time to time. Members will be notified of significant changes via email. Continued participation in association activities after changes are communicated constitutes acceptance of the updated terms.
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* Contact */}
          <Box sx={sectionHeaderStyle}>
            <Email color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              10. Contact
            </Typography>
          </Box>
          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            For questions about these terms, contact us at:
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Blue Mind Freediving</strong><br />
            Email: info@bluemindfreediving.nl<br />
            KVK: 96935685<br />
            Training location: Sloterparkbad, President Allendelaan 3, 1064 GW Amsterdam
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsOfService;
