import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { gallery } from "../data";
import { Link } from "wouter";

const Gallery = () => {
  return (
    <Box sx={{ py: 8, bgcolor: "grey.50" }}>
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

        <Grid container spacing={2}>
          {gallery.slice(0, 5).map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: index === 1 ? 6 : 3 }} key={index}>
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                  boxShadow: 2,
                  height: index === 1 ? 500 : 240,
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
                  src={item.image}
                  alt={item.title}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

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
      </Container>
    </Box>
  );
};

export default Gallery;