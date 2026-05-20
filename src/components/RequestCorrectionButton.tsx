'use client';

import { useState } from 'react';
import { Button } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import { DiveSite } from '@/types/admin';
import RequestCorrectionDialog from '@/components/RequestCorrectionDialog';

export default function RequestCorrectionButton({ site }: { site: DiveSite }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outlined"
        size="small"
        startIcon={<FlagIcon />}
        onClick={() => setOpen(true)}
        fullWidth
        sx={{
          borderColor: 'rgba(255,255,255,0.3)',
          color: 'rgba(255,255,255,0.7)',
          fontWeight: 500,
          fontSize: '0.8rem',
          '&:hover': { borderColor: 'rgba(255,255,255,0.6)', color: 'white', bgcolor: 'rgba(255,255,255,0.05)' },
        }}
      >
        Report incorrect data
      </Button>
      <RequestCorrectionDialog open={open} onClose={() => setOpen(false)} site={site} />
    </>
  );
}
