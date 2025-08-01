import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { gallery } from "../data";
import { Link } from "wouter";

const Gallery = () => {
  return (
    // The id="gallery" is added here for the navigation link
    <Box id="gallery" sx={{ py: 8, bgcolor: "grey.50" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="subtitle1"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Our Facilities
          </Typography>
          <Typography
            variant="h3"
            fontFamily="Poppins"
            fontWeight={700}
          >
            Training Environment
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
        </Box>

        {/* This is your existing image grid, which is perfectly fine. */}
        <Grid container spacing={2}>
          {/* First image */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                boxShadow: 2,
                height: 240,
                img: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                },
                "&:hover img": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <img
                src={gallery[0].image}
                alt={gallery[0].title}
              />
            </Box>
          </Grid>

          {/* Center large image */}
          <Grid item xs={12} sm={6} md={6}>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                boxShadow: 2,
                height: 500,
                img: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                },
                "&:hover img": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <img
                src={gallery[1].image}
                alt={gallery[1].title}
              />
            </Box>
          </Grid>

          {/* Right column images */}
          <Grid item xs={12} sm={6} md={3}>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                boxShadow: 2,
                height: 240,
                mb: 2,
                img: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                },
                "&:hover img": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <img
                src={gallery[2].image}
                alt={gallery[2].title}
              />
            </Box>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                boxShadow: 2,
                height: 240,
                img: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                },
                "&:hover img": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <img
                src={gallery[3].image}
                alt={gallery[3].title}
              />
            </Box>
          </Grid>

          {/* Bottom wide image */}
          <Grid item xs={12} sm={12} md={6}>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                boxShadow: 2,
                height: 240,
                mt: { xs: 2, md: 2 },
                img: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.5s ease",
                },
                "&:hover img": {
                  transform: "scale(1.1)",
                },
              }}
            >
              <img
                src={gallery[4].image}
                alt={gallery[4].title}
              />
            </Box>
          </Grid>
        </Grid>

        {/* --- THIS IS THE MISSING BUTTON --- */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Link href="/gallery">
            <Button
              variant="contained"
              color="primary"
              size="large"
            >
              View More
            </Button>
          </Link>
        </Box>
        {/* --- END OF BUTTON SECTION --- */}
        
      </Container>
    </Box>
  );
};

export default Gallery;