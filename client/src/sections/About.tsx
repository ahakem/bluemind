import { Box, Container, Typography, Grid, Button, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const aboutPoints = [
  "Certified Freediving Instructors",
  "Indoor Heated Pools",
  "Small Class Sizes",
  "Personalized Training Plans",
  "Safety-First Approach",
  "All Experience Levels Welcome"
];

const About = () => {
  return (
    <Box id="about" sx={{ py: 10, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="subtitle1"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Who We Are
          </Typography>
          <Typography
            variant="h3"
            fontFamily="Poppins"
            fontWeight={700}
            mb={2}
          >
            About Blue Mind Freediving
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2, mb: 4 }} />
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: "800px", 
              mx: "auto",
              mb: 2
            }}
          >
            Blue Mind Freediving is a community-focused club dedicated to the art and science of breath-hold diving in controlled pool environments. 
            We emphasize mental preparation, proper technique, and safety protocols that translate to greater confidence and ability in any water environment.
          </Typography>
        </Box>

        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} lg={6}>
            <Box sx={{ position: "relative" }}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1551523891-25859b6d9315?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=800&q=80"
                alt="Freediving training in pool"
                sx={{
                  width: "100%",
                  height: "auto",
                  borderRadius: 2,
                  boxShadow: 4,
                }}
              />
              
              <Box
                sx={{
                  position: "absolute",
                  bottom: { xs: -20, md: -24 },
                  right: { xs: 8, md: -24 },
                  width: { xs: 100, md: 128 },
                  height: { xs: 100, md: 128 },
                  bgcolor: "white",
                  borderRadius: 2,
                  boxShadow: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                }}
              >
                <Typography variant="h3" color="primary" fontWeight={700} fontFamily="Poppins">
                  8+
                </Typography>
                <Typography variant="caption" align="center" fontWeight={500}>
                  Years Experience
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Typography
              variant="h4"
              fontFamily="Poppins"
              fontWeight={600}
              mb={3}
            >
              Our Philosophy
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Founded in 2016, Blue Mind Freediving has grown from a small group of enthusiasts to a thriving community of divers passionate about the mental and physical benefits of freediving.
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              We believe that the controlled pool environment provides the perfect foundation for developing freediving skills. By mastering techniques in a predictable setting, our members build the confidence and abilities needed for open water experiences.
            </Typography>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography
              variant="h5"
              fontFamily="Poppins"
              fontWeight={600}
              mb={2}
            >
              What Sets Us Apart
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {aboutPoints.map((point, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CheckCircleIcon sx={{ color: "accent.main", mr: 1 }} />
                    <Typography variant="body2">{point}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            
            <Button
              variant="contained"
              color="primary"
              size="large"
              href="#services"
              sx={{
                borderRadius: "50px",
                px: 4,
                py: 1.5,
                fontFamily: "Poppins",
                textTransform: "none",
              }}
            >
              View Our Programs
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
