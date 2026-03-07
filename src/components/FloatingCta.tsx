'use client';

import { useState, useEffect } from 'react';
import { Box, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';

interface FloatingCtaProps {
  text: string;
  link: string;
}

export default function FloatingCta({ text, link }: FloatingCtaProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 40% of the page
      const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      setVisible(scrollPercent > 0.35);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (dismissed || !visible) return null;

  const isExternal = link.startsWith('http');

  const btn = (
    <Button
      variant="contained"
      size="small"
      sx={{
        background: 'linear-gradient(135deg, #0056b3, #0077ed)',
        color: '#fff',
        fontWeight: 600,
        fontSize: '0.85rem',
        px: 2.5,
        py: 1,
        borderRadius: '50px',
        textTransform: 'none',
        whiteSpace: 'nowrap',
        boxShadow: 'none',
        '&:hover': {
          background: 'linear-gradient(135deg, #004494, #0066d6)',
        },
      }}
    >
      {text}
    </Button>
  );

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: { xs: 16, md: 28 },
        right: { xs: 16, md: 28 },
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
        borderRadius: '50px',
        pl: 0.5,
        pr: 0.5,
        py: 0.5,
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        border: '1px solid rgba(0,0,0,0.06)',
        animation: 'floatCtaIn 0.4s ease-out',
        '@keyframes floatCtaIn': {
          from: { opacity: 0, transform: 'translateY(20px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {isExternal ? (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          {btn}
        </a>
      ) : (
        <Link href={link} style={{ textDecoration: 'none' }}>
          {btn}
        </Link>
      )}
      <IconButton
        size="small"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        sx={{
          width: 28,
          height: 28,
          color: '#999',
          '&:hover': { color: '#666' },
        }}
      >
        <CloseIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}
