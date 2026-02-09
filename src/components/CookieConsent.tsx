'use client';

import { useState, useEffect } from 'react';
import { Box, Button, Typography, Container, Link } from '@mui/material';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    
    // Initialize Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
      });
    }
    
    // Reload to initialize analytics
    window.location.reload();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShowBanner(false);
    
    // Deny analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }
  };

  if (!showBanner) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: 'white',
        py: 3,
        px: 2,
        zIndex: 9999,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
              🍪 We use cookies
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              We use cookies to improve your experience and analyze site traffic. 
              By clicking "Accept All", you consent to our use of cookies for analytics. 
              Click "Decline" to browse without tracking. 
              Learn more in our{' '}
              <Link 
                href="https://app.bluemindfreediving.nl/documents/privacy-policy" 
                target="_blank"
                rel="noopener noreferrer"
                sx={{ 
                  color: '#4A90E2',
                  textDecoration: 'underline',
                  '&:hover': { color: '#357ABD' }
                }}
              >
                Privacy Policy
              </Link>
              .
            </Typography>
          </Box>
          
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              width: { xs: '100%', md: 'auto' },
            }}
          >
            <Button
              variant="outlined"
              onClick={handleDecline}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Decline
            </Button>
            <Button
              variant="contained"
              onClick={handleAccept}
              sx={{
                backgroundColor: '#4A90E2',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#357ABD',
                },
              }}
            >
              Accept All
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
