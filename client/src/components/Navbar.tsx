import { useState, useEffect } from "react";
import { Link as RouterLink } from "wouter";
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

// Import the Blue Mind Freediving logos
import logoOriginal from "../assets/bluemind-logo.png";
const navItems = [
  { name: "Home", href: "#home" },
  { name: "About Us", href: "#about" },
  { name: "Membership", href: "#membership" },
  { name: "Calendar", href: "#calendar" },
  { name: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [elevated, setElevated] = useState(false);
  const scrollPosition = useScrollPosition();

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

  return (
    <AppBar 
      position="sticky" 
      sx={{
        background: "white",
        color: "text.primary",
        boxShadow: elevated ? 2 : 0,
        transition: "box-shadow 0.3s ease"
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          <Box 
            component="img"
            src={logoOriginal}
            alt="Blue Mind Freediving"
            sx={{ 
              display: { xs: "none", md: "flex" }, 
              mr: 2,
              height: 50,
              width: "auto"
            }} 
          />

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 0, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {navItems.map((item) => (
                <MenuItem key={item.name} onClick={handleCloseNavMenu}>
                  <Typography 
                    textAlign="center"
                    component="a"
                    href={item.href}
                    sx={{
                      color: "text.primary",
                      textDecoration: "none",
                      fontFamily: "Poppins",
                      fontWeight: 500
                    }}
                  >
                    {item.name}
                  </Typography>
                </MenuItem>
              ))}
              <MenuItem onClick={handleCloseNavMenu}>
                <Button
                  component="a"
                  href="#contact"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{
                    fontFamily: "Poppins",
                    borderRadius: "50px",
                    textTransform: "none",
                    mt: 1
                  }}
                >
                  Join Now
                </Button>
              </MenuItem>
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Box 
            sx={{
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Box
              component="img"
              src={logoOriginal}
              alt="Blue Mind Freediving"
              sx={{ 
                height: 40,
                width: "auto",
                objectFit: "contain",
                maxWidth: "200px"
              }} 
            />
          </Box>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
            {navItems.map((item) => (
              <Button
                key={item.name}
                component="a"
                href={item.href}
                onClick={handleCloseNavMenu}
                sx={{ 
                  my: 2, 
                  mx: 1,
                  display: "block", 
                  color: "text.primary",
                  fontFamily: "Poppins",
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    color: "primary.main",
                    background: "transparent"
                  }
                }}
              >
                {item.name}
              </Button>
            ))}
          </Box>

          {/* CTA Button (Desktop) */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              component="a"
              href="#contact"
              variant="contained"
              color="primary"
              sx={{
                fontFamily: "Poppins",
                borderRadius: "50px",
                textTransform: "none",
                px: 3
              }}
            >
              Join Now
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
