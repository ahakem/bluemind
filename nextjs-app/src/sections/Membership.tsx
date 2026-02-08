'use client';

import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EmailIcon from "@mui/icons-material/Email";
import PoolIcon from "@mui/icons-material/Pool";
import Link from "next/link";

const Membership = () => {
  return (
    <Box 
      component="section"
      id="membership" 
      role="region"
      aria-labelledby="membership-heading"
      sx={{ 
        py: 10, 
        backgroundColor: "#f5f9ff",
        backgroundImage: "linear-gradient(rgba(13, 71, 161, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(13, 71, 161, 0.03) 1px, transparent 1px)",
        backgroundSize: "20px 20px"
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box component="header" sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="subtitle1"
            component="p"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Join Our Club
          </Typography>
          <Typography
            id="membership-heading"
            variant="h2"
            component="h1"
            fontFamily="Poppins"
            fontWeight={700}
            mb={1}
          >
            Become a Member
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2, mb: 3 }} />
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              maxWidth: "700px", 
              mx: "auto",
              mb: 4
            }}
          >
            Joining Blue Mind Freediving is easy! Register online and start your freediving journey with our Amsterdam community.
          </Typography>
        </Box>

        {/* Membership Process - Timeline Style */}
        <Box 
          sx={{ 
            display: "flex", 
            flexDirection: { xs: "column", md: "row" },
            alignItems: "stretch",
            justifyContent: "center",
            gap: { xs: 0, md: 4 },
            position: "relative",
            maxWidth: "1000px",
            mx: "auto",
            mb: 6
          }}
        >
          {/* Timeline connector (visible on desktop) */}
          <Box 
            sx={{ 
              position: "absolute", 
              top: "50%",
              left: { xs: "50%", md: "calc(33% + 16px)" },
              right: { xs: "auto", md: "calc(33% + 16px)" },
              height: { xs: "calc(100% - 160px)", md: "2px" },
              width: { xs: "2px", md: "calc(33% - 32px)" },
              transform: { xs: "translateX(-50%)", md: "translateY(-50%)" },
              bgcolor: "primary.light",
              opacity: 0.5,
              display: { xs: "none", md: "block" }
            }}
          />

          {/* Step 1 - Register Online */}
          <Box 
            sx={{ 
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              p: 3,
              zIndex: 1
            }}
          >
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: "50%", 
                bgcolor: "white", 
                boxShadow: 3,
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                mb: 2,
                border: "2px solid",
                borderColor: "primary.main"
              }}
            >
              <PersonAddIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </Box>
            
            <Typography 
              variant="h5" 
              component="h3"
              fontWeight={600} 
              align="center"
              sx={{ mb: 2 }}
            >
              1. Register Online
            </Typography>
            
            <Paper
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "white",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <Typography 
                variant="body1" 
                color="text.secondary" 
                paragraph 
                align="center"
                sx={{ mb: 3 }}
              >
                Complete our simple online registration form to get started with Blue Mind Freediving.
              </Typography>
              
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://app.bluemindfreediving.nl/#/register"
                  startIcon={<PersonAddIcon />}
                  aria-label="Register online for Blue Mind Freediving membership"
                  sx={{ 
                    borderRadius: 1,
                    py: 1.2,
                    fontWeight: 500
                  }}
                >
                  Register Now
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Step 2 - Get Confirmed */}
          <Box 
            sx={{ 
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              p: 3,
              zIndex: 1
            }}
          >
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: "50%", 
                bgcolor: "white", 
                boxShadow: 3,
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                mb: 2,
                border: "2px solid",
                borderColor: "secondary.main"
              }}
            >
              <EmailIcon sx={{ fontSize: 40, color: "secondary.main" }} />
            </Box>
            
            <Typography 
              variant="h5" 
              component="h3"
              fontWeight={600} 
              align="center"
              sx={{ mb: 2 }}
            >
              2. Get Confirmed
            </Typography>
            
            <Paper
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "white",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <Typography 
                variant="body1" 
                color="text.secondary" 
                paragraph 
                align="center"
                sx={{ mb: 3 }}
              >
                Our team will review your registration and send you a confirmation email with next steps.
              </Typography>
              
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                href="/contact"
                sx={{ 
                  borderRadius: 1,
                  py: 1.2,
                  fontWeight: 500,
                  mt: "auto"
                }}
              >
                Questions? Contact Us
              </Button>
            </Paper>
          </Box>

          {/* Step 3 - Start Training */}
          <Box 
            sx={{ 
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
              p: 3,
              zIndex: 1
            }}
          >
            <Box 
              sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: "50%", 
                bgcolor: "white", 
                boxShadow: 3,
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                mb: 2,
                border: "2px solid",
                borderColor: "accent.main"
              }}
            >
              <PoolIcon sx={{ fontSize: 40, color: "accent.main" }} />
            </Box>
            
            <Typography 
              variant="h5" 
              component="h3"
              fontWeight={600} 
              align="center"
              sx={{ mb: 2 }}
            >
              3. Start Training
            </Typography>
            
            <Paper
              elevation={1}
              sx={{
                p: 3,
                borderRadius: 2,
                bgcolor: "white",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between"
              }}
            >
              <Typography 
                variant="body1" 
                color="text.secondary" 
                paragraph 
                align="center"
                sx={{ mb: 3 }}
              >
                We&apos;ll guide you through your first sessions and help you feel comfortable in our training environment.
              </Typography>
              
              <Button
                variant="outlined"
                color="primary"
                component={Link}
                href="/schedule"
                sx={{ 
                  borderRadius: 1,
                  py: 1.2,
                  fontWeight: 500,
                  mt: "auto"
                }}
              >
                View Schedule
              </Button>
            </Paper>
          </Box>
        </Box>

        {/* CTA */}
        <Box 
          sx={{ 
            bgcolor: "primary.main", 
            p: 4, 
            borderRadius: 4,
            boxShadow: 3, 
            textAlign: "center",
            mt: 8,
            maxWidth: "800px",
            mx: "auto"
          }}
        >
          <Typography variant="h4" component="h3" color="white" fontWeight={600} mb={2}>
            Ready to Begin Your Freediving Journey?
          </Typography>
          <Typography variant="body1" color="white" mb={3} sx={{ opacity: 0.9 }}>
            Join our Amsterdam community and discover the transformative power of freediving.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            component={Link}
            href="/contact"
            sx={{ 
              borderRadius: "50px",
              px: 5,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none"
            }}
          >
            Get Started Today
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Membership;
