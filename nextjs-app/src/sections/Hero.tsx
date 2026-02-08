'use client';

import { Box, Container, Typography, Button, Grid, Stack } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <Box
      component="section"
      id="home"
      role="banner"
      aria-label="Blue Mind Freediving Amsterdam - Welcome section"
      sx={{
        position: "relative",
        height: "90vh",
        minHeight: 600,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background hero image with Next.js Image optimization */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: { xs: "100%", md: "50%" },
          height: "100%",
          zIndex: 0,
        }}
      >
        <Image
          src="/images/banner-img.webp"
          alt="Freediving training pool in Amsterdam - Blue Mind Freediving community practicing breath-hold techniques"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{
            objectFit: 'contain',
            objectPosition: 'top right',
          }}
        />
      </Box>
      
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
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ width: "100%", maxWidth: 400 }}
            >
              <Button
                variant="contained"
                size="large"
                component="a"
                href="https://app.bluemindfreediving.nl/#/register"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderRadius: "50px",
                  px: 4,
                  py: 1.5,
                  fontFamily: "Poppins",
                  textTransform: "none",
                  bgcolor: "white",
                  color: "primary.main",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.9)" }
                }}
              >
                Register Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                component="a"
                href="https://app.bluemindfreediving.nl/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  borderRadius: "50px",
                  px: 4,
                  py: 1.5,
                  fontFamily: "Poppins",
                  textTransform: "none",
                  color: "white",
                  borderColor: "white",
                  "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" }
                }}
              >
                Member Login
              </Button>
            </Stack>
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
        <Link href="/about" aria-label="Learn more about Blue Mind Freediving">
          <Box
            sx={{
              minWidth: "auto",
              color: "white",
              opacity: 0.7,
              cursor: 'pointer',
              "&:hover": { opacity: 1 },
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
          </Box>
        </Link>
      </Box>
    </Box>
  );
};

export default Hero;
