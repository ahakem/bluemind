'use client';

import { Box, Container, Typography, Paper, Button } from "@mui/material";

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
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Training Schedule
          </Typography>
          <Typography
            id="schedule-heading"
            variant="h2"
            component="h1"
            fontFamily="Poppins"
            fontWeight={700}
            mb={2}
          >
            Upcoming Sessions
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2, mb: 4 }} />
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: "800px", 
              mx: "auto",
              mb: 2
            }}
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

        {/* Google Calendar Embed */}
        <Paper
          elevation={3}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            bgcolor: "white",
            height: { xs: "400px", md: "600px" },
            overflow: "hidden"
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="h5" component="h3" fontWeight={600}>
              Full Training Calendar
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and subscribe to our complete schedule
            </Typography>
          </Box>
          
          <Box 
            sx={{ 
              width: "100%", 
              height: "calc(100% - 70px)", 
              border: "1px solid #eee",
              borderRadius: 1,
              overflow: 'hidden',
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start"
            }}
          >
            <iframe 
              src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FAmsterdam&showTitle=0&showPrint=0&showTz=0&mode=AGENDA&src=Ymx1ZW1pbmRmcmVlZGl2aW5nQGdtYWlsLmNvbQ&color=%23039BE5" 
              width="100%" 
              height="100%"
              frameBorder={0} 
              scrolling="no"
              title="Blue Mind Freediving Training Calendar - View upcoming freediving sessions and events in Amsterdam"
              loading="lazy"
            />
          </Box>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              href="https://calendar.google.com/calendar/u/0?cid=Ymx1ZW1pbmRmcmVlZGl2aW5nQGdtYWlsLmNvbQ" 
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to Blue Mind Freediving calendar"
              sx={{
                borderRadius: 50,
                px: 3,
                py: 1,
                textTransform: "none",
                fontWeight: 500
              }}
            >
              Subscribe to Calendar
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Calendar;
