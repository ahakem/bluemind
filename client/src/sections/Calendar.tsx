import { Box, Container, Typography, Paper, Grid, Card, CardContent, Button, Chip } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PoolIcon from "@mui/icons-material/Pool";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";

const upcomingEvents = [
  {
    title: "Beginner Freediving Session",
    date: "Monday, May 15, 2023",
    time: "6:00 PM - 8:00 PM",
    location: "Main Pool",
    instructor: "Sarah Johnson",
    type: "beginner",
    spotsLeft: 4
  },
  {
    title: "Dynamic Apnea Training",
    date: "Wednesday, May 17, 2023",
    time: "7:00 PM - 9:00 PM",
    location: "Deep Pool",
    instructor: "Michael Taylor",
    type: "intermediate",
    spotsLeft: 2
  },
  {
    title: "Static Apnea Workshop",
    date: "Friday, May 19, 2023",
    time: "6:30 PM - 8:30 PM",
    location: "Main Pool",
    instructor: "David Chen",
    type: "all-levels",
    spotsLeft: 6
  },
  {
    title: "Advanced Techniques Session",
    date: "Saturday, May 20, 2023",
    time: "10:00 AM - 12:00 PM",
    location: "Deep Pool",
    instructor: "Michael Taylor",
    type: "advanced",
    spotsLeft: 3
  }
];

const Calendar = () => {
  return (
    <Box id="calendar" sx={{ py: 10, bgcolor: "grey.50" }}>
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
            variant="h2"
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
            Join us for our regularly scheduled freediving training sessions. Pre-registration is required as space is limited to ensure quality instruction and safety.
          </Typography>
        </Box>

        {/* Google Calendar Embed */}
        <Box sx={{ mb: 8 }}>
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
              <Typography variant="h5" fontWeight={600}>
                Full Training Calendar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                View and subscribe to our complete schedule
              </Typography>
            </Box>
            
            {/* Google Calendar iframe - in a real implementation, this would be replaced with an actual Google Calendar embed */}
            <Box 
              sx={{ 
                width: "100%", 
                height: "calc(100% - 70px)", 
                border: "1px solid #eee",
                borderRadius: 1,
                p: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
             
              <iframe 
                src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FAmsterdam&showTitle=0&showPrint=0&showTz=0&mode=AGENDA&src=Ymx1ZW1pbmRmcmVlZGl2aW5nQGdtYWlsLmNvbQ&color=%23039BE5" 
                width="100%" 
                height="600" 
                frameBorder="0" 
                scrolling="no"
                title="Blue Mind Freediving Training Calendar - View upcoming freediving sessions and events"
              ></iframe>
              <Button 
                variant="contained" 
                color="primary"
                href="https://calendar.google.com" 
                target="_blank"
                sx={{
                  borderRadius: 50,
                  px: 3,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 500
                }}
              >
                Open Google Calendar
              </Button>
            </Box>
          </Paper>
        </Box>

      </Container>
    </Box>
  );
};

export default Calendar;