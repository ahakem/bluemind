'use client';

import { Box, Container, Typography, Grid, Button } from "@mui/material";
import { gallery } from "@/data";
import Link from "next/link";
import Image from "next/image";

interface GalleryProps {
  showAll?: boolean;
}

const Gallery = ({ showAll = false }: GalleryProps) => {
  const galleryItems = showAll ? gallery : gallery.slice(0, 6);

  return (
    <Box 
      component="section"
      id="gallery" 
      role="region"
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
            variant="h2"
            component="h1"
            fontFamily="Poppins"
            fontWeight={700}
          >
            Training Environment
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
          {showAll && (
            <Typography 
              variant="body1" 
              color="text.secondary" 
              sx={{ maxWidth: 600, mx: 'auto', mt: 3 }}
            >
              Explore our professional freediving training facilities at Sloterparkbad Amsterdam. 
              See our community in action during pool training sessions.
            </Typography>
          )}
        </Box>

        {/* Gallery Grid */}
        <Grid container spacing={2} role="list" aria-label="Blue Mind Freediving training photos">
          {galleryItems.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`gallery-${index}`} role="listitem">
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                  boxShadow: 2,
                  height: 250,
                  "&:hover img": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Image
                  src={item.image}
                  alt={`Blue Mind Freediving training session in Amsterdam - ${item.title} - Photo ${index + 1}`}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                  style={{
                    objectFit: 'cover',
                    transition: 'transform 0.3s ease-in-out',
                  }}
                  loading="lazy"
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {!showAll && (
          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              href="/gallery"
              sx={{ borderRadius: '50px', px: 4, textTransform: 'none' }}
            >
              View Full Gallery
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Gallery;
