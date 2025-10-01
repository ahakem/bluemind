import { Box, Container, Typography, Grid, Button, Divider } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ams from '../assets/BMF-founders.webp'

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
    <Box 
      component="section" 
      id="about" 
      role="main"
      aria-labelledby="about-heading"
      sx={{
        py: 10,
        background: "linear-gradient(135deg, #0d47a1, #1976d2, #42a5f5)",
        color: "white"
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box component="header" sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="subtitle1"
            component="p"
            fontFamily="Montserrat"
            color="white"
            mb={1}
            sx={{ opacity: 0.9 }}
          >
            Our Story
          </Typography>
          <Typography
            id="about-heading"
            variant="h2"
            component="h2"
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
              alt="Beautiful Amsterdam canal view showing the city where Blue Mind Freediving offers professional pool training sessions"
              loading="lazy"
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
              component="h3"
              fontFamily="Poppins"
              fontWeight={600}
              mb={3}
              color="white"
            >
              Amsterdam's Premier Freediving Community
            </Typography>

            <Typography variant="body1" color="white" paragraph sx={{ opacity: 0.9 }}>
              Founded by Hakim and Dewi in 2024, Blue Mind Freediving emerged from our shared passion for freediving and the challenges we faced training in Amsterdam's busy swimming pools. After meeting in 2024 and training regularly together, we recognized the need for dedicated freediving lanes where athletes could practice safely without distractions.
            </Typography>

            <Typography variant="body1" color="white" paragraph sx={{ opacity: 0.9 }}>
              Our vision was simple: create Amsterdam's first dedicated freediving training environment where members can develop their breath-hold techniques, dynamic apnea, and static apnea skills under professional supervision. Currently operating at Sloterparkbad every Monday evening, we're expanding our program to meet growing demand from the Amsterdam freediving community.
            </Typography>

            <Typography variant="body1" color="white" paragraph sx={{ opacity: 0.9 }}>
              At Blue Mind Freediving, safety and community are our core values. Our certified instructors arrive 30 minutes before each session to ensure optimal training conditions. We offer personalized training plan consultations and foster a supportive environment where freedivers of all levels can improve their underwater performance.
            </Typography>
            
            <Typography variant="body1" color="white" paragraph sx={{ opacity: 0.9 }}>
              The name "Blue Mind" comes from marine biologist Wallace J. Nichols' research on water's positive effects on human health and wellbeing. As Amsterdam's freediving specialists, we fully embrace this philosophy that being near, in, on, or under water enhances happiness, health, and performance.
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
