'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Skeleton,
  Button,
  Tooltip,
} from '@mui/material';
import { Pool, LocationOn, AccessTime, People, CalendarMonth } from '@mui/icons-material';
import { getUpcomingSessions, type BookingSession } from '@/lib/bookingService';

type SerializedSession = Omit<BookingSession, 'date'> & { date: string };

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const spotsLeft = (s: BookingSession) => Math.max(0, s.capacity - s.currentAttendance);

const spotsColor = (spots: number, capacity: number): 'success' | 'warning' | 'error' => {
  const ratio = spots / capacity;
  if (ratio > 0.4) return 'success';
  if (ratio > 0) return 'warning';
  return 'error';
};

const buildGoogleCalendarUrl = (session: BookingSession): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const d = session.date;
  const dateStr = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const [startH, startM] = session.startTime.split(':').map(Number);
  const [endH, endM] = session.endTime.split(':').map(Number);
  const start = `${dateStr}T${pad(startH)}${pad(startM)}00`;
  const end = `${dateStr}T${pad(endH)}${pad(endM)}00`;
  const title = encodeURIComponent(`Freediving Session — ${session.locationName}`);
  const details = encodeURIComponent(session.description || 'Blue Mind Freediving training session');
  const location = encodeURIComponent(session.locationName);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}&ctz=Europe/Amsterdam`;
};

const SessionCard = ({ session }: { session: BookingSession }) => {
  const spots = spotsLeft(session);
  const color = spotsColor(spots, session.capacity);
  const d = session.date;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2.5,
        borderRadius: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 4 },
      }}
    >
      {/* Date header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {WEEKDAYS[d.getDay()]}
          </Typography>
          <Typography variant="h5" fontWeight={700} lineHeight={1} color="primary">
            {d.getDate()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {MONTHS[d.getMonth()]} {d.getFullYear()}
          </Typography>
        </Box>
        <Chip
          size="small"
          color={color}
          label={spots === 0 ? 'Full' : `${spots} spot${spots === 1 ? '' : 's'} left`}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {/* Time + location */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <AccessTime sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {session.startTime} – {session.endTime}
          </Typography>
        </Box>
        {session.locationName && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LocationOn sx={{ fontSize: 15, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {session.locationName}
            </Typography>
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <People sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography variant="body2" color="text.secondary">
            {session.currentAttendance} / {session.capacity} registered
          </Typography>
        </Box>
      </Box>

      {/* Add to calendar */}
      <Tooltip title="Add to Google Calendar" placement="top">
        <span>
          <Button
            size="small"
            variant="outlined"
            startIcon={<CalendarMonth fontSize="small" />}
            href={buildGoogleCalendarUrl(session)}
            target="_blank"
            rel="noopener noreferrer"
            disabled={spots === 0}
            fullWidth
            sx={{ mt: 'auto', borderRadius: 50, textTransform: 'none', fontSize: '0.78rem' }}
          >
            Add to Calendar
          </Button>
        </span>
      </Tooltip>
    </Paper>
  );
};

const SessionCardSkeleton = () => (
  <Paper elevation={1} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
    <Skeleton variant="text" width="40%" height={20} sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width="20%" height={36} sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width="30%" height={18} sx={{ mb: 1.5 }} />
    <Skeleton variant="text" width="60%" height={18} sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width="70%" height={18} sx={{ mb: 0.5 }} />
    <Skeleton variant="text" width="50%" height={18} sx={{ mb: 1.5 }} />
    <Skeleton variant="rounded" height={32} />
  </Paper>
);

// Returns unique "YYYY-MM" keys present in the sessions list, in order
const monthKeys = (sessions: BookingSession[]): string[] => {
  const seen = new Set<string>();
  sessions.forEach((s) => {
    const key = `${s.date.getFullYear()}-${String(s.date.getMonth() + 1).padStart(2, '0')}`;
    seen.add(key);
  });
  return Array.from(seen);
};

const monthLabel = (key: string): string => {
  const [year, month] = key.split('-');
  return `${MONTHS[parseInt(month, 10) - 1]} ${year}`;
};

export default function SessionCalendar({ initialSessions }: { initialSessions?: SerializedSession[] }) {
  const [sessions, setSessions] = useState<BookingSession[]>(() =>
    initialSessions ? initialSessions.map((s) => ({ ...s, date: new Date(s.date) })) : []
  );
  const [loading, setLoading] = useState(!initialSessions);
  const [activeMonth, setActiveMonth] = useState<string | null>(() => {
    if (!initialSessions || initialSessions.length === 0) return null;
    const d = new Date(initialSessions[0].date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    if (initialSessions) return; // skip fetch — data came from server
    getUpcomingSessions().then((data) => {
      setSessions(data);
      if (data.length > 0) {
        const firstKey = `${data[0].date.getFullYear()}-${String(data[0].date.getMonth() + 1).padStart(2, '0')}`;
        setActiveMonth(firstKey);
      }
      setLoading(false);
    });
  }, []);

  const months = monthKeys(sessions);
  const filtered = activeMonth
    ? sessions.filter((s) => {
        const key = `${s.date.getFullYear()}-${String(s.date.getMonth() + 1).padStart(2, '0')}`;
        return key === activeMonth;
      })
    : sessions;

  return (
    <Box>
      {/* Month filter chips */}
      {!loading && months.length > 1 && (
        <Box
          sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}
          role="group"
          aria-label="Filter sessions by month"
        >
          {months.map((key) => (
            <Chip
              key={key}
              label={monthLabel(key)}
              onClick={() => setActiveMonth(key)}
              color={activeMonth === key ? 'primary' : 'default'}
              variant={activeMonth === key ? 'filled' : 'outlined'}
              aria-pressed={activeMonth === key}
              sx={{ fontWeight: activeMonth === key ? 700 : 400, cursor: 'pointer' }}
            />
          ))}
        </Box>
      )}

      {loading ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </Box>
      ) : sessions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Pool sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="h6" color="text.secondary">
            No upcoming sessions scheduled
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mt: 0.5 }}>
            Check back soon for new dates
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            gap: 2.5,
          }}
        >
          {filtered.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </Box>
      )}
    </Box>
  );
}
