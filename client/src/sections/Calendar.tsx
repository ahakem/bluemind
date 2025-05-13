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
            variant="h3"
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
              <EventIcon sx={{ fontSize: 60, color: "primary.main", mb: 2, opacity: 0.8 }} />
              <Typography variant="h6" align="center" gutterBottom>
                Google Calendar Integration
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center" sx={{ maxWidth: "400px", mb: 3 }}>
                In a live implementation, this would be replaced with an embedded Google Calendar showing all scheduled training sessions.
              </Typography>
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

        {/* Upcoming Events Cards */}
        <Typography
          variant="h4"
          fontFamily="Poppins"
          fontWeight={600}
          align="center"
          mb={4}
        >
          Featured Sessions This Week
        </Typography>

        <Grid container spacing={3}>
          {upcomingEvents.map((event, index) => (
            <Grid key={index} sx={{ width: { xs: '100%', sm: '50%', md: '50%', lg: '25%' }, p: 1.5 }}>
              <Card 
                sx={{ 
                  height: "100%", 
                  borderRadius: 2,
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ 
                  height: 8, 
                  bgcolor: 
                    event.type === "beginner" ? "primary.main" : 
                    event.type === "intermediate" ? "secondary.main" : 
                    event.type === "advanced" ? "error.main" : 
                    "success.main"
                }} />
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                      {event.title}
                    </Typography>
                    <Chip 
                      label={`${event.spotsLeft} spots`} 
                      size="small" 
                      color={event.spotsLeft <= 2 ? "error" : "primary"}
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <EventIcon fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.date}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <AccessTimeIcon fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.time}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                    <LocationOnIcon fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <PersonIcon fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {event.instructor}
                    </Typography>
                  </Box>

                  <Chip 
                    label={
                      event.type === "beginner" ? "Beginner Friendly" : 
                      event.type === "intermediate" ? "Intermediate" : 
                      event.type === "advanced" ? "Advanced" : 
                      "All Levels"
                    } 
                    size="small"
                    sx={{ mr: 1, mb: 2 }}
                    color={
                      event.type === "beginner" ? "primary" : 
                      event.type === "intermediate" ? "secondary" : 
                      event.type === "advanced" ? "error" : 
                      "success"
                    }
                  />

                  <Button 
                    fullWidth 
                    variant="outlined" 
                    color="primary"
                    endIcon={<PoolIcon />}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      mt: 1
                    }}
                  >
                    Register
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="body1" mb={3}>
            Want to see the full schedule and register for sessions?
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            href="#contact"
            sx={{
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              fontFamily: "Poppins",
              textTransform: "none",
            }}
          >
            Become a Member
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Calendar;