'use client';

import { Box, Container, Typography, Button } from "@mui/material";
import { gallery } from "@/data";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import GalleryModal from "@/components/GalleryModal";

interface GalleryProps {
  showAll?: boolean;
  enableModal?: boolean;
}

const Gallery = ({ showAll = false, enableModal = true }: GalleryProps) => {
  const galleryItems = showAll ? gallery : gallery.slice(0, 6);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleImageClick = (index: number) => {
    if (enableModal) {
      setCurrentImageIndex(index);
      setModalOpen(true);
    }
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

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
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: 2
          }}
          role="list" 
          aria-label="Blue Mind Freediving training photos"
        >
          {galleryItems.map((item, index) => (
            <Box 
              key={`gallery-${index}`} 
              role="listitem"
              onClick={() => handleImageClick(index)}
              sx={{ cursor: enableModal ? 'pointer' : 'default' }}
            >
              <Box
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                  boxShadow: 2,
                  height: 250,
                  "&:hover img": {
                    transform: enableModal ? "scale(1.05)" : "scale(1.02)",
                  },
                  "&:hover": {
                    boxShadow: enableModal ? 4 : 3,
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
            </Box>
          ))}
        </Box>

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

        {enableModal && (
          <GalleryModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            images={galleryItems}
            currentIndex={currentImageIndex}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}
      </Container>
    </Box>
  );
};

export default Gallery;
