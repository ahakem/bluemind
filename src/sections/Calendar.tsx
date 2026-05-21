'use client';

import { Box, Container, Typography, Paper } from "@mui/material";
import dynamic from "next/dynamic";

const SessionCalendar = dynamic(() => import("@/components/SessionCalendar"), {
  ssr: false,
});

const Calendar = () => {
  return (
    <Box
      component="section"
      id="schedule"
      role="region"
      aria-labelledby="schedule-heading"
      sx={{ py: 10, bgcolor: "grey.50" }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="subtitle1"
            fontFamily="var(--font-montserrat), Helvetica Neue, sans-serif"
            color="primary"
            mb={1}
          >
            Training Schedule
          </Typography>
          <Typography
            id="schedule-heading"
            variant="h2"
            component="h1"
            fontFamily="var(--font-poppins), Helvetica Neue, sans-serif"
            fontWeight={700}
            mb={2}
          >
            Upcoming Sessions
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2, mb: 4 }} />
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: "800px", mx: "auto", mb: 2 }}
          >
            Join us for our regularly scheduled freediving training sessions at Sloterparkbad Amsterdam.
            Pre-registration is required as space is limited to ensure quality instruction and safety.
          </Typography>
        </Box>

        {/* Training Info Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', mb: 6 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 200 }}>
            <Typography variant="h6" color="primary" fontWeight={600}>Location</Typography>
            <Typography variant="body1">Sloterparkbad</Typography>
            <Typography variant="body2" color="text.secondary">Amsterdam</Typography>
          </Paper>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 200 }}>
            <Typography variant="h6" color="primary" fontWeight={600}>Day</Typography>
            <Typography variant="body1">Monday Evening</Typography>
            <Typography variant="body2" color="text.secondary">Weekly Sessions</Typography>
          </Paper>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, textAlign: 'center', minWidth: 200 }}>
            <Typography variant="h6" color="primary" fontWeight={600}>Duration</Typography>
            <Typography variant="body1">1 Hour</Typography>
            <Typography variant="body2" color="text.secondary">Pool Training</Typography>
          </Paper>
        </Box>

        {/* Live Session Calendar */}
        <SessionCalendar />
      </Container>
    </Box>
  );
};

export default Calendar;
