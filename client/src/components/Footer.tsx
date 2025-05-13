import { Box, Container, Typography, Link, Stack } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";
import logoLight from "../assets/logo-light.png";

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "grey.900", color: "white", py: 6 }}>
      <Container maxWidth="lg">
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4
          }}
        >
          {/* Logo */}
          <Box 
            component="img"
            src={logoLight}
            alt="Blue Mind Freediving"
            sx={{ 
              height: 60,
              width: "auto",
              mb: { xs: 3, md: 0 }
            }} 
          />
          
          {/* Social Links */}
          <Stack direction="row" spacing={1.5}>
            <Link 
              href="#" 
              aria-label="Facebook"
              sx={{ 
                color: "grey.400", 
                width: 40, 
                height: 40, 
                bgcolor: "grey.800",
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                "&:hover": { 
                  bgcolor: "primary.main", 
                  color: "white" 
                }
              }}
            >
              <FacebookIcon />
            </Link>
            <Link 
              href="#" 
              aria-label="Instagram"
              sx={{ 
                color: "grey.400", 
                width: 40, 
                height: 40, 
                bgcolor: "grey.800",
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                "&:hover": { 
                  bgcolor: "primary.main", 
                  color: "white" 
                }
              }}
            >
              <InstagramIcon />
            </Link>
            <Link 
              href="#" 
              aria-label="YouTube"
              sx={{ 
                color: "grey.400", 
                width: 40, 
                height: 40, 
                bgcolor: "grey.800",
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                "&:hover": { 
                  bgcolor: "primary.main", 
                  color: "white" 
                }
              }}
            >
              <YouTubeIcon />
            </Link>
            <Link 
              href="#" 
              aria-label="Twitter"
              sx={{ 
                color: "grey.400", 
                width: 40, 
                height: 40, 
                bgcolor: "grey.800",
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                "&:hover": { 
                  bgcolor: "primary.main", 
                  color: "white" 
                }
              }}
            >
              <TwitterIcon />
            </Link>
          </Stack>
        </Box>
        
        {/* Copyright */}
        <Box 
          sx={{ 
            pt: 3, 
            textAlign: "center", 
            borderTop: 1, 
            borderColor: "grey.800" 
          }}
        >
          <Typography variant="body2" color="grey.500">
            &copy; {new Date().getFullYear()} Blue Mind Freediving. All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
