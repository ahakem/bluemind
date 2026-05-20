'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import SubmitSiteDialog from '@/components/SubmitSiteDialog';

export default function SubmitSiteButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="contained"
        startIcon={<AddLocationAltIcon />}
        onClick={() => setOpen(true)}
        size="large"
        sx={{
          bgcolor: '#2e7d32',
          color: 'white',
          fontWeight: 700,
          fontSize: '0.95rem',
          px: 3,
          py: 1.2,
          borderRadius: 2,
          boxShadow: '0 4px 14px rgba(46,125,50,0.45)',
          '&:hover': { bgcolor: '#1b5e20', boxShadow: '0 6px 18px rgba(46,125,50,0.55)' },
        }}
      >
        Submit a Dive Site
      </Button>
      <SubmitSiteDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
