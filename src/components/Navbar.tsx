'use client';

import { useState, useEffect } from "react";
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

const ALL_NAV_ITEMS = [
  { name: "Home",       href: "/",           feature: null },
  { name: "About",      href: "/about",      feature: null },
  { name: "Membership", href: "/membership", feature: null },
  { name: "Gallery",    href: "/gallery",    feature: null },
  { name: "Blog",       href: "/blog",       feature: null },
  { name: "Community",  href: "/community",  feature: null },
  { name: "Schedule",   href: "/schedule",   feature: null },
  { name: "Reviews",    href: "/reviews",    feature: null },
  { name: "Contact",    href: "/contact",    feature: null },
];

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [elevated, setElevated] = useState(false);
  const scrollPosition = useScrollPosition();
  const features = useSiteFeatures();
  const pathname = usePathname();

  const navItems = ALL_NAV_ITEMS.filter((item) =>
    !item.feature || features[item.feature as keyof typeof features]
  );

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

  return (
    <AppBar
      position="sticky"
      component="header"
      id="navigation"
      role="banner"
      aria-label="Main navigation"
      sx={{
        top: 0,
        zIndex: 1100,
        background: "white",
        color: "text.primary",
        boxShadow: elevated ? 2 : 0,
        transition: "box-shadow 0.3s ease",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>

          {/* Desktop logo */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Box sx={{ display: { xs: "none", md: "flex" }, mr: 2, position: 'relative', height: 50, width: 150, cursor: "pointer" }}>
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

          {/* Mobile hamburger */}
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
              {navItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <MenuItem key={item.name} onClick={handleCloseNavMenu} component={Link} href={item.href} selected={active}>
                    <Typography textAlign="center" sx={{ color: active ? "primary.main" : "text.primary", fontWeight: active ? 600 : 500 }}>
                      {item.name}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>

          {/* Mobile logo */}
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

          {/* Desktop nav links */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "center", alignItems: "center" }}>
            {navItems.map((item) => {
              const active = isActive(item.href);
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
                    "&:hover": { color: "primary.main", background: "transparent" },
                  }}
                >
                  {item.name}
                </Button>
              );
            })}
          </Box>

          {/* Member Login */}
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
