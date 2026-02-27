'use client';

import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Alert } from '@mui/material';
import {
  Facebook,
  Twitter,
  LinkedIn,
  Pinterest,
  ContentCopy,
  WhatsApp,
} from '@mui/icons-material';

interface ShareButtonsProps {
  title: string;
  excerpt: string;
  url: string;
}

export default function ShareButtons({ title, excerpt, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
      url
    )}&description=${encodeURIComponent(excerpt)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(
      `${title} ${url}`
    )}`,
  };

  const handleShare = (platform: string) => {
    const link = shareLinks[platform as keyof typeof shareLinks];
    if (link) {
      window.open(link, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Tooltip title="Share on Twitter">
        <IconButton
          size="small"
          onClick={() => handleShare('twitter')}
          sx={{
            color: '#1DA1F2',
            '&:hover': { bgcolor: 'rgba(29, 161, 242, 0.1)' },
          }}
        >
          <Twitter fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Share on Facebook">
        <IconButton
          size="small"
          onClick={() => handleShare('facebook')}
          sx={{
            color: '#1877F2',
            '&:hover': { bgcolor: 'rgba(24, 119, 242, 0.1)' },
          }}
        >
          <Facebook fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Share on LinkedIn">
        <IconButton
          size="small"
          onClick={() => handleShare('linkedin')}
          sx={{
            color: '#0A66C2',
            '&:hover': { bgcolor: 'rgba(10, 102, 194, 0.1)' },
          }}
        >
          <LinkedIn fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Share on Pinterest">
        <IconButton
          size="small"
          onClick={() => handleShare('pinterest')}
          sx={{
            color: '#E60023',
            '&:hover': { bgcolor: 'rgba(230, 0, 35, 0.1)' },
          }}
        >
          <Pinterest fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Share on WhatsApp">
        <IconButton
          size="small"
          onClick={() => handleShare('whatsapp')}
          sx={{
            color: '#25D366',
            '&:hover': { bgcolor: 'rgba(37, 211, 102, 0.1)' },
          }}
        >
          <WhatsApp fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
        <IconButton
          size="small"
          onClick={handleCopyLink}
          sx={{
            color: copied ? '#4caf50' : '#666',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.05)' },
          }}
        >
          <ContentCopy fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
