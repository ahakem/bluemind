import { Box, Container, Typography, Grid, Button, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const aboutPoints = [
  "Certified Instructors",
  "Heated Indoor Pools",
  "Small Class Sizes",
  "All Levels Welcome",
];

const About = () => {
  return (
    <Box id="about" sx={{ py: 10, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} lg={6}>
            <Box sx={{ position: "relative" }}>
              <Box
                component="img"
                src="https://pixabay.com/get/gdeff265d4b4a376643e3dc164536b41032a7bae4d710da1ebf8da162244d88fd5e1e3066534464728adfa8026ccd67112a2c4f1ef47c47ff5f7ce9c6e5c5a50e_1280.jpg"
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
                  10+
                </Typography>
                <Typography variant="caption" align="center" fontWeight={500}>
                  Years Experience
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} lg={6}>
            <Typography
              variant="subtitle1"
              fontFamily="Montserrat"
              color="primary"
              mb={1}
            >
              About DeepBlue
            </Typography>
            
            <Typography
              variant="h3"
              fontFamily="Poppins"
              fontWeight={700}
              mb={3}
            >
              The Premier Freediving Training Center
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              Founded in 2013, DeepBlue Freediving Club has established itself as the leading facility for pool-based freediving training. Our state-of-the-art facilities and expert instructors create the perfect environment for beginners and advanced freedivers alike.
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              We believe that proper technique and safety protocols learned in controlled pool conditions build the foundation for successful open water freediving experiences.
            </Typography>
            
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {aboutPoints.map((point, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CheckCircleIcon sx={{ color: "accent.main", mr: 1 }} />
                    <Typography variant="body1">{point}</Typography>
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
              Explore Our Training
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
