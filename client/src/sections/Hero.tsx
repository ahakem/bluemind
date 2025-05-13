import { Box, Container, Typography, Button, Grid } from "@mui/material";

const Hero = () => {
  return (
    <Box
      id="home"
      sx={{
        position: "relative",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1551244072-5d12893278ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2, color: "white" }}>
        <Grid container>
          <Grid item xs={12} md={9} lg={7}>
            <Typography
              variant="h5"
              component="h5"
              fontFamily="Montserrat"
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
              Welcome to DeepBlue
            </Typography>

            <Typography
              variant="h1"
              component="h1"
              fontFamily="Poppins"
              fontWeight={700}
              mb={3}
              sx={{
                fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" },
                lineHeight: 1.2,
                textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)",
              }}
            >
              Discover the Art of{" "}
              <Box component="span" color="secondary.main">
                Freediving
              </Box>
            </Typography>

            <Typography
              variant="h6"
              fontFamily="Roboto"
              fontWeight={400}
              sx={{
                opacity: 0.9,
                mb: 4,
                maxWidth: "600px",
              }}
            >
              Explore the underwater world on a single breath. Join our professional pool training sessions to master freediving techniques in a safe and controlled environment.
            </Typography>

            <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: { xs: 2, sm: 3 } }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                href="#services"
                sx={{
                  borderRadius: "50px",
                  py: 1.5,
                  px: 4,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  textTransform: "none",
                  boxShadow: 3,
                }}
              >
                Our Training
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                size="large"
                href="#contact"
                sx={{
                  borderRadius: "50px",
                  py: 1.5,
                  px: 4,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  textTransform: "none",
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    backgroundColor: "white",
                    color: "primary.main",
                  },
                }}
              >
                Contact Us
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
          href="#features"
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
