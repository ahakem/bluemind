'use client';

import { useEffect, useState } from 'react';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IosShareIcon from '@mui/icons-material/IosShare';
import GetAppIcon from '@mui/icons-material/GetApp';

const DISMISSED_KEY = 'bm_dive_install_dismissed_v2';

function isIOS() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isInStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return (window.navigator as any).standalone === true
    || window.matchMedia('(display-mode: standalone)').matches;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function DiveSitesInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const onIOS = isIOS();
    setIos(onIOS);

    // Always show the banner — Install button appears only when browser supports it
    setVisible(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
      localStorage.setItem(DISMISSED_KEY, '1');
    }
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1300,
        bgcolor: '#001f3f',
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        px: 2,
        py: 1.5,
        border: '1px solid rgba(144,213,255,0.2)',
        maxWidth: 480,
        mx: 'auto',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box
          component="img"
          src="/dive-pwa/icon-96.png"
          alt=""
          sx={{ width: 44, height: 44, borderRadius: 2, flexShrink: 0 }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} sx={{ color: 'white', lineHeight: 1.3 }}>
            BMF Dive Sites
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(144,213,255,0.8)', lineHeight: 1.4, display: 'block' }}>
            {ios
              ? <>Tap <IosShareIcon sx={{ fontSize: 12, verticalAlign: 'middle', mx: 0.25 }} /> then <strong>"Add to Home Screen"</strong></>
              : 'Install for quick access — no browser needed'}
          </Typography>
        </Box>

        {!ios && (
          deferredPrompt ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<GetAppIcon sx={{ fontSize: '14px !important' }} />}
              onClick={install}
              sx={{
                bgcolor: '#0077be', color: 'white', fontWeight: 700,
                fontSize: '0.78rem', whiteSpace: 'nowrap', flexShrink: 0,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#005f99', boxShadow: 'none' },
              }}
            >
              Install
            </Button>
          ) : (
            <Typography variant="caption" sx={{ color: 'rgba(144,213,255,0.6)', flexShrink: 0, fontSize: '0.7rem', textAlign: 'right' }}>
              Browser menu<br />→ Install
            </Typography>
          )
        )}

        <IconButton
          size="small"
          onClick={dismiss}
          sx={{ color: 'rgba(255,255,255,0.5)', flexShrink: 0, '&:hover': { color: 'white' } }}
          aria-label="Dismiss"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}
