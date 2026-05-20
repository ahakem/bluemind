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
        variant="outlined"
        startIcon={<AddLocationAltIcon />}
        onClick={() => setOpen(true)}
        sx={{
          borderColor: 'rgba(255,255,255,0.5)',
          color: 'white',
          fontWeight: 600,
          '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.08)' },
        }}
      >
        Submit a Site
      </Button>
      <SubmitSiteDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
}
