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
      // Send email using our API endpoint
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email');
      }
      
      // Show success message
      setSuccessMessage("Thank you! Your message has been sent successfully.");
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to send message. Please try again later.");
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
    <Box id="contact" sx={{ 
      py: 10, 
      background: "linear-gradient(135deg, #f3f7ff 0%, #e6f0ff 100%)",
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "50%",
        background: "radial-gradient(circle at top right, rgba(65, 145, 255, 0.05) 0%, rgba(65, 145, 255, 0) 70%)",
      }
    }}>
      <Container maxWidth="lg">
        <Box sx={{ 
          textAlign: "center", 
          mb: 6,
          position: "relative", 
          zIndex: 1
        }}>
          <Typography
            variant="subtitle1"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Reach Out To Us
          </Typography>
          <Typography
            variant="h3"
            fontFamily="Poppins"
            fontWeight={700}
            mb={1}
          >
            Contact Us
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2, mb: 2 }} />
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              maxWidth: 600, 
              mx: "auto", 
              mt: 2,
              mb: 2,
              px: 2
            }}
          >
            Have questions about our freediving programs? Want to join our next session? 
            We're here to help you start your underwater journey.
          </Typography>
        </Box>

        <Box 
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "stretch",
            backgroundColor: "white",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            position: "relative",
            zIndex: 2
          }}
        >
          {/* Contact Information */}
          <Box 
            sx={{ 
              flex: { xs: "1 1 auto", md: "0 0 35%" },
              p: 4,
              backgroundColor: "primary.main",
              color: "white",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Typography
              variant="h4"
              fontFamily="Poppins"
              fontWeight={600}
              mb={3}
              color="white"
            >
              Get In Touch
            </Typography>
            
            <Typography
              variant="body1"
              mb={4}
              sx={{ opacity: 0.85 }}
            >
              Connect with our Amsterdam freediving community. We're ready to answer your questions and welcome you to our pool training sessions.
            </Typography>

            {/* Contact Information Items */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Box>
                <Box sx={{ display: "flex", mb: 3, alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      flexShrink: 0,
                    }}
                  >
                    <LocationOnIcon sx={{ color: "white", fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.7 }}>
                      OUR LOCATION
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color="white">
                      Sportplaza Mercator, Amsterdam, NL
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", mb: 3, alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      flexShrink: 0,
                    }}
                  >
                    <EmailIcon sx={{ color: "white", fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.7 }}>
                      EMAIL ADDRESS
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color="white">
                      info@bluemindfreediving.com
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      flexShrink: 0,
                    }}
                  >
                    <PhoneIcon sx={{ color: "white", fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.7 }}>
                      PHONE
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color="white">
                      +31 20 123 4567
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              {/* Social Media - Instagram only */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" color="white" sx={{ opacity: 0.7, mb: 2 }}>
                  FOLLOW US
                </Typography>
                <Box 
                  component="a"
                  href="#"
                  aria-label="Instagram"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                      transform: "translateY(-3px)"
                    },
                  }}
                >
                  <InstagramIcon sx={{ fontSize: 20 }} />
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Contact Form */}
          <Box 
            sx={{ 
              flex: { xs: "1 1 auto", md: "0 0 65%" },
              p: 4,
              backgroundColor: "white"
            }}
          >
            <Typography
              variant="h4"
              fontFamily="Poppins"
              fontWeight={600}
              mb={3}
            >
              Send Us a Message
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 2 }}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  name="name"
                  label="Your Name"
                  variant="outlined"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ flex: 1 }}
                />
                <TextField
                  required
                  fullWidth
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  variant="outlined"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  sx={{ flex: 1 }}
                />
              </Box>
              
              <TextField
                required
                fullWidth
                id="subject"
                name="subject"
                label="Subject"
                variant="outlined"
                value={formData.subject}
                onChange={handleChange}
                disabled={loading}
                sx={{ mb: 2 }}
              />
              
              <TextField
                required
                fullWidth
                id="message"
                name="message"
                label="Your Message"
                multiline
                rows={6}
                variant="outlined"
                value={formData.message}
                onChange={handleChange}
                disabled={loading}
                sx={{ mb: 3 }}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: 2,
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  textTransform: "none",
                  boxShadow: 2
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Send Message"
                )}
              </Button>
            </Box>
          </Box>
        </Box>
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
