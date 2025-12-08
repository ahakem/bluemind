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
import useScrollPosition from "../hooks/useScrollPosition";
import { Link, useNavigate, useLocation } from "react-router-dom";

import logoOriginal from "../assets/bluemind-logo.webp";

const navItems = [
  { name: "Home", hash: "#home" },
  { name: "About Us", hash: "#about" },
  { name: "Membership", hash: "#membership" },
  { name: "Gallery", hash: "#gallery" },
  { name: "Calendar", hash: "#calendar" },
  { name: "Contact", hash: "#contact" },
];

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [elevated, setElevated] = useState(false);
  const scrollPosition = useScrollPosition();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (scrollPosition > 50) {
      setElevated(true);
    } else {
      setElevated(false);
    }
  }, [scrollPosition]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleScrollToSection = (hash: string) => {
    handleCloseNavMenu();
    
    if (location.pathname === "/") {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate("/", { state: { scrollTo: hash } });
    }
  };

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
          <Link to="/">
            <Box 
              component="img"
              src={logoOriginal}
              alt="Blue Mind Freediving"
              sx={{ 
                display: { xs: "none", md: "flex" }, 
                mr: 2,
                height: 50,
                width: "auto",
                cursor: "pointer",
              }} 
            />
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
              {navItems.map((item) => (
                <MenuItem key={item.name} onClick={() => handleScrollToSection(item.hash)}>
                  <Typography textAlign="center" sx={{ color: "text.primary", textDecoration: "none", fontWeight: 500 }}>
                    {item.name}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          
          <Link to="/" style={{ flexGrow: 1, textDecoration: 'none', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ display: { xs: "flex", md: "none" }, alignItems: "center" }}>
              <Box component="img" src={logoOriginal} alt="Blue Mind Freediving" sx={{ height: 40, width: "auto", objectFit: "contain", maxWidth: "200px" }} />
            </Box>
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
            {navItems.map((item) => (
              <Button
                key={item.name}
                onClick={() => handleScrollToSection(item.hash)}
                sx={{ my: 2, mx: 1, display: "block", color: "text.primary", textTransform: "none", fontWeight: 500, "&:hover": { color: "primary.main", background: "transparent" } }}
              >
                {item.name}
              </Button>
            ))}
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