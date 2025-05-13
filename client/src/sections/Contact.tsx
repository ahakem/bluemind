import { Box, Container, Typography, Grid, Paper, TextField, Button } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";

const Contact = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form handling would go here in a real implementation
  };

  return (
    <Box id="contact" sx={{ py: 10, bgcolor: "white" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="subtitle1"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Get In Touch
          </Typography>
          <Typography
            variant="h3"
            fontFamily="Poppins"
            fontWeight={700}
          >
            Contact Us
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
        </Box>

        <Grid container spacing={6}>
          <Grid item xs={12} lg={6}>
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h4"
                fontFamily="Poppins"
                fontWeight={600}
                mb={2}
              >
                Ready to Start Your Freediving Journey?
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                mb={4}
              >
                Contact us for more information about our training programs, schedule a visit, or register for your first class. Our team is ready to answer any questions you might have.
              </Typography>

              <Box sx={{ display: "flex", mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    opacity: 0.1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                    flexShrink: 0,
                  }}
                >
                  <LocationOnIcon color="primary" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={500} mb={0.5}>
                    Our Location
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    123 Aquatic Drive, Oceanview, CA 92051
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    opacity: 0.1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                    flexShrink: 0,
                  }}
                >
                  <EmailIcon color="primary" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={500} mb={0.5}>
                    Email Us
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    info@deepbluefreediving.com
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", mb: 5 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    bgcolor: "primary.light",
                    opacity: 0.1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2,
                    flexShrink: 0,
                  }}
                >
                  <PhoneIcon color="primary" />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={500} mb={0.5}>
                    Call Us
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    (555) 123-4567
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", gap: 2 }}>
                {[
                  { icon: <FacebookIcon />, label: "Facebook" },
                  { icon: <InstagramIcon />, label: "Instagram" },
                  { icon: <YouTubeIcon />, label: "YouTube" },
                  { icon: <TwitterIcon />, label: "Twitter" },
                ].map((social, index) => (
                  <Box
                    key={index}
                    component="a"
                    href="#"
                    aria-label={social.label}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: "rgba(3, 84, 151, 0.1)",
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "white",
                      },
                    }}
                  >
                    {social.icon}
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper
              elevation={3}
              sx={{
                p: 4,
                borderRadius: 2,
                bgcolor: "grey.50",
              }}
            >
              <Typography
                variant="h4"
                fontFamily="Poppins"
                fontWeight={600}
                mb={4}
              >
                Send Us a Message
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="name"
                      name="name"
                      label="Full Name"
                      variant="outlined"
                      placeholder="Your Name"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      name="email"
                      label="Email Address"
                      type="email"
                      variant="outlined"
                      placeholder="your.email@example.com"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="subject"
                      name="subject"
                      label="Subject"
                      variant="outlined"
                      placeholder="How can we help?"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="message"
                      name="message"
                      label="Message"
                      multiline
                      rows={5}
                      variant="outlined"
                      placeholder="Your message here..."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        textTransform: "none",
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;
