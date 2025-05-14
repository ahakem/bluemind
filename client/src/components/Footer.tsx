import { Box, Container, Typography, Link } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import blueMindLightLogo from "../assets/Bluemind-light.png";

const Footer = () => {
  return (
    <Box sx={{ 
      bgcolor: "#051a33", 
      color: "white", 
      py: 4,
      boxShadow: "0 -5px 20px rgba(0,0,0,0.1)"
    }}>
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2
          }}
        >
          {/* Logo & Copyright */}
          <Box 
            sx={{ 
              display: "flex",
              alignItems: "center",
              gap: { xs: 2, sm: 3 }
            }}
          >
            {/* Logo */}
            <Box 
              component="img"
              src={blueMindLightLogo}
              alt="Blue Mind Freediving"
              sx={{ 
                height: 50,
                width: "auto"
              }} 
            />
            
            {/* Copyright */}
            <Typography 
              variant="body2" 
              color="rgba(255,255,255,0.7)"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              &copy; {new Date().getFullYear()} Blue Mind Freediving
            </Typography>
          </Box>
          
          {/* Instagram Link */}
          <Box 
            sx={{ 
              display: "flex",
              alignItems: "center",
              gap: 1
            }}
          >
             <Typography 
              variant="body2" 
              color="rgba(255,255,255,0.7)"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              KVK number: 96935685
            </Typography>
            |
            <Typography 
              variant="body2" 
              color="rgba(255,255,255,0.7)"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
            >
              Follow us
            </Typography>
            
            <Link 
              href="https://www.instagram.com/bluemind.freediving/" 
              aria-label="Instagram"
              sx={{ 
                color: "white", 
                width: 38, 
                height: 38, 
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                transition: "all 0.3s ease",
                "&:hover": { 
                  bgcolor: "primary.main", 
                  transform: "translateY(-3px)",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.2)"
                }
              }}
            >
              <InstagramIcon fontSize="small" />
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
