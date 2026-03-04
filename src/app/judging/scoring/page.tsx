'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, TextField, Button, Typography, Card, Chip, IconButton,
  ToggleButton, ToggleButtonGroup, Checkbox, FormControlLabel,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import Link from 'next/link';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

// ─── Types ───────────────────────────────────────────────────────────
type DisciplineTab = 'STA' | 'DYN';

type DQCode =
  | 'DQAIRWAY'
  | 'DQSP'
  | 'DQOTHER'
  | 'DQLATESTART';

type TechnicalFoul = 'TURN' | 'START' | 'PULL';

interface PenaltyState {
  tab: DisciplineTab;
  // STA Performance (min + sec)
  apMinutes: number;
  apSeconds: number;
  rpMinutes: number;
  rpSeconds: number;
  // Dynamic Performance (meters)
  apMeters: number;
  rpMeters: number;
  // Early Start (seconds before OT)
  earlyStartSeconds: number;
  // Late Start (seconds after OT grace period)
  lateStartSeconds: number;
  // Technical (Dynamic only) — counts
  technicalFouls: Record<TechnicalFoul, number>;
  // DQ
  activeDQ: DQCode | null;
}

// ─── Constants ───────────────────────────────────────────────────────
const DQ_OPTIONS: { code: DQCode; label: string; description: string }[] = [
  { code: 'DQAIRWAY', label: 'DQ AIRWAY', description: 'Airway below surface after surfacing' },
  { code: 'DQSP', label: 'DQ SP', description: 'Surface Protocol failure (Equip → OK → Verbal, 15s)' },
  { code: 'DQOTHER', label: 'DQ OTHER', description: 'Arm recovery, full-length surface swim, >1.5m submerge, etc.' },
  { code: 'DQLATESTART', label: 'DQ LATE START', description: 'Start >30s after OT' },
];

const TECHNICAL_OPTIONS: { code: TechnicalFoul; label: string; description: string }[] = [
  { code: 'TURN', label: 'TURN', description: 'No wall contact during turn' },
  { code: 'START', label: 'START', description: 'No wall contact during start' },
  { code: 'PULL', label: 'PULL', description: 'Pulling on support point (wall/bottom)' },
];

// ─── Helpers ─────────────────────────────────────────────────────────
function calcBasePoints(tab: DisciplineTab, rpSeconds: number, rpMeters: number): number {
  if (tab === 'STA') {
    return Math.floor(rpSeconds * 0.2 * 5) / 5; // round down to nearest 0.2
  }
  return Math.floor(rpMeters * 0.5 * 2) / 2; // round down to nearest 0.5
}

function calcUnderAPPenalty(tab: DisciplineTab, apSeconds: number, apMeters: number, rpSeconds: number, rpMeters: number): number {
  if (tab === 'STA') {
    const diff = apSeconds - rpSeconds;
    return diff > 0 ? diff * 0.2 : 0;
  }
  const diff = apMeters - rpMeters;
  return diff > 0 ? diff * 0.5 : 0;
}

function calcEarlyStartPenalty(seconds: number): number {
  if (seconds <= 0) return 0;
  return Math.ceil(seconds / 5) * 1.0;
}

function calcLateStartPenalty(seconds: number): { penalty: number; isDQ: boolean } {
  if (seconds <= 0) return { penalty: 0, isDQ: false };
  if (seconds <= 10) return { penalty: 0, isDQ: false };
  if (seconds <= 30) return { penalty: Math.ceil((seconds - 10) / 5) * 1.0, isDQ: false };
  return { penalty: 0, isDQ: true };
}

// ─── Component ───────────────────────────────────────────────────────
export default function PoolPenalties() {
  const [state, setState] = useState<PenaltyState>({
    tab: 'DYN',
    apMinutes: 0, apSeconds: 0,
    rpMinutes: 0, rpSeconds: 0,
    apMeters: 0, rpMeters: 0,
    earlyStartSeconds: 0,
    lateStartSeconds: 0,
    technicalFouls: { TURN: 0, START: 0, PULL: 0 },
    activeDQ: null,
  });
  const [showClearDialog, setShowClearDialog] = useState(false);

  const isSTA = state.tab === 'STA';

  const set = useCallback(<K extends keyof PenaltyState>(key: K, value: PenaltyState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  }, []);

  const setNum = useCallback((key: keyof PenaltyState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '') { set(key, 0 as never); return; }
    const n = parseInt(v);
    if (!isNaN(n) && n >= 0) set(key, n as never);
  }, [set]);

  const setTechnicalCount = useCallback((code: TechnicalFoul, count: number) => {
    setState(prev => ({
      ...prev,
      technicalFouls: { ...prev.technicalFouls, [code]: Math.max(0, count) },
    }));
  }, []);

  const toggleTechnical = useCallback((code: TechnicalFoul) => {
    setState(prev => {
      const current = prev.technicalFouls[code];
      return {
        ...prev,
        technicalFouls: { ...prev.technicalFouls, [code]: current > 0 ? 0 : 1 },
      };
    });
  }, []);

  // ─── Calculations ─────────────────────────────────────────────────
  const calc = useMemo(() => {
    const totalApSeconds = state.apMinutes * 60 + state.apSeconds;
    const totalRpSeconds = state.rpMinutes * 60 + state.rpSeconds;
    const basePoints = calcBasePoints(state.tab, totalRpSeconds, state.rpMeters);
    const underAP = calcUnderAPPenalty(state.tab, totalApSeconds, state.apMeters, totalRpSeconds, state.rpMeters);
    const earlyPenalty = calcEarlyStartPenalty(state.earlyStartSeconds);
    const late = calcLateStartPenalty(state.lateStartSeconds);

    const totalTechnicalCount = Object.values(state.technicalFouls).reduce((a, b) => a + b, 0);
    const technicalPenalty = !isSTA ? totalTechnicalCount * 5 : 0;

    const isDQ = state.activeDQ !== null || late.isDQ;
    const totalPenalties = underAP + earlyPenalty + late.penalty + technicalPenalty;
    const finalPoints = isDQ ? 0 : Math.max(0, basePoints - totalPenalties);

    const codes: { label: string; color: 'warning' | 'error' | 'info' }[] = [];
    if (underAP > 0) codes.push({ label: `UNDER AP −${underAP.toFixed(1)}`, color: 'warning' });
    if (earlyPenalty > 0) codes.push({ label: `EARLY −${earlyPenalty.toFixed(1)}`, color: 'warning' });
    if (late.penalty > 0) codes.push({ label: `LATE −${late.penalty.toFixed(1)}`, color: 'warning' });
    if (late.isDQ) codes.push({ label: 'DQ LATE START', color: 'error' });
    Object.entries(state.technicalFouls).forEach(([code, count]) => {
      if (count > 0) codes.push({ label: `${code} ×${count} −${(count * 5).toFixed(1)}`, color: 'info' });
    });
    if (state.activeDQ) codes.push({ label: DQ_OPTIONS.find(d => d.code === state.activeDQ)?.label || '', color: 'error' });

    return { basePoints, underAP, earlyPenalty, late, technicalPenalty, totalTechnicalCount, totalPenalties, finalPoints, isDQ, codes };
  }, [state, isSTA]);

  const handleClear = () => {
    setState(prev => ({
      ...prev,
      apMinutes: 0, apSeconds: 0,
      rpMinutes: 0, rpSeconds: 0,
      apMeters: 0, rpMeters: 0,
      earlyStartSeconds: 0, lateStartSeconds: 0,
      technicalFouls: { TURN: 0, START: 0, PULL: 0 },
      activeDQ: null,
    }));
    setShowClearDialog(false);
  };

  // ─── Styles ────────────────────────────────────────────────────────
  const labelSx = { display: 'block', color: '#0056b3', mb: 0.5, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.5px', textTransform: 'uppercase' as const };
  const cardSx = { backgroundColor: '#ffffff', border: '1.5px solid #e0e7ef', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 86, 179, 0.08)' };
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#ffffff', borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 86, 179, 0.08)',
      '& fieldset': { borderColor: '#e0e7ef', borderWidth: 1.5 },
      '&:hover fieldset': { borderColor: '#0056b3' },
      '&.Mui-focused fieldset': { borderColor: '#0056b3', borderWidth: 2 },
    },
  };
  const numInputStyle = { textAlign: 'center' as const, fontSize: '1rem', fontWeight: 700, color: '#0056b3' };
  const counterBtnSx = {
    width: 32, height: 32, minWidth: 32,
    border: '1.5px solid #e0e7ef', borderRadius: '8px',
    color: '#0056b3', backgroundColor: '#ffffff',
    '&:hover': { backgroundColor: '#f0f6fc', borderColor: '#0056b3' },
    '&.Mui-disabled': { color: '#b0bec5', borderColor: '#e0e7ef' },
  };

  return (
    <Box sx={{ background: 'linear-gradient(180deg, #f0f6fc 0%, #ffffff 100%)', display: 'flex', flexDirection: 'column', pt: { xs: 2, sm: 3 }, pb: { xs: 3, sm: 4 }, px: { xs: 2, sm: 0 }, alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 420 }}>

        {/* Page Heading (SEO) */}
        <Typography
          variant="h1"
          component="h1"
          sx={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#0056b3',
            textAlign: 'center',
            mb: '15px',
          }}
        >
          Penalty System — AIDA 2025
        </Typography>

        {/* ── Tab: Static / Dynamic ── */}
        <Card sx={{ ...cardSx, p: '12px', mb: '15px', textAlign: 'center' }}>
          <ToggleButtonGroup
            value={state.tab}
            exclusive
            onChange={(_, v) => { if (v) set('tab', v); }}
            sx={{ width: '100%', '& .MuiToggleButton-root': { flex: 1, py: '8px', fontSize: '0.9rem', fontWeight: 700, borderColor: '#e0e7ef', color: '#5a7da5', borderRadius: '10px !important', '&.Mui-selected': { background: 'linear-gradient(135deg, #0056b3, #1a75cf)', color: '#fff', borderColor: '#0056b3', '&:hover': { background: 'linear-gradient(135deg, #003d80, #0056b3)' } } } }}
          >
            <ToggleButton value="STA">Static</ToggleButton>
            <ToggleButton value="DYN">Dynamic</ToggleButton>
          </ToggleButtonGroup>
        </Card>

        {/* ── AP & RP side by side ── */}
        <Box sx={{ display: 'flex', gap: '15px', mb: '15px' }}>
          <Card sx={{ ...cardSx, p: '12px', flex: 1 }}>
            <Typography variant="caption" sx={labelSx}>AP</Typography>
            {isSTA ? (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <TextField
                  type="number"
                  value={state.apMinutes}
                  onChange={setNum('apMinutes')}
                  inputProps={{ min: 0, style: numInputStyle }}
                  sx={{ flex: 1, ...inputSx, '& .MuiOutlinedInput-input': { py: '8px' } }}
                />
                <Typography sx={{ color: '#0056b3', fontWeight: 700, fontSize: '0.7rem' }}>min</Typography>
                <TextField
                  type="number"
                  value={state.apSeconds}
                  onChange={setNum('apSeconds')}
                  inputProps={{ min: 0, max: 59, style: numInputStyle }}
                  sx={{ flex: 1, ...inputSx, '& .MuiOutlinedInput-input': { py: '8px' } }}
                />
                <Typography sx={{ color: '#0056b3', fontWeight: 700, fontSize: '0.7rem' }}>sec</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <TextField
                  type="number"
                  value={state.apMeters}
                  onChange={setNum('apMeters')}
                  inputProps={{ min: 0, style: numInputStyle }}
                  sx={{ flex: 1, ...inputSx, '& .MuiOutlinedInput-input': { py: '8px' } }}
                />
                <Typography sx={{ color: '#0056b3', fontWeight: 700, fontSize: '0.85rem' }}>m</Typography>
              </Box>
            )}
          </Card>
          <Card sx={{ ...cardSx, p: '12px', flex: 1 }}>
            <Typography variant="caption" sx={labelSx}>RP</Typography>
            {isSTA ? (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <TextField
                  type="number"
                  value={state.rpMinutes}
                  onChange={setNum('rpMinutes')}
                  inputProps={{ min: 0, style: numInputStyle }}
                  sx={{ flex: 1, ...inputSx, '& .MuiOutlinedInput-input': { py: '8px' } }}
                />
                <Typography sx={{ color: '#0056b3', fontWeight: 700, fontSize: '0.7rem' }}>min</Typography>
                <TextField
                  type="number"
                  value={state.rpSeconds}
                  onChange={setNum('rpSeconds')}
                  inputProps={{ min: 0, max: 59, style: numInputStyle }}
                  sx={{ flex: 1, ...inputSx, '& .MuiOutlinedInput-input': { py: '8px' } }}
                />
                <Typography sx={{ color: '#0056b3', fontWeight: 700, fontSize: '0.7rem' }}>sec</Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                <TextField
                  type="number"
                  value={state.rpMeters}
                  onChange={setNum('rpMeters')}
                  inputProps={{ min: 0, style: numInputStyle }}
                  sx={{ flex: 1, ...inputSx, '& .MuiOutlinedInput-input': { py: '8px' } }}
                />
                <Typography sx={{ color: '#0056b3', fontWeight: 700, fontSize: '0.85rem' }}>m</Typography>
              </Box>
            )}
          </Card>
        </Box>

        {/* ── Early Start & Late Start side by side ── */}
        <Box sx={{ display: 'flex', gap: '15px', mb: '15px' }}>
          <Card sx={{ ...cardSx, p: '12px', flex: 1 }}>
            <Typography variant="caption" sx={labelSx}>Early Start</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <TextField
                type="number"
                value={state.earlyStartSeconds}
                onChange={setNum('earlyStartSeconds')}
                inputProps={{ min: 0, style: numInputStyle }}
                sx={{ flex: 1, ...inputSx, '& .MuiOutlinedInput-input': { py: '8px' } }}
              />
              <Typography sx={{ color: '#0056b3', fontWeight: 700, fontSize: '0.85rem' }}>sec</Typography>
            </Box>
            {state.earlyStartSeconds > 0 && (
              <Typography sx={{ fontSize: '0.65rem', color: '#e65100', fontWeight: 600, mt: 0.5 }}>
                −{calcEarlyStartPenalty(state.earlyStartSeconds).toFixed(1)} pts (1pt/5s)
              </Typography>
            )}
          </Card>
          <Card sx={{ ...cardSx, p: '12px', flex: 1 }}>
            <Typography variant="caption" sx={labelSx}>Late Start</Typography>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <TextField
                type="number"
                value={state.lateStartSeconds}
                onChange={setNum('lateStartSeconds')}
                inputProps={{ min: 0, style: numInputStyle }}
                sx={{ flex: 1, ...inputSx, '& .MuiOutlinedInput-input': { py: '8px' } }}
              />
              <Typography sx={{ color: '#0056b3', fontWeight: 700, fontSize: '0.85rem' }}>sec</Typography>
            </Box>
            {state.lateStartSeconds > 10 && state.lateStartSeconds <= 30 && (
              <Typography sx={{ fontSize: '0.65rem', color: '#e65100', fontWeight: 600, mt: 0.5 }}>
                −{calcLateStartPenalty(state.lateStartSeconds).penalty.toFixed(1)} pts (1pt/5s)
              </Typography>
            )}
            {state.lateStartSeconds > 30 && (
              <Typography sx={{ fontSize: '0.65rem', color: '#c62828', fontWeight: 700, mt: 0.5 }}>
                DQ LATE START (&gt;30s)
              </Typography>
            )}
          </Card>
        </Box>

        {/* ── Technical Penalties (Dynamic only) ── */}
        {!isSTA && (
          <Card sx={{ ...cardSx, p: '12px', mb: '15px' }}>
            <Typography variant="caption" sx={labelSx}>Technical Penalties (−5 pts each)</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {TECHNICAL_OPTIONS.map(t => {
                const count = state.technicalFouls[t.code];
                const isActive = count > 0;
                return (
                  <Box key={t.code}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Checkbox
                        checked={isActive}
                        onChange={() => toggleTechnical(t.code)}
                        sx={{ color: '#0056b3', '&.Mui-checked': { color: '#0056b3' }, p: '4px' }}
                        size="small"
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: isActive ? '#0056b3' : '#212121', lineHeight: 1.2 }}>{t.label}</Typography>
                        <Typography sx={{ fontSize: '0.6rem', color: '#5a7da5', lineHeight: 1.2 }}>{t.description}</Typography>
                      </Box>
                      {isActive && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={() => setTechnicalCount(t.code, count - 1)}
                            disabled={count <= 0}
                            sx={counterBtnSx}
                          >
                            <RemoveIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                          <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#0056b3', minWidth: 20, textAlign: 'center' }}>
                            {count}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => setTechnicalCount(t.code, count + 1)}
                            sx={counterBtnSx}
                          >
                            <AddIcon sx={{ fontSize: '1rem' }} />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    {isActive && (
                      <Typography sx={{ fontSize: '0.65rem', color: '#e65100', fontWeight: 600, ml: '36px' }}>
                        −{(count * 5).toFixed(1)} pts ({count}×5)
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Card>
        )}

        {/* ── Disqualifications (Red Card) ── */}
        <Card sx={{ ...cardSx, p: '12px', mb: '15px', borderColor: state.activeDQ ? '#c62828' : '#e0e7ef' }}>
          <Typography variant="caption" sx={{ ...labelSx, color: state.activeDQ ? '#c62828' : '#0056b3' }}>
            Disqualification (Red Card)
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {DQ_OPTIONS.map(dq => (
              <FormControlLabel
                key={dq.code}
                control={
                  <Checkbox
                    checked={state.activeDQ === dq.code}
                    onChange={() => set('activeDQ', state.activeDQ === dq.code ? null : dq.code)}
                    sx={{ color: '#c62828', '&.Mui-checked': { color: '#c62828' }, p: '4px 8px' }}
                    size="small"
                  />
                }
                label={
                  <Box>
                    <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: state.activeDQ === dq.code ? '#c62828' : '#212121', lineHeight: 1.2 }}>{dq.label}</Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: '#5a7da5', lineHeight: 1.2 }}>{dq.description}</Typography>
                  </Box>
                }
                sx={{ mx: 0, alignItems: 'flex-start' }}
              />
            ))}
          </Box>
        </Card>

        <Divider sx={{ my: '6px', borderColor: '#e0e7ef' }} />

        {/* ── Penalty Summary Chips ── */}
        {calc.codes.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mb: '12px', mt: '10px' }}>
            {calc.codes.map((c, i) => (
              <Chip
                key={i}
                label={c.label}
                color={c.color}
                size="small"
                sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: '8px', height: 26 }}
              />
            ))}
          </Box>
        )}

        {/* ── Score Breakdown ── */}
        <Card sx={{ ...cardSx, p: '14px', mb: '15px', mt: calc.codes.length > 0 ? 0 : '10px' }}>
          <Typography variant="caption" sx={labelSx}>Score Breakdown</Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '4px' }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#212121', fontWeight: 600 }}>Base Points</Typography>
            <Typography sx={{ fontSize: '0.95rem', color: '#0056b3', fontWeight: 800 }}>{calc.basePoints.toFixed(1)}</Typography>
          </Box>

          {calc.underAP > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '4px' }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#e65100', fontWeight: 600 }}>Under AP</Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#e65100', fontWeight: 800 }}>−{calc.underAP.toFixed(1)}</Typography>
            </Box>
          )}

          {calc.earlyPenalty > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '4px' }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#e65100', fontWeight: 600 }}>Early Start</Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#e65100', fontWeight: 800 }}>−{calc.earlyPenalty.toFixed(1)}</Typography>
            </Box>
          )}

          {calc.late.penalty > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '4px' }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#e65100', fontWeight: 600 }}>Late Start</Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#e65100', fontWeight: 800 }}>−{calc.late.penalty.toFixed(1)}</Typography>
            </Box>
          )}

          {calc.technicalPenalty > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '4px' }}>
              <Typography sx={{ fontSize: '0.85rem', color: '#e65100', fontWeight: 600 }}>Technical ({calc.totalTechnicalCount}×5)</Typography>
              <Typography sx={{ fontSize: '0.95rem', color: '#e65100', fontWeight: 800 }}>−{calc.technicalPenalty.toFixed(1)}</Typography>
            </Box>
          )}

          <Divider sx={{ my: '6px', borderColor: '#e0e7ef' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: '4px' }}>
            <Typography sx={{ fontSize: '1rem', color: '#212121', fontWeight: 800 }}>Final Score</Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.3 }}>
              <Typography sx={{ fontSize: '1.6rem', fontWeight: 900, color: calc.isDQ ? '#c62828' : '#0056b3', lineHeight: 1 }}>
                {calc.isDQ ? 'DQ' : calc.finalPoints.toFixed(1)}
              </Typography>
              {!calc.isDQ && <Typography sx={{ fontSize: '0.8rem', color: '#0056b3', fontWeight: 700 }}>pts</Typography>}
            </Box>
          </Box>

          {calc.isDQ && (
            <Box sx={{ backgroundColor: '#fef2f2', borderRadius: '8px', p: '6px 10px', mt: 1, textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#c62828' }}>
                {state.activeDQ
                  ? DQ_OPTIONS.find(d => d.code === state.activeDQ)?.description
                  : 'Start more than 30 seconds after Official Top'}
              </Typography>
            </Box>
          )}
        </Card>

        {/* ── Go to Pool Distance Tracker ── */}
        <Link href="/judging/pool-distance" style={{ textDecoration: 'none', display: 'block', marginBottom: '15px' }}>
          <Button
            variant="outlined"
            sx={{
              width: '100%', py: '10px', fontSize: '0.85rem', fontWeight: 700,
              color: '#0056b3', borderColor: '#e0e7ef', borderWidth: 1.5, borderRadius: '12px',
              backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: '#f0f6fc', borderColor: '#0056b3' },
            }}
          >
            Pool Distance Tracker
          </Button>
        </Link>

        {/* ── Back to Judge Suite Hub ── */}
        <Link href="/judging" style={{ textDecoration: 'none', display: 'block', marginBottom: '15px' }}>
          <Button
            variant="outlined"
            sx={{
              width: '100%', py: '10px', fontSize: '0.85rem', fontWeight: 700,
              color: '#0056b3', borderColor: '#e0e7ef', borderWidth: 1.5, borderRadius: '12px',
              backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.2s ease',
              '&:hover': { backgroundColor: '#f0f6fc', borderColor: '#0056b3' },
            }}
          >
            ← Judge Suite
          </Button>
        </Link>

        {/* ── Clear Button ── */}
        <Button
          onClick={() => setShowClearDialog(true)}
          variant="outlined"
          sx={{
            width: '100%', py: '10px', fontSize: '0.85rem', fontWeight: 700,
            color: '#c62828', borderColor: '#e0e7ef', borderWidth: 1.5, borderRadius: '12px',
            backgroundColor: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
            '&:hover': { backgroundColor: '#fef2f2', borderColor: '#c62828' },
          }}
        >
          Clear All
        </Button>
      </Box>

      {/* ── Confirm Dialog ── */}
      <Dialog open={showClearDialog} onClose={() => setShowClearDialog(false)} sx={{ '& .MuiDialog-paper': { backgroundColor: '#ffffff', color: '#212121', borderRadius: '16px', border: '1.5px solid #e0e7ef', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' } }}>
        <DialogTitle sx={{ color: '#0056b3', fontWeight: 800, fontSize: '1.2rem' }}>Clear All Penalties?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#5a7da5', mt: 1, fontSize: '0.95rem' }}>
            This will reset all performance values, timing, technical penalties, and disqualifications.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => setShowClearDialog(false)} variant="outlined" sx={{ color: '#0056b3', borderColor: '#e0e7ef', borderWidth: 1.5, borderRadius: '10px', '&:hover': { backgroundColor: '#f0f6fc', borderColor: '#0056b3' } }}>
            Cancel
          </Button>
          <Button onClick={handleClear} variant="contained" sx={{ background: 'linear-gradient(135deg, #c62828, #e53935)', color: '#ffffff', fontWeight: 700, borderRadius: '10px', boxShadow: '0 4px 12px rgba(198,40,40,0.25)', '&:hover': { boxShadow: '0 6px 16px rgba(198,40,40,0.35)' } }}>
            Clear
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
