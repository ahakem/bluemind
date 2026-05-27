'use client';

import { Box, Button, Stack, Typography } from '@mui/material';
import Link from 'next/link';

const BUBBLES = [
  { left: '6%',  size: 7,  delay: '0s',   dur: '7s'  },
  { left: '16%', size: 12, delay: '1.2s', dur: '9s'  },
  { left: '29%', size: 5,  delay: '0.4s', dur: '6s'  },
  { left: '44%', size: 16, delay: '2.1s', dur: '11s' },
  { left: '58%', size: 8,  delay: '0.8s', dur: '8s'  },
  { left: '71%', size: 10, delay: '1.7s', dur: '10s' },
  { left: '83%', size: 6,  delay: '0.3s', dur: '7s'  },
  { left: '93%', size: 13, delay: '2.5s', dur: '9s'  },
  { left: '38%', size: 4,  delay: '3.1s', dur: '6.5s'},
  { left: '78%', size: 6,  delay: '1.0s', dur: '8.5s'},
];

const DEPTH_MARKS = [0, 10, 20, 30, 40, 50, 70, 100, '∞'];

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #05050e 0%, #010c1c 50%, #000814 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        px: 2,

        '@keyframes rise': {
          '0%':   { transform: 'translateY(0) scale(1)',        opacity: 1 },
          '100%': { transform: 'translateY(-110vh) scale(1.3)', opacity: 0 },
        },
        '@keyframes cardDrop': {
          '0%':   { transform: 'translateY(-90px) rotate(-10deg)', opacity: 0 },
          '60%':  { transform: 'translateY(10px)  rotate(2deg)',   opacity: 1 },
          '78%':  { transform: 'translateY(-5px)  rotate(-1deg)' },
          '100%': { transform: 'translateY(0)     rotate(0deg)',   opacity: 1 },
        },
        '@keyframes flicker': {
          '0%, 46%, 54%, 88%, 96%, 100%': { opacity: 1 },
          '50%': { opacity: 0.08 },
          '92%': { opacity: 0.04 },
        },
        '@keyframes sink': {
          '0%':   { transform: 'translateY(0) rotate(-12deg)',   opacity: 0.7 },
          '100%': { transform: 'translateY(60px) rotate(-20deg)', opacity: 0 },
        },
        '@keyframes scanline': {
          '0%':   { top: '0%' },
          '100%': { top: '100%' },
        },
        '@keyframes blink': {
          '0%, 49%, 51%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        '@keyframes depthScroll': {
          '0%':   { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-55%)' },
        },
      }}
    >
      {/* Depth glow at bottom */}
      <Box sx={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 80% 45% at 50% 90%, rgba(0,50,110,0.28) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Red halo behind card */}
      <Box sx={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -65%)',
        width: 260, height: 260,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(220,32,32,0.18) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* ── Depth rope (left side) ─────────────────────────────── */}
      <Box sx={{
        position: 'absolute',
        left: { xs: 12, md: 32 },
        top: 0,
        bottom: 0,
        width: 48,
        overflow: 'hidden',
        display: { xs: 'none', sm: 'block' },
      }}>
        {/* Rope line */}
        <Box sx={{
          position: 'absolute',
          left: 6, top: 0, bottom: 0,
          width: 1.5,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 80%, transparent 100%)',
        }} />
        {/* Depth marks — scrolling */}
        <Box sx={{ animation: 'depthScroll 12s linear infinite' }}>
          {[...DEPTH_MARKS, ...DEPTH_MARKS].map((d, i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', mb: '28px' }}>
              <Box sx={{ width: 10, height: 1, bgcolor: 'rgba(255,255,255,0.25)', mr: 0.5 }} />
              <Typography sx={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', lineHeight: 1 }}>
                {d}{d !== '∞' ? 'm' : ''}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Dive computer (top-right) ──────────────────────────── */}
      <Box sx={{
        position: 'absolute',
        top: { xs: 16, md: 28 },
        right: { xs: 12, md: 28 },
        bgcolor: 'rgba(0,0,0,0.7)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 2,
        px: 2, py: 1.5,
        backdropFilter: 'blur(8px)',
        minWidth: 160,
      }}>
        <Typography sx={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 1, fontFamily: 'monospace' }}>
          Dive Computer
        </Typography>
        {[
          { label: 'DEPTH', value: '∞ m',   color: '#f87171' },
          { label: 'O₂',    value: '0 %',    color: '#f87171' },
          { label: 'HR',    value: '— bpm', color: 'rgba(255,255,255,0.5)' },
          { label: 'TIME',  value: '404 s',  color: '#fbbf24' },
        ].map(({ label, value, color }) => (
          <Stack key={label} direction="row" justifyContent="space-between" alignItems="center" mb={0.6} gap={2}>
            <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
              {label}
            </Typography>
            <Typography sx={{ fontSize: '0.85rem', color, fontFamily: 'monospace', fontWeight: 800 }}>
              {value}
            </Typography>
          </Stack>
        ))}
        {/* blinking status */}
        <Stack direction="row" alignItems="center" spacing={0.5} mt={1} pt={1} sx={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f87171', animation: 'blink 1s step-end infinite' }} />
          <Typography sx={{ fontSize: '0.68rem', color: '#f87171', fontFamily: 'monospace', letterSpacing: '0.1em', fontWeight: 700 }}>
            BLACKOUT
          </Typography>
        </Stack>
      </Box>

      {/* ── Bubbles ───────────────────────────────────────────── */}
      {BUBBLES.map((b, i) => (
        <Box key={i} sx={{
          position: 'absolute',
          bottom: '-5%',
          left: b.left,
          width: b.size,
          height: b.size,
          borderRadius: '50%',
          border: '1.5px solid rgba(140,220,255,0.55)',
          bgcolor: 'rgba(140,220,255,0.12)',
          boxShadow: '0 0 6px rgba(100,200,255,0.25)',
          animation: `rise ${b.dur} ${b.delay} ease-in infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* ── Sinking diver silhouette ──────────────────────────── */}
      <Box sx={{
        position: 'absolute',
        bottom: 60,
        right: { xs: 20, md: 80 },
        opacity: 0.18,
        animation: 'sink 4s 0.5s ease-in infinite',
      }}>
        <svg width="28" height="52" viewBox="0 0 28 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <circle cx="14" cy="6" r="5" fill="white" />
          {/* Tank / back */}
          <rect x="11" y="11" width="6" height="3" rx="1" fill="white" />
          {/* Body */}
          <rect x="10" y="13" width="8" height="14" rx="3" fill="white" />
          {/* Left arm reaching up */}
          <line x1="10" y1="16" x2="3" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
          {/* Right arm */}
          <line x1="18" y1="16" x2="25" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
          {/* Legs */}
          <line x1="12" y1="27" x2="9"  y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="16" y1="27" x2="19" y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          {/* Fins */}
          <ellipse cx="7"  cy="42" rx="6" ry="2" fill="white" transform="rotate(-20 7 42)"  />
          <ellipse cx="21" cy="42" rx="6" ry="2" fill="white" transform="rotate(20 21 42)"  />
        </svg>
      </Box>

      {/* ── Red card ──────────────────────────────────────────── */}
      <Box sx={{
        width: { xs: 158, sm: 196 },
        height: { xs: 216, sm: 272 },
        bgcolor: '#dc2020',
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 4,
        boxShadow: '0 0 50px rgba(220,32,32,0.55), 0 0 110px rgba(220,32,32,0.2), 0 24px 60px rgba(0,0,0,0.7)',
        animation: 'cardDrop 0.75s cubic-bezier(0.22,1,0.36,1) both',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* sheen */}
        <Box sx={{
          position: 'absolute', top: 0, left: '-50%',
          width: '45%', height: '100%',
          background: 'linear-gradient(108deg, transparent 38%, rgba(255,255,255,0.09) 50%, transparent 62%)',
          pointerEvents: 'none',
        }} />
        {/* scanline */}
        <Box sx={{
          position: 'absolute', left: 0, right: 0, height: 2,
          bgcolor: 'rgba(255,255,255,0.06)',
          animation: 'scanline 3s linear infinite',
          pointerEvents: 'none',
        }} />

        <Typography sx={{
          fontSize: { xs: '5rem', sm: '6.5rem' },
          fontWeight: 900, color: 'white', lineHeight: 1,
          letterSpacing: '-4px',
          fontFamily: 'Poppins, sans-serif',
          animation: 'flicker 9s 2s ease-in-out infinite',
          textShadow: '0 2px 24px rgba(0,0,0,0.5)',
        }}>
          404
        </Typography>

        <Box sx={{ width: 44, height: 2, bgcolor: 'rgba(255,255,255,0.28)', borderRadius: 1, my: 1.5 }} />

        <Typography sx={{
          fontSize: '0.68rem', fontWeight: 800,
          color: 'rgba(255,255,255,0.65)',
          letterSpacing: '0.24em', textTransform: 'uppercase',
        }}>
          Red Card
        </Typography>
      </Box>

      {/* ── DNF badge ─────────────────────────────────────────── */}
      <Box sx={{
        display: 'inline-flex', alignItems: 'center', gap: 1,
        bgcolor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        px: 2, py: 0.6,
        mb: 2.5,
      }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#f87171' }} />
        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
          DNF — Did Not Find
        </Typography>
      </Box>

      {/* Headline */}
      <Typography sx={{
        fontSize: { xs: '1.55rem', sm: '1.9rem' },
        fontWeight: 900, color: 'white',
        letterSpacing: '-0.5px', textAlign: 'center', lineHeight: 1.2,
        mb: 1.25, fontFamily: 'Poppins, sans-serif',
        textShadow: '0 2px 20px rgba(220,32,32,0.22)',
      }}>
        Page blacked out.
      </Typography>

      <Typography sx={{
        fontSize: { xs: '0.87rem', sm: '0.95rem' },
        color: 'rgba(255,255,255,0.35)',
        textAlign: 'center', maxWidth: 330,
        lineHeight: 1.8, mb: 4.5,
      }}>
        This page dove too deep and never surfaced. The judges reviewed the dive — and issued a red card.
      </Typography>

      {/* Buttons */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
        <Button component={Link} href="/" variant="contained" size="large" sx={{
          bgcolor: 'white', color: '#07070f', fontWeight: 800,
          borderRadius: 10, px: 3.5, py: 1.25, fontSize: '0.9rem', textTransform: 'none',
          boxShadow: '0 4px 24px rgba(255,255,255,0.1)',
          '&:hover': { bgcolor: '#f0f0f0', transform: 'translateY(-2px)', boxShadow: '0 8px 32px rgba(255,255,255,0.18)' },
          transition: 'all 0.2s',
        }}>
          ↑ Surface
        </Button>
        <Button component={Link} href="https://freedive.one" variant="outlined" size="large" sx={{
          borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.65)',
          fontWeight: 600, borderRadius: 10, px: 3.5, py: 1.25,
          fontSize: '0.9rem', textTransform: 'none',
          '&:hover': { borderColor: 'rgba(255,255,255,0.5)', color: 'white', bgcolor: 'rgba(255,255,255,0.05)' },
          transition: 'all 0.2s',
        }}>
          Explore Dive Sites
        </Button>
      </Stack>

      {/* Footer */}
      <Typography sx={{
        position: 'absolute', bottom: 18,
        fontSize: '0.62rem', color: 'rgba(255,255,255,0.1)',
        letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace',
      }}>
        depth: ∞m · visibility: 0m · O₂: 0%
      </Typography>
    </Box>
  );
}
