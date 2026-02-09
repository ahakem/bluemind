'use client';

import { Box, IconButton, Modal, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import Image from "next/image";
import { useEffect } from "react";

interface GalleryModalProps {
  open: boolean;
  onClose: () => void;
  images: { image: string; title: string }[];
  currentIndex: number;
  onNext: () => void;
  onPrev: () => void;
}

const GalleryModal = ({ open, onClose, images, currentIndex, onNext, onPrev }: GalleryModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onNext, onPrev, onClose]);

  if (!open || images.length === 0) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'rgba(0, 0, 0, 0.95)',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '90vw',
          height: '90vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
            zIndex: 2,
          }}
          aria-label="Close gallery"
        >
          <CloseIcon />
        </IconButton>

        {/* Previous Button */}
        <IconButton
          onClick={onPrev}
          sx={{
            position: 'absolute',
            left: { xs: 10, md: 40 },
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
            zIndex: 2,
          }}
          aria-label="Previous image"
        >
          <ArrowBackIosNewIcon />
        </IconButton>

        {/* Image Container */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image
            src={images[currentIndex].image}
            alt={images[currentIndex].title}
            fill
            style={{
              objectFit: 'contain',
            }}
            sizes="90vw"
            priority
          />
        </Box>

        {/* Next Button */}
        <IconButton
          onClick={onNext}
          sx={{
            position: 'absolute',
            right: { xs: 10, md: 40 },
            color: 'white',
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.7)',
            },
            zIndex: 2,
          }}
          aria-label="Next image"
        >
          <ArrowForwardIosIcon />
        </IconButton>

        {/* Image Counter */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            px: 3,
            py: 1,
            borderRadius: 2,
            zIndex: 2,
          }}
        >
          <Typography variant="body2">
            {currentIndex + 1} / {images.length}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

export default GalleryModal;
