import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { gallery } from "../data";
import { Link } from "react-router-dom"; // Changed back to react-router-dom

const Gallery = () => {
  return (
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

        {/* Simple 3x2 Grid */}
        <Grid container spacing={2}>
          {gallery.slice(0, 6).map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
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
                  alt={item.title}
                  loading="lazy"
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 4 }}>
          {/* Use onClick for navigation to avoid hash routing issues */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            component="a"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/gallery";
            }}
          >
            View More
          </Button>
        </Box>
        
      </Container>
    </Box>
  );
};

export default Gallery;