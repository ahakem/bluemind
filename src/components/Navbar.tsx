'use client';

import { useState, useEffect } from "react";
import SubmitSiteDialog from "@/components/SubmitSiteDialog";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import MenuIcon from "@mui/icons-material/Menu";
import useScrollPosition from "@/hooks/useScrollPosition";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useSiteFeatures } from "@/contexts/SiteSettingsContext";
import WaterIcon from "@mui/icons-material/Water";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import PublicIcon from "@mui/icons-material/Public";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import { useIsFreediveOne } from "@/hooks/useIsFreediveOne";

const ALL_NAV_ITEMS = [
  { name: "Home", href: "/", feature: null, schoolOnly: false },
  { name: "About", href: "/about", feature: null, schoolOnly: false },
  { name: "Membership", href: "/membership", feature: null, schoolOnly: true },
  { name: "Gallery", href: "/gallery", feature: null, schoolOnly: true },
  { name: "Dive Sites", href: "/dive-sites", feature: "diveSitesEnabled", schoolOnly: false },
  { name: "Blog", href: "/blog", feature: null, schoolOnly: false },
  { name: "Community", href: "/community", feature: null, schoolOnly: true },
  { name: "Schedule", href: "/schedule", feature: null, schoolOnly: true },
  { name: "Reviews", href: "/reviews", feature: null, schoolOnly: true },
  { name: "Contact", href: "/contact", feature: null, schoolOnly: true },
];

const FREEDIVE_NAV_ITEMS = [
  { name: "Blog", href: "/blog", isDiveSites: false },
  { name: "About", href: "/about", isDiveSites: false },
];

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [elevated, setElevated] = useState(false);
  const scrollPosition = useScrollPosition();
  const features = useSiteFeatures();
  const isFreediveOne = useIsFreediveOne();

  const bluemindNavItems = ALL_NAV_ITEMS.filter((item) =>
    !item.feature || features[item.feature as keyof typeof features]
  );

  const pathname = usePathname();

  useEffect(() => {
    setElevated(scrollPosition > 50);
  }, [scrollPosition]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const [exploreAnchor, setExploreAnchor] = useState<null | HTMLElement>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  if (isFreediveOne) {
    const navBtnSx = {
      px: 1.25, py: 0.6,
      textTransform: "none" as const,
      fontWeight: 500,
      fontSize: "0.875rem",
      color: "text.primary",
      borderRadius: 2,
      "&:hover": { bgcolor: "rgba(0,119,190,0.07)", color: "primary.main" },
    };

    return (
      <>
      <AppBar
        position="sticky"
        component="header"
        sx={{ top: 0, zIndex: 1100, background: "white", color: "text.primary", boxShadow: elevated ? 2 : 0, transition: "box-shadow 0.3s ease" }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1 }}>

            {/* ── Logo ── */}
            <Link href="/" style={{ textDecoration: "none", flexShrink: 0, marginRight: 8 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <WaterIcon sx={{ color: "#0077be", fontSize: 26 }} />
                <Typography variant="h6" fontWeight={800} sx={{ color: "#001f3f", letterSpacing: "-0.5px", fontSize: "1.15rem", "& span": { color: "#0077be" } }}>
                  freedive<span>.one</span>
                </Typography>
              </Box>
            </Link>

            {/* ── Desktop nav ── */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.25 }}>

              {/* Explore dropdown */}
              <Button
                endIcon={<KeyboardArrowDownIcon />}
                onClick={(e) => setExploreAnchor(e.currentTarget)}
                sx={navBtnSx}
              >
                Explore
              </Button>
              <Menu
                anchorEl={exploreAnchor}
                open={Boolean(exploreAnchor)}
                onClose={() => setExploreAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{ sx: { mt: 0.5, minWidth: 200, borderRadius: 2, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" } }}
              >
                <MenuItem component={Link} href="/continents" onClick={() => setExploreAnchor(null)} sx={{ py: 1, fontSize: "0.875rem", gap: 1.5 }}>
                  <PublicIcon sx={{ fontSize: 18, color: "#0077be" }} />
                  <ListItemText primary="By Continent" secondary="Browse all 6 continents" />
                </MenuItem>
                <MenuItem component={Link} href="/countries" onClick={() => setExploreAnchor(null)} sx={{ py: 1, fontSize: "0.875rem", gap: 1.5 }}>
                  <WaterIcon sx={{ fontSize: 18, color: "#0077be" }} />
                  <ListItemText primary="By Country" secondary="80+ countries" />
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem disabled sx={{ opacity: 1, py: 0.5 }}>
                  <Typography variant="caption" fontWeight={700} color="text.disabled" sx={{ textTransform: "uppercase", letterSpacing: 1 }}>
                    Water Type
                  </Typography>
                </MenuItem>
                {[{ label: "Sea & Ocean", val: "sea" }, { label: "Lakes & Quarries", val: "lake" }, { label: "Deep Tanks", val: "deep_tank" }].map((wt) => (
                  <MenuItem key={wt.val} component={Link} href={`/?waterType=${wt.val}`} onClick={() => setExploreAnchor(null)} sx={{ py: 0.75, fontSize: "0.875rem" }}>
                    <ListItemText primary={wt.label} />
                  </MenuItem>
                ))}
              </Menu>

              <Button component={Link} href="/blog" sx={navBtnSx}>Blog</Button>
              <Button component={Link} href="/about" sx={navBtnSx}>About</Button>
            </Box>

            {/* ── Submit a Site CTA ── */}
            <Button
              variant="contained"
              startIcon={<AddLocationAltIcon />}
              onClick={() => setSubmitOpen(true)}
              sx={{
                display: { xs: "none", sm: "flex" },
                ml: "auto",
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.85rem",
                bgcolor: "#2e7d32",
                px: 2.5,
                "&:hover": { bgcolor: "#1b5e20" },
              }}
            >
              Submit a Dive Site
            </Button>

            {/* ── Mobile hamburger ── */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" }, justifyContent: "flex-end" }}>
              <IconButton size="large" onClick={handleOpenNavMenu} color="inherit">
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorElNav}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem component={Link} href="/continents" onClick={handleCloseNavMenu}>By Continent</MenuItem>
                <MenuItem component={Link} href="/countries" onClick={handleCloseNavMenu}>By Country</MenuItem>
                <MenuItem component={Link} href="/blog" onClick={handleCloseNavMenu}>Blog</MenuItem>
                <MenuItem component={Link} href="/about" onClick={handleCloseNavMenu}>About</MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleCloseNavMenu(); setSubmitOpen(true); }} sx={{ fontWeight: 700, color: "#2e7d32" }}>
                  Submit a Dive Site
                </MenuItem>
              </Menu>
            </Box>

          </Toolbar>
        </Container>
      </AppBar>
      <SubmitSiteDialog open={submitOpen} onClose={() => setSubmitOpen(false)} />
      </>
    );
  }

  // ── Blue Mind navbar ──────────────────────────────────────────────────────
  return (
    <AppBar
      position="sticky"
      component="header"
      id="navigation"
      role="banner"
      aria-label="Main navigation"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        background: "white",
        color: "text.primary",
        boxShadow: elevated ? 2 : 0,
        transition: "box-shadow 0.3s ease"
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                mr: 2,
                position: 'relative',
                height: 50,
                width: 150,
                cursor: "pointer",
              }}
            >
              <Image
                src="/images/bluemind-logo.webp"
                alt="Blue Mind Freediving - Amsterdam Freediving Club"
                fill
                sizes="150px"
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
          </Link>

          <Box sx={{ flexGrow: 0, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              color="inherit"
              aria-label="Open navigation menu"
              aria-controls="menu-appbar"
              aria-expanded={Boolean(anchorElNav)}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              keepMounted
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {bluemindNavItems.map((item) => {
                const isDiveSites = item.href === '/dive-sites';
                const active = isActive(item.href);
                return (
                  <MenuItem
                    key={item.name}
                    onClick={handleCloseNavMenu}
                    component={Link}
                    href={isDiveSites ? 'https://freedive.one' : item.href}
                    selected={active}
                    sx={isDiveSites ? {
                      mx: 1, my: 0.5, borderRadius: 2,
                      background: 'linear-gradient(135deg, #001f3f 0%, #003d7a 100%)',
                      '&:hover': { background: 'linear-gradient(135deg, #0077be 0%, #005fa3 100%)' },
                    } : {}}
                  >
                    {isDiveSites && <WaterIcon sx={{ fontSize: 16, color: '#4fc3f7', mr: 1 }} />}
                    <Typography
                      textAlign="center"
                      sx={{
                        color: isDiveSites ? 'white' : active ? "primary.main" : "text.primary",
                        textDecoration: "none",
                        fontWeight: isDiveSites ? 700 : active ? 600 : 500,
                      }}
                    >
                      {item.name}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>

          <Link href="/" style={{ flexGrow: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", position: 'relative', height: 40, width: 120 }}>
              <Image
                src="/images/bluemind-logo.webp"
                alt="Blue Mind Freediving"
                fill
                sizes="120px"
                style={{ objectFit: 'contain' }}
                priority
              />
            </Box>
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "center", alignItems: "center" }}>
            {bluemindNavItems.map((item) => {
              const isDiveSites = item.href === '/dive-sites';
              const active = isActive(item.href);
              if (isDiveSites) {
                return (
                  <Button
                    key={item.name}
                    component={Link}
                    href="https://freedive.one"
                    startIcon={<WaterIcon sx={{ fontSize: '16px !important' }} />}
                    sx={{
                      mx: 0.5, px: 1.75, py: 0.55,
                      whiteSpace: 'nowrap',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      borderRadius: '50px',
                      background: active
                        ? 'linear-gradient(135deg, #0077be 0%, #005fa3 100%)'
                        : 'linear-gradient(135deg, #001f3f 0%, #003d7a 100%)',
                      color: 'white',
                      border: '1.5px solid',
                      borderColor: active ? '#0077be' : 'rgba(0,119,190,0.5)',
                      boxShadow: '0 2px 8px rgba(0,119,190,0.25)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #0077be 0%, #005fa3 100%)',
                        borderColor: '#0077be',
                        boxShadow: '0 4px 14px rgba(0,119,190,0.4)',
                      },
                    }}
                  >
                    {item.name}
                  </Button>
                );
              }
              return (
                <Button
                  key={item.name}
                  component={Link}
                  href={item.href}
                  sx={{
                    my: 2, mx: 0.25, px: 1,
                    display: "block",
                    whiteSpace: 'nowrap',
                    color: active ? "primary.main" : "text.primary",
                    textTransform: "none",
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.85rem',
                    borderBottom: active ? '2px solid' : 'none',
                    borderColor: 'primary.main',
                    borderRadius: 0,
                    "&:hover": { color: "primary.main", background: "transparent" }
                  }}
                >
                  {item.name}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              href="https://app.bluemindfreediving.nl"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="primary"
              sx={{ borderRadius: "50px", textTransform: "none", px: 3 }}
            >
              Member Login
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
