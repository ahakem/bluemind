import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { gallery } from "../data";
import { Link } from "wouter";

// Reusable image container style
const imageContainerStyle = {
  position: "relative",
  overflow: "hidden",
  borderRadius: 2,
  boxShadow: 2,
  height: 300, // Standardized height
  width: "100%",
  mb: 3, // Consistent margin bottom
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.5s ease",
  },
  "&:hover img": {
    transform: "scale(1.1)",
  },
};

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

        {/* Redesigned image grid with consistent sizes */}
        <Grid container spacing={3}>
          {gallery.slice(0, 6).map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box sx={imageContainerStyle}>
                <img
                  src={item.image}
                  alt={item.title}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Link href="/gallery">
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 5,
                },
              }}
            >
              View Full Gallery
            </Button>
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Gallery;