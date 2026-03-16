'use client';

import React from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  AlertTitle,
  Chip,
  Link
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { 
  ArrowBack, 
  CheckCircle,
  Info,
  Security,
  Storage,
  AccessTime,
  Gavel,
  Email,
  Person,
  LocalHospital,
  CameraAlt,
  ContactPhone,
  Badge,
  Shield
} from '@mui/icons-material';
const PrivacyPolicyContent: React.FC = () => {
  const router = useRouter();

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    mt: 5,
    mb: 2,
    pb: 1,
    borderBottom: '2px solid',
    borderColor: 'primary.main'
  };

  const subsectionStyle = {
    mt: 3,
    mb: 2,
    fontWeight: 600,
    color: 'text.primary'
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      <Container maxWidth="md">
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'left', mb: 4 }}>
            <Typography variant="h3" gutterBottom color="primary" fontWeight="bold">
              Blue Mind Freediving
            </Typography>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Privacy Policy
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
              <Chip 
                label="GDPR Compliant" 
                size="small" 
                color="success" 
                variant="outlined"
              />
              <Chip 
                label="Effective: December 2025" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Introduction Notice */}
          <Alert severity="info" sx={{ mb: 4 }}>
            <AlertTitle>Your Privacy Matters</AlertTitle>
            Blue Mind Freediving (BMF) is committed to protecting your personal data in compliance with the 
            General Data Protection Regulation (GDPR) and Dutch data protection laws.
          </Alert>

          {/* Section 1: Who We Are */}
          <Box sx={sectionHeaderStyle}>
            <Badge color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              1. Who We Are
            </Typography>
          </Box>

          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            Blue Mind Freediving (BMF) is an informal freediving club based in the Netherlands. We collect and 
            process personal data of our members for the purposes of association operations (membership administration, 
            communication, safety, and event coordination).
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              <Email sx={{ verticalAlign: 'middle', mr: 1, fontSize: 18 }} />
              Contact Us
            </Typography>
            <Typography variant="body2">
              Email: <Link href="mailto:info@bluemindfreediving.nl">info@bluemindfreediving.nl</Link>
            </Typography>
          </Paper>

          <Divider sx={{ my: 4 }} />

          {/* Section 2: What Data We Collect */}
          <Box sx={sectionHeaderStyle}>
            <Storage color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              2. What Data We Collect
            </Typography>
          </Box>

          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            We may collect and store the following personal data:
          </Typography>

          <Typography variant="h6" sx={subsectionStyle}>
            <Person sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
            Identity & Contact Information
          </Typography>
          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Full name" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Date of birth" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Contact details (address, phone number, email)" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={subsectionStyle}>
            <ContactPhone sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
            Emergency Contact Information
          </Typography>
          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Name and phone number of emergency contact" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Relationship to emergency contact" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={subsectionStyle}>
            <LocalHospital sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
            Health & Safety Data
          </Typography>
          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Freediving certification(s)" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Proof of valid freediving insurance" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Medical declarations (self-assessment)" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="CPR/First Aid certification (if applicable)" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Freediving-related incidents during BMF events (if applicable)" />
            </ListItem>
          </List>

          <Typography variant="h6" sx={subsectionStyle}>
            <CameraAlt sx={{ verticalAlign: 'middle', mr: 1, color: 'primary.main' }} />
            Media & Events
          </Typography>
          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Photos and videos (if you consent)" />
            </ListItem>
            <ListItem>
              <ListItemIcon><CheckCircle color="primary" fontSize="small" /></ListItemIcon>
              <ListItemText primary="Registration data for events" />
            </ListItem>
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Section 3: Why We Collect Your Data */}
          <Box sx={sectionHeaderStyle}>
            <Info color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              3. Why We Collect Your Data
            </Typography>
          </Box>

          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            We process this data in order to:
          </Typography>

          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Maintain accurate membership records" 
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Ensure the safety of participants during freediving activities" 
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Verify insurance and certification compliance" 
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Communicate with members about events, training, and policy updates" 
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Share media on social platforms (only if you give consent)" 
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Section 4: Legal Basis */}
          <Box sx={sectionHeaderStyle}>
            <Gavel color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              4. Legal Basis for Processing
            </Typography>
          </Box>

          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            We collect your personal data with your <strong>explicit consent</strong> and for the <strong>legitimate interest</strong> of 
            managing club operations and ensuring safety during sports activities.
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* Section 5: Who Has Access */}
          <Box sx={sectionHeaderStyle}>
            <Security color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              5. Who Has Access to Your Data
            </Typography>
          </Box>

          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            Your personal data is only accessible to:
          </Typography>

          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText 
                primary="Only authorized members of the BMF board will have access to your data" 
              />
            </ListItem>
          </List>

          <Alert severity="info" sx={{ mb: 3 }}>
            <AlertTitle>Data Sharing</AlertTitle>
            We do not share your information with third parties, except:
            <List dense>
              <ListItem sx={{ py: 0.5 }}>• In case of emergency (e.g., with medical professionals)</ListItem>
              <ListItem sx={{ py: 0.5 }}>• If required by law</ListItem>
            </List>
          </Alert>

          <Divider sx={{ my: 4 }} />

          {/* Section 6: Data Storage */}
          <Box sx={sectionHeaderStyle}>
            <Storage color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              6. Data Storage and Retention
            </Typography>
          </Box>

          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="Your data is securely stored (digitally) and protected by password access" />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
              <ListItemText primary="We retain your data for the duration of your active membership" />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon><AccessTime color="warning" /></ListItemIcon>
              <ListItemText 
                primary="Data Deletion" 
                secondary="If your membership is terminated, your data will be deleted within 3 months unless there is a legal reason to keep it longer."
              />
            </ListItem>
          </List>

          <Divider sx={{ my: 4 }} />

          {/* Section 7: Your Rights Under GDPR */}
          <Box sx={sectionHeaderStyle}>
            <Shield color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              7. Your Rights Under GDPR
            </Typography>
          </Box>

          <Typography paragraph sx={{ textAlign: 'left', lineHeight: 1.8 }}>
            You have the right to:
          </Typography>

          <List sx={{ bgcolor: 'grey.50', borderRadius: 2, mb: 3 }}>
            <ListItem>
              <ListItemIcon><Chip label="1" color="primary" size="small" /></ListItemIcon>
              <ListItemText 
                primary="Access your data" 
                secondary="Request a copy of all personal data we hold about you"
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon><Chip label="2" color="primary" size="small" /></ListItemIcon>
              <ListItemText 
                primary="Correct any inaccurate data" 
                secondary="Ask us to update or correct your information"
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon><Chip label="3" color="primary" size="small" /></ListItemIcon>
              <ListItemText 
                primary="Withdraw consent at any time" 
                secondary="Especially for media use and marketing communications"
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon><Chip label="4" color="primary" size="small" /></ListItemIcon>
              <ListItemText 
                primary="Request deletion of your data" 
                secondary="Right to be forgotten (subject to legal requirements)"
              />
            </ListItem>
            <Divider component="li" />
            <ListItem>
              <ListItemIcon><Chip label="5" color="primary" size="small" /></ListItemIcon>
              <ListItemText 
                primary="Object to the processing of your data" 
                secondary="In certain circumstances"
              />
            </ListItem>
          </List>

          <Paper sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              To exercise any of these rights, contact us at:
            </Typography>
            <Typography variant="body1">
              <Link href="mailto:info@bluemindfreediving.nl">info@bluemindfreediving.nl</Link>
            </Typography>
          </Paper>

          <Divider sx={{ my: 4 }} />

          {/* Section 8: Consent */}
          <Box sx={sectionHeaderStyle}>
            <CheckCircle color="primary" fontSize="large" />
            <Typography variant="h5" fontWeight="bold">
              8. Consent
            </Typography>
          </Box>

          <Alert severity="success" sx={{ mb: 3 }}>
            <AlertTitle>Your Consent</AlertTitle>
            By becoming a member of BMF and submitting the registration form, you confirm that you have read and 
            accepted this Privacy Policy.
          </Alert>

          <Divider sx={{ my: 4 }} />

          {/* Contact Information */}
          <Paper sx={{ p: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.main', mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'info.main', fontWeight: 'bold' }}>
              📧 Questions or Concerns?
            </Typography>
            <Typography paragraph sx={{ textAlign: 'left' }}>
              If you have any questions about how we handle your data, please contact us:
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Email:</strong> <Link href="mailto:info@bluemindfreediving.nl">info@bluemindfreediving.nl</Link>
            </Typography>
          </Paper>

          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'left' }}>
            <Typography variant="caption" color="text.secondary">
              Last updated: December 2025
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

const PrivacyPolicy: React.FC = () => {
  return <PrivacyPolicyContent />;
};

export default PrivacyPolicy;
