import { Box, Container, Typography, Grid, Button, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ams from '../assets/BMF-founders.jpg'

const aboutPoints = [
  "Certified Freediving",
  "Indoor Heated Pools",
  "Small Class Sizes",
  "Personalized Training Plans",
  "Safety-First Approach",
  "All Experience Levels Welcome"
];

const About = () => {
  return (
    <Box id="about" sx={{
      py: 10,
      background: "linear-gradient(135deg, #0d47a1, #1976d2, #42a5f5)",
      color: "white"
    }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="subtitle1"
            fontFamily="Montserrat"
            color="white"
            mb={1}
            sx={{ opacity: 0.9 }}
          >
            Our Story
          </Typography>
          <Typography
            variant="h3"
            fontFamily="Poppins"
            fontWeight={700}
            mb={2}
            color="white"
          >
            About Blue Mind Freediving
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "white", mx: "auto", mt: 2, mb: 4 }} />
        </Box>

        <Box sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: 6
        }}>
          <Box sx={{
            flex: 1,
            position: "relative",
            mb: { xs: 8, md: 0 },
            width: { xs: "100%", md: "auto" }
          }}>
            <Box
              component="img"
              src={ams}
              alt="Amsterdam canal view"
              sx={{
                width: "100%",
                height: "auto",
                borderRadius: 2,
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                bottom: { xs: -30, md: -40 },
                right: { xs: "50%", md: -30 },
                transform: { xs: "translateX(50%)", md: "none" },
                width: { xs: 120, md: 140 },
                height: { xs: 120, md: 140 },
                bgcolor: "#2196f3",
                borderRadius: 2,
                boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
                color: "white",
              }}
            >
              <Typography variant="h3" fontWeight={700} fontFamily="Poppins">
                2025
              </Typography>
              <Typography variant="body2" align="center" fontWeight={500} sx={{ opacity: 0.9 }}>
                Founded in Amsterdam
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              fontFamily="Poppins"
              fontWeight={600}
              mb={3}
              color="white"
            >
              Our Amsterdam Community
            </Typography>

            <Typography variant="body1" color="white" paragraph sx={{ opacity: 0.9 }}>
              We, Hakim and Dewi, met in 2024 and started training regularly in swimming pools in the Amsterdam area. Busy lanes filled with swimmers made it challenging to complete our training plan. Determined to have an optimal training environment, we decided to start Blue Mind Freediving, an association designed specifically for freedive training. Our idea was simple: create dedicated lanes to train safely, comfortably, and without distractions. From the start, many people showed interest to join. For our members, we wanted to offer flexibility in training options too, so as a member - based on the available options - you decide when you want to train. Currently we rent lanes in the Sloterparkbad on Monday evening, and are looking to expand soon, in line with the increasing number of members.
            </Typography>

            <Typography variant="body1" color="white" paragraph sx={{ opacity: 0.9 }}>
              At Blue Mind, we want to offer freedivers a great and safe training experience. We are always present at the pool at least 30 min before the training starts, so come meet us there! We also offer the opportunity for you to share and discuss your training plan with us.

            </Typography>
            <Typography variant="body1" color="white" paragraph sx={{ opacity: 0.9 }}>
              The name Blue Mind comes from a book by marine biologist Wallace J. Nichols and refers to the positive effect that water has on human health and wellbeing: being near, in, on, or under water can make you happier, healthier, more connected, and better at what you do. As freedivers we fully support this view!
            </Typography>

            <Box sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mt: 4,
              mb: 4
            }}>
              {aboutPoints.slice(0, 6).map((point, index) => (
                <Box
                  key={index}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    px: 2,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <CheckCircleIcon sx={{ color: "white", mr: 1, fontSize: 18 }} />
                  <Typography variant="body2" color="white">{point}</Typography>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={() => {
                const element = document.querySelector("#membership");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              sx={{
                borderRadius: "50px",
                px: 4,
                py: 1.5,
                fontFamily: "Poppins",
                textTransform: "none",
                bgcolor: "white",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.9)",
                }
              }}
            >
              Join Our Community
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default About;
