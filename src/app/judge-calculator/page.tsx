'use client';

import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Card } from '@mui/material';

export default function JudgeCalculator() {
  const [poolLength, setPoolLength] = useState(25);
  const [laps, setLaps] = useState(0);
  const [remainingMeters, setRemainingMeters] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    const savedPoolLength = localStorage.getItem('judgeCalcPoolLength');
    if (savedPoolLength) {
      setPoolLength(parseInt(savedPoolLength));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('judgeCalcPoolLength', poolLength.toString());
  }, [poolLength]);

  const totalDistance = laps * poolLength + remainingMeters;

  const handleAddLap = () => setLaps(prev => prev + 1);
  const handleRemoveLap = () => { if (laps > 0) setLaps(prev => prev - 1); };

  const handlePoolLengthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') { setPoolLength(0); return; }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) setPoolLength(numValue);
  };

  const handleRemainingMetersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') { setRemainingMeters(0); return; }
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) setRemainingMeters(numValue);
  };

  const handleClearClick = () => setShowConfirmDialog(true);
  const handleConfirmClear = () => { setLaps(0); setRemainingMeters(0); setShowConfirmDialog(false); };
  const handleCancelClear = () => setShowConfirmDialog(false);

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 86, 179, 0.08)',
      '& fieldset': { borderColor: '#e0e7ef', borderWidth: 1.5 },
      '&:hover fieldset': { borderColor: '#0056b3' },
      '&.Mui-focused fieldset': { borderColor: '#0056b3', borderWidth: 2 },
    },
  };

  return (
    <Box
      sx={{
        background: 'linear-gradient(180deg, #f0f6fc 0%, #ffffff 100%)',
        display: 'flex',
        flexDirection: 'column',
        pt: { xs: 2.5, sm: 4 },
        pb: { xs: 3, sm: 4 },
        px: { xs: 2, sm: 0 },
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 380 }}>
        {/* Row 1: Pool + Laps */}
        <Box sx={{ display: 'flex', gap: '15px', mb: '15px' }}>
          {/* Pool */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', color: '#0056b3', mb: 0.5, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Pool
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TextField
                type="number"
                value={poolLength}
                onChange={handlePoolLengthChange}
                inputProps={{ min: 1, style: { textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#0056b3' } }}
                sx={{ flex: 1, ...inputSx, '& .MuiOutlinedInput-input': { py: '8px' } }}
              />
              <Typography sx={{ color: '#0056b3', fontSize: '0.85rem', fontWeight: 600 }}>m</Typography>
            </Box>
          </Box>

          {/* Laps */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ display: 'block', color: '#0056b3', mb: 0.5, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Laps
            </Typography>
            <Card
              sx={{
                textAlign: 'center',
                backgroundColor: '#ffffff',
                border: '1.5px solid #e0e7ef',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 86, 179, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '42px',
              }}
            >
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: '#0056b3', lineHeight: 1 }}>
                {laps}
              </Typography>
            </Card>
          </Box>
        </Box>

        {/* Row 2: + Button */}
        <Button
          onClick={handleAddLap}
          sx={{
            width: '100%',
            height: 120,
            fontSize: '3.5rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #0056b3, #1a75cf)',
            color: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 86, 179, 0.35)',
            transition: 'all 0.2s ease',
            border: 'none',
            mb: '15px',
            '&:hover': {
              background: 'linear-gradient(135deg, #003d80, #0056b3)',
              transform: 'translateY(-2px)',
              boxShadow: '0 16px 48px rgba(0, 86, 179, 0.45)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
          }}
        >
          +
        </Button>

        {/* Row 3: − Button */}
        <Button
          onClick={handleRemoveLap}
          disabled={laps === 0}
          sx={{
            width: '100%',
            py: '10px',
            fontSize: '1.3rem',
            fontWeight: 700,
            backgroundColor: laps === 0 ? '#e8ecf0' : '#ffffff',
            color: laps === 0 ? '#b0bec5' : '#0056b3',
            border: laps === 0 ? '1.5px solid #e0e7ef' : '1.5px solid #0056b3',
            borderRadius: '12px',
            boxShadow: laps === 0 ? 'none' : '0 2px 8px rgba(0, 86, 179, 0.1)',
            transition: 'all 0.2s ease',
            mb: '15px',
            '&:hover:not(:disabled)': {
              backgroundColor: '#f0f6fc',
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0, 86, 179, 0.15)',
            },
            '&:active:not(:disabled)': {
              transform: 'scale(0.98)',
            },
          }}
        >
          −
        </Button>

        {/* Row 4: Remaining */}
        <Box sx={{ mb: '15px' }}>
          <Typography variant="caption" sx={{ display: 'block', color: '#0056b3', mb: 0.5, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Remaining
          </Typography>
          <TextField
            type="number"
            value={remainingMeters}
            onChange={handleRemainingMetersChange}
            inputProps={{ min: 0, style: { textAlign: 'center', fontSize: '1.2rem', fontWeight: 700, color: '#0056b3' } }}
            sx={{ width: '100%', ...inputSx, '& .MuiOutlinedInput-input': { py: '8px' } }}
          />
        </Box>

        {/* Row 5: Total Card */}
        <Card
          sx={{
            p: '14px',
            backgroundColor: '#ffffff',
            border: '1.5px solid #e0e7ef',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(0, 86, 179, 0.1)',
            mb: '15px',
          }}
        >
          <Typography variant="caption" sx={{ display: 'block', color: '#0056b3', mb: 0.3, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            Total
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 0.3 }}>
            <Typography sx={{ fontSize: '2rem', fontWeight: 900, color: '#0056b3', lineHeight: 1 }}>
              {totalDistance}
            </Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#0056b3', fontWeight: 700 }}>m</Typography>
          </Box>
          <Box sx={{ backgroundColor: '#f0f6fc', borderRadius: '8px', p: '4px 8px', mt: 1, display: 'inline-block' }}>
            <Typography variant="caption" sx={{ color: '#5a7da5', fontSize: '0.7rem', fontWeight: 600 }}>
              {laps} × {poolLength} + {remainingMeters}
            </Typography>
          </Box>
        </Card>

        {/* Row 6: Clear */}
        <Button
          onClick={handleClearClick}
          variant="outlined"
          sx={{
            width: '100%',
            py: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#c62828',
            borderColor: '#e0e7ef',
            borderWidth: 1.5,
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: '#fef2f2',
              borderColor: '#c62828',
            },
          }}
        >
          Clear
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelClear}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: '#ffffff',
            color: '#212121',
            borderRadius: '16px',
            border: '1.5px solid #e0e7ef',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        <DialogTitle sx={{ color: '#0056b3', fontWeight: 800, fontSize: '1.2rem' }}>
          Clear Performance?
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#5a7da5', mt: 1, fontSize: '0.95rem' }}>
            This will reset the lap count and remaining meters to zero. The pool length will be preserved.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={handleCancelClear}
            variant="outlined"
            sx={{
              color: '#0056b3',
              borderColor: '#e0e7ef',
              borderWidth: 1.5,
              borderRadius: '10px',
              '&:hover': { backgroundColor: '#f0f6fc', borderColor: '#0056b3' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmClear}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #c62828, #e53935)',
              color: '#ffffff',
              fontWeight: 700,
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(198, 40, 40, 0.25)',
              '&:hover': { boxShadow: '0 6px 16px rgba(198, 40, 40, 0.35)' },
            }}
          >
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
