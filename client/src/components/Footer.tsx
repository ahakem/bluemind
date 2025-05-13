import { Box, Container, Grid, Typography, Link, Stack } from "@mui/material";
import WaterIcon from "@mui/icons-material/Water";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import ScheduleIcon from "@mui/icons-material/Schedule";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";

const Footer = () => {
  return (
    <Box sx={{ bgcolor: "grey.900", color: "white", pt: 12, pb: 2 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4} mb={6}>
          {/* Company Info */}
          <Grid item xs={12} md={6} lg={3}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <WaterIcon sx={{ color: "secondary.main", fontSize: "2rem", mr: 1 }} />
              <Typography variant="h5" fontFamily="Poppins" fontWeight={700}>
                DeepBlue
              </Typography>
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ color: "grey.400", mb: 3 }}
            >
              DeepBlue is Southern California's premier freediving training center, specializing in pool-based techniques and safety protocols.
            </Typography>
            
            <Stack direction="row" spacing={1}>
              <Link 
                href="#" 
                sx={{ 
                  color: "grey.400", 
                  width: 36, 
                  height: 36, 
                  bgcolor: "grey.800",
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  "&:hover": { 
                    bgcolor: "secondary.main", 
                    color: "white" 
                  }
                }}
              >
                <FacebookIcon fontSize="small" />
              </Link>
              <Link 
                href="#" 
                sx={{ 
                  color: "grey.400", 
                  width: 36, 
                  height: 36, 
                  bgcolor: "grey.800",
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  "&:hover": { 
                    bgcolor: "secondary.main", 
                    color: "white" 
                  }
                }}
              >
                <InstagramIcon fontSize="small" />
              </Link>
              <Link 
                href="#" 
                sx={{ 
                  color: "grey.400", 
                  width: 36, 
                  height: 36, 
                  bgcolor: "grey.800",
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  "&:hover": { 
                    bgcolor: "secondary.main", 
                    color: "white" 
                  }
                }}
              >
                <YouTubeIcon fontSize="small" />
              </Link>
              <Link 
                href="#" 
                sx={{ 
                  color: "grey.400", 
                  width: 36, 
                  height: 36, 
                  bgcolor: "grey.800",
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  "&:hover": { 
                    bgcolor: "secondary.main", 
                    color: "white" 
                  }
                }}
              >
                <TwitterIcon fontSize="small" />
              </Link>
            </Stack>
          </Grid>
          
          {/* Quick Links */}
          <Grid item xs={12} md={6} lg={3}>
            <Typography 
              variant="h6" 
              fontFamily="Poppins" 
              fontWeight={600} 
              mb={3}
            >
              Quick Links
            </Typography>
            
            <Stack spacing={1.5}>
              {["Home", "About Us", "Training Programs", "Our Team", "Testimonials", "Contact"].map((item, index) => (
                <Link 
                  key={index}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  underline="none"
                  sx={{ 
                    color: "grey.400", 
                    "&:hover": { 
                      color: "secondary.main" 
                    }
                  }}
                >
                  {item}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          {/* Programs */}
          <Grid item xs={12} md={6} lg={3}>
            <Typography 
              variant="h6" 
              fontFamily="Poppins" 
              fontWeight={600} 
              mb={3}
            >
              Programs
            </Typography>
            
            <Stack spacing={1.5}>
              {[
                "Introduction to Freediving",
                "Dynamic Apnea Training",
                "Static Apnea Mastery",
                "Safety Protocols",
                "Competitive Freediving",
                "Private Coaching"
              ].map((item, index) => (
                <Link 
                  key={index}
                  href="#services"
                  underline="none"
                  sx={{ 
                    color: "grey.400", 
                    "&:hover": { 
                      color: "secondary.main" 
                    }
                  }}
                >
                  {item}
                </Link>
              ))}
            </Stack>
          </Grid>
          
          {/* Contact Info */}
          <Grid item xs={12} md={6} lg={3}>
            <Typography 
              variant="h6" 
              fontFamily="Poppins" 
              fontWeight={600} 
              mb={3}
            >
              Contact Info
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ display: "flex" }}>
                <LocationOnIcon sx={{ color: "secondary.main", mr: 1, mt: 0.3 }} />
                <Typography variant="body2" color="grey.400">
                  123 Aquatic Drive, Oceanview, CA 92051
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex" }}>
                <EmailIcon sx={{ color: "secondary.main", mr: 1, mt: 0.3 }} />
                <Typography variant="body2" color="grey.400">
                  info@deepbluefreediving.com
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex" }}>
                <PhoneIcon sx={{ color: "secondary.main", mr: 1, mt: 0.3 }} />
                <Typography variant="body2" color="grey.400">
                  (555) 123-4567
                </Typography>
              </Box>
              
              <Box sx={{ display: "flex" }}>
                <ScheduleIcon sx={{ color: "secondary.main", mr: 1, mt: 0.3 }} />
                <Typography variant="body2" color="grey.400">
                  Mon-Fri: 6am - 9pm<br/>
                  Sat-Sun: 8am - 7pm
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
        
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
            &copy; {new Date().getFullYear()} DeepBlue Freediving. All Rights Reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
