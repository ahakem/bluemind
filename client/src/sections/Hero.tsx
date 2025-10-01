import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { PriorityImage } from '../components/OptimizedImage';
import heroImg from "../assets/banner-img.webp"

const Hero = () => {
  // Function to handle smooth scrolling
  const scrollToSection = (sectionId: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box
      component="section"
      id="home"
      role="banner"
      aria-label="Blue Mind Freediving Amsterdam - Welcome section"
      sx={{
        position: "relative",
        height: "90vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden", // Ensure images don't overflow
      }}
    >
      {/* Background hero image */}
      <PriorityImage
        src={heroImg}
        alt="Freediving training pool in Amsterdam - Blue Mind Freediving community"
        priority={true}
        sizes="100vw"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "right top",
          zIndex: 0,
        }}
      />
      
      {/* Dark overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.55)",
          zIndex: 1,
        }}
      />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, color: "white" }}>
          <Grid container>
            <Grid container size={{ xs: 12, md: 9, lg: 7 }}>
              <Typography
                variant="h5"
                component="p"
                color="accent.main"
                mb={1}
                sx={{
                  animation: "float 3s ease-in-out infinite",
                  "@keyframes float": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                  },
                }}
              >
                Welcome to Blue Mind Freediving
              </Typography>

              <Typography
                variant="h1"
                component="h1"
                fontFamily="Poppins"
                fontWeight={700}
                mb={3}
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem", lg: "3rem" },
                  lineHeight: 1.2,
                  textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)",
                }}
              >
                Train Your Mind,{" "}
                <Box component="span" color="secondary.main">
                  Master Your Breath
                </Box>
              </Typography>

              <Typography
                variant="h6"
                component="p"
                fontFamily="Roboto"
                fontWeight={400}
                sx={{
                  opacity: 0.9,
                  mb: 4,
                  maxWidth: "600px",
                }}
              >
                Join our Amsterdam freediving community for professional pool training sessions. Develop your skills with certified instructors in a safe, supportive environment.
              </Typography>            <Box sx={{ flexDirection: { xs: "column", sm: "row" }, gap: { xs: 2, sm: 3 } }}>


              <Button
                variant="contained"
                size="large"
                onClick={scrollToSection('membership')}
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
                Become a Member!
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Scroll indicator */}
      <Box
        sx={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          zIndex: 2,
          animation: "bounce 2s infinite",
          "@keyframes bounce": {
            "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
            "40%": { transform: "translateY(-20px)" },
            "60%": { transform: "translateY(-10px)" },
          },
        }}
      >
        <Button
          onClick={scrollToSection('about')}
          aria-label="Scroll down to about section"
          sx={{
            minWidth: "auto",
            color: "white",
            opacity: 0.7,
            "&:hover": { opacity: 1, backgroundColor: "transparent" },
          }}
        >
          <Box
            component="span"
            sx={{
              display: "block",
              width: 40,
              height: 40,
              borderLeft: "2px solid white",
              borderBottom: "2px solid white",
              transform: "rotate(-45deg)",
            }}
          />
        </Button>
      </Box>
    </Box>
  );
};

export default Hero;