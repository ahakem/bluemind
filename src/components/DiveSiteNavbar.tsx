'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Link from 'next/link';
import Image from 'next/image';

export default function DiveSiteNavbar() {
  return (
    <AppBar
      position="static"
      component="header"
      id="navigation"
      role="banner"
      sx={{
        background: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 0 rgba(0,0,0,0.08)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: '44px !important', py: 0.5 }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Box sx={{ position: 'relative', height: 30, width: 100 }}>
              <Image
                src="/images/bluemind-logo.webp"
                alt="Blue Mind Freediving"
                fill
                sizes="100px"
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
          </Link>

          {/* Explore link */}
          <Button
            component={Link}
            href="/"
            endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
            sx={{
              color: 'text.secondary',
              fontSize: '0.78rem',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
            }}
          >
            Explore Blue Mind
          </Button>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
