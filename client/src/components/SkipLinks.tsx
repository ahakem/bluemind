import React from 'react';
import { Box, Link } from '@mui/material';

/**
 * SkipLinks component provides keyboard navigation shortcuts
 * for screen reader users and keyboard-only navigation
 */
const SkipLinks: React.FC = () => {
  const skipLinkStyle = {
    position: 'absolute',
    left: '-9999px',
    zIndex: 9999,
    padding: '8px 16px',
    backgroundColor: '#000',
    color: '#fff',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '0 0 4px 4px',
    transition: 'left 0.2s ease',
    '&:focus': {
      left: '8px',
      top: '8px',
    },
    '&:hover': {
      backgroundColor: '#333',
    }
  };

  const handleSkipToContent = (targetId: string) => (event: React.KeyboardEvent | React.MouseEvent) => {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box>
      <Link
        href="#main-content"
        sx={skipLinkStyle}
        onClick={handleSkipToContent('main-content')}
        onKeyDown={(e) => e.key === 'Enter' && handleSkipToContent('main-content')(e)}
      >
        Skip to main content
      </Link>
      <Link
        href="#navigation"
        sx={skipLinkStyle}
        onClick={handleSkipToContent('navigation')}
        onKeyDown={(e) => e.key === 'Enter' && handleSkipToContent('navigation')(e)}
      >
        Skip to navigation
      </Link>
      <Link
        href="#footer"
        sx={skipLinkStyle}
        onClick={handleSkipToContent('footer')}
        onKeyDown={(e) => e.key === 'Enter' && handleSkipToContent('footer')(e)}
      >
        Skip to footer
      </Link>
    </Box>
  );
};

export default SkipLinks;