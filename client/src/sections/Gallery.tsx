import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { gallery } from "../data";
import { Link } from "react-router-dom";

const Gallery = () => {
  // Get only the first 6 items for the gallery preview
  const galleryPreview = gallery.slice(0, 6);

  return (
    <Box 
      component="section"
      id="gallery" 
      role="main"
      aria-labelledby="gallery-heading"
      sx={{ py: 8, bgcolor: "grey.50" }}
    >
      <Container maxWidth="lg">
        <Box component="header" sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="subtitle1"
            component="p"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Our Facilities
          </Typography>
          <Typography
            id="gallery-heading"
            variant="h3"
            component="h2"
            fontFamily="Poppins"
            fontWeight={700}
          >
            Training Environment
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
        </Box>

        {/* Simple 3x2 Grid */}
        <Grid container spacing={2} role="img" aria-label="Blue Mind Freediving training photos">
          {galleryPreview.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`gallery-preview-${index}`}>
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                  boxShadow: 2,
                  height: 250, // All items have the same height
                  img: {
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.3s ease-in-out",
                  },
                  "&:hover img": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <img
                  src={item.image}
                  alt={`Blue Mind Freediving training session in Amsterdam pool - ${item.title} ${index + 1}`}
                  loading="lazy"
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            to="/gallery"
          >
            View More
          </Button>
        </Box>
        
      </Container>
    </Box>
  );
};

export default Gallery;