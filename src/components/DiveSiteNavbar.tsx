'use client';

import { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';
import MapIcon from '@mui/icons-material/Map';
import HomeIcon from '@mui/icons-material/Home';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import WaterIcon from '@mui/icons-material/Water';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDiveSiteNav } from '@/contexts/DiveSiteNavContext';
import SubmitSiteDialog from '@/components/SubmitSiteDialog';

const NAV_LINKS = [
  { label: 'Home',       href: '/dive-sites',            icon: <HomeIcon   sx={{ fontSize: 16 }} /> },
  { label: 'Countries',  href: '/dive-sites/countries',  icon: <MapIcon    sx={{ fontSize: 16 }} /> },
  { label: 'Continents', href: '/dive-sites/continents', icon: <PublicIcon sx={{ fontSize: 16 }} /> },
];

export default function DiveSiteNavbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);
  const pathname = usePathname();
  const { siteCount } = useDiveSiteNav();

  return (
    <>
      <AppBar
        position="sticky"
        component="header"
        id="navigation"
        role="banner"
        sx={{
          background: 'linear-gradient(135deg, #001f3f 0%, #003d7a 60%, #0077be 100%)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
          top: 0,
          zIndex: 1200,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: '52px !important', py: 0.5 }}>

            {/* Brand */}
            <Link href="/dive-sites" style={{ textDecoration: 'none' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <WaterIcon sx={{ fontSize: 26, color: '#4fc3f7' }} />
                <Box>
                  <Typography
                    component="span"
                    sx={{ fontWeight: 900, fontSize: '1.1rem', color: 'white', letterSpacing: '-0.4px', lineHeight: 1, display: 'block' }}
                  >
                    Dive Sites
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.4}>
                    <FiberManualRecordIcon sx={{ fontSize: 7, color: '#4ade80' }} />
                    <Typography
                      component="span"
                      sx={{ fontSize: '0.67rem', color: '#4ade80', fontWeight: 600, letterSpacing: '0.2px' }}
                    >
                      {siteCount ? `${siteCount.toLocaleString()} locations` : 'worldwide'}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Link>

            {/* Desktop nav */}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                {NAV_LINKS.map(({ label, href, icon }) => {
                  const active = pathname === href || (href !== '/dive-sites' && pathname?.startsWith(href));
                  return (
                    <Button
                      key={href}
                      component={Link}
                      href={href}
                      startIcon={icon}
                      sx={{
                        color: active ? 'white' : 'rgba(255,255,255,0.75)',
                        fontSize: '0.82rem',
                        fontWeight: active ? 700 : 500,
                        textTransform: 'none',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 2,
                        bgcolor: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                        borderBottom: active ? '2px solid rgba(255,255,255,0.7)' : '2px solid transparent',
                        '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                      }}
                    >
                      {label}
                    </Button>
                  );
                })}
              </Box>

              {/* Explore Blue Mind — text + external icon, before the green button */}
              <Button
                component={Link}
                href="/"
                endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  color: 'rgba(255,255,255,0.7)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
                }}
              >
                Explore Blue Mind
              </Button>

              {/* Submit button */}
              <Button
                variant="contained"
                startIcon={<AddLocationAltIcon sx={{ fontSize: '15px !important' }} />}
                onClick={() => setSubmitOpen(true)}
                size="small"
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  bgcolor: '#2e7d32',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  px: 1.75,
                  py: 0.6,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(46,125,50,0.4)',
                  '&:hover': { bgcolor: '#1b5e20' },
                }}
              >
                Submit a Site
              </Button>

              {/* Mobile hamburger */}
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Open navigation menu"
                sx={{ display: { xs: 'flex', md: 'none' }, color: 'white' }}
              >
                <MenuIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { width: 260, background: 'linear-gradient(180deg, #001f3f 0%, #003d7a 100%)', color: 'white' },
        }}
      >
        <Box sx={{ px: 2.5, py: 2.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WaterIcon sx={{ fontSize: 24, color: '#4fc3f7' }} />
            <Box>
              <Typography fontWeight={900} sx={{ fontSize: '1.05rem', color: 'white', lineHeight: 1 }}>
                Dive Sites
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.4} mt={0.3}>
                <FiberManualRecordIcon sx={{ fontSize: 7, color: '#4ade80' }} />
                <Typography sx={{ fontSize: '0.67rem', color: '#4ade80', fontWeight: 600 }}>
                  {siteCount ? `${siteCount.toLocaleString()} locations` : 'worldwide'}
                </Typography>
              </Stack>
            </Box>
          </Stack>
          <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu" sx={{ color: 'rgba(255,255,255,0.7)' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />

        <List sx={{ pt: 1 }}>
          {NAV_LINKS.map(({ label, href, icon }) => {
            const active = pathname === href || (href !== '/dive-sites' && pathname?.startsWith(href));
            return (
              <ListItem key={href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={href}
                  onClick={() => setDrawerOpen(false)}
                  sx={{
                    px: 2.5, py: 1.25, borderRadius: 2, mx: 1, mb: 0.5,
                    bgcolor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  <Box sx={{ mr: 1.5, color: active ? '#4fc3f7' : 'rgba(255,255,255,0.6)', display: 'flex' }}>{icon}</Box>
                  <ListItemText
                    primary={label}
                    slotProps={{
                      primary: { sx: { color: active ? 'white' : 'rgba(255,255,255,0.8)', fontWeight: active ? 700 : 400, fontSize: '0.95rem' } },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}

          {/* Explore Blue Mind */}
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/"
              onClick={() => setDrawerOpen(false)}
              sx={{ px: 2.5, py: 1.25, borderRadius: 2, mx: 1, mb: 0.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' } }}
            >
              <Box sx={{ mr: 1.5, color: 'rgba(255,255,255,0.6)', display: 'flex' }}>
                <OpenInNewIcon sx={{ fontSize: 16 }} />
              </Box>
              <ListItemText
                primary="Explore Blue Mind"
                slotProps={{
                  primary: { sx: { color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' } },
                }}
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)', mx: 2, my: 1 }} />

          <ListItem disablePadding sx={{ px: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddLocationAltIcon />}
              onClick={() => { setDrawerOpen(false); setSubmitOpen(true); }}
              sx={{ bgcolor: '#2e7d32', color: 'white', fontWeight: 700, borderRadius: 2, py: 1, '&:hover': { bgcolor: '#1b5e20' } }}
            >
              Submit a Dive Site
            </Button>
          </ListItem>
        </List>
      </Drawer>

      <SubmitSiteDialog open={submitOpen} onClose={() => setSubmitOpen(false)} />
    </>
  );
}
