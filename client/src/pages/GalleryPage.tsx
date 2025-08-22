import { useState } from "react";
import { Box, Container, Typography, Grid, Modal, IconButton } from "@mui/material";
import { gallery } from "../data";
import { ArrowBack, ArrowForward, Close } from "@mui/icons-material";
import { Helmet } from 'react-helmet-async';

const GalleryPage = () => {
  const [open, setOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const handleOpen = (index: number) => {
    setSelectedImageIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prevIndex) => (prevIndex === 0 ? gallery.length - 1 : prevIndex - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedImageIndex((prevIndex) => (prevIndex === gallery.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <>
      <Helmet>
        <title>Freediving Photo Gallery | Blue Mind Freediving Amsterdam</title>
        <meta 
          name="description" 
          content="Explore Blue Mind Freediving's photo gallery showcasing our pool training sessions and freediving community in Amsterdam."
        />
        <meta name="keywords" content="freediving photos, freediving gallery, Amsterdam freediving, pool training images" />
        <meta property="og:title" content="Freediving Photo Gallery | Blue Mind Freediving" />
        <meta property="og:description" content="View photos of our freediving training sessions and community events." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bluemindfreediving.nl/#/gallery" />
        <meta property="og:image" content="https://bluemindfreediving.nl/gallery-preview.jpg" />
        <link rel="canonical" href="https://bluemindfreediving.nl" />
      </Helmet>

      <Box sx={{ py: 8, bgcolor: "grey.50" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h2"
              fontFamily="Poppins"
              fontWeight={700}
            >
              Photo Gallery
            </Typography>
            <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
          </Box>

          <Grid container spacing={2}>
            {gallery.map((item, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Box
                  onClick={() => handleOpen(index)}
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 2,
                    boxShadow: 2,
                    height: 240,
                    cursor: "pointer",
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
        </Container>

        <Modal
          open={open}
          onClose={handleClose}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "transparent",
              boxShadow: 24,
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100vw",
              height: "100vh",
            }}
          >
            <Box onClick={handleClose} sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)' }} />
            <IconButton
              onClick={handleClose}
              sx={{ position: "absolute", top: 16, right: 16, color: "white", zIndex: 1 }}
            >
              <Close />
            </IconButton>
            <IconButton
              onClick={handlePrev}
              sx={{ position: "absolute", left: 16, color: "white", zIndex: 1 }}
            >
              <ArrowBack fontSize="large" />
            </IconButton>
            <img
              src={gallery[selectedImageIndex].image}
              alt="Selected"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: 'contain',
                position: 'relative',
                zIndex: 0
              }}
            />
            <IconButton
              onClick={handleNext}
              sx={{ position: "absolute", right: 16, color: "white", zIndex: 1 }}
            >
              <ArrowForward fontSize="large" />
            </IconButton>
          </Box>
        </Modal>
      </Box>
    </>
  );
};

export default GalleryPage;