import { useState } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  Alert, 
  Snackbar, 
  CircularProgress 
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import TwitterIcon from "@mui/icons-material/Twitter";

// Email form interface
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // In a real implementation, we would call the server endpoint to send the email
      // For now, simulate a successful email send
      
      // For a real SendGrid implementation, we would add a server endpoint:
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // if (!response.ok) throw new Error('Failed to send email');
      
      // Show success message
      setSuccessMessage("Thank you! Your message has been sent successfully.");
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (err) {
      setErrorMessage("Failed to send message. Please try again later.");
      console.error("Contact form error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle message alerts
  const handleCloseAlert = () => {
    setSuccessMessage("");
    setErrorMessage("");
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
                    info@bluemindfreediving.com
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
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
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
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
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
                      value={formData.subject}
                      onChange={handleChange}
                      disabled={loading}
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
                      value={formData.message}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontFamily: "Poppins",
                        fontWeight: 500,
                        textTransform: "none",
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Success and Error Alerts */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: "100%" }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;
