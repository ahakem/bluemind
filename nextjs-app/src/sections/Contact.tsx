'use client';

import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EmailIcon from "@mui/icons-material/Email";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useState } from "react";
import Image from "next/image";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      // Simulate form submission - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage("Thank you! Your message has been sent successfully. We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setErrorMessage("Failed to send message. Please try again or email us directly.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseAlert = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  return (
    <Box 
      component="section"
      id="contact" 
      role="region"
      aria-labelledby="contact-heading"
      sx={{
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
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{
          textAlign: "center",
          mb: 6,
          position: "relative",
          zIndex: 1
        }}>
          <Typography
            variant="subtitle1"
            component="p"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Reach Out To Us
          </Typography>
          <Typography
            id="contact-heading"
            variant="h2"
            component="h1"
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
            We are here to help you start your underwater journey.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
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
              flex: { xs: "1 1 auto", md: "0 0 40%" },
              p: 4,
              backgroundColor: "primary.main",
              color: "white",
              display: "flex",
              flexDirection: "column"
            }}
          >
            <Typography
              variant="h4"
              component="h3"
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
              Connect with our Amsterdam freediving community. We are ready to answer your questions and welcome you to our pool training sessions.
            </Typography>

            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <Box>
                <Box sx={{ display: "flex", mb: 3, alignItems: "flex-start" }}>
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
                      TRAINING LOCATION
                    </Typography>
                    <Typography variant="body1" fontWeight={500} color="white">
                      Optisport Sloterparkbad
                    </Typography>
                    <Typography variant="body2" color="white" sx={{ opacity: 0.85 }}>
                      President Allendelaan 3, 1064 GW Amsterdam
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", mb: 3, alignItems: "flex-start" }}>
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
                    <Typography 
                      variant="body1" 
                      fontWeight={500} 
                      color="white"
                      component="a"
                      href="mailto:info@bluemindfreediving.nl"
                      sx={{ textDecoration: 'none', color: 'white', '&:hover': { textDecoration: 'underline' } }}
                    >
                      info@bluemindfreediving.nl
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ mt: 4 }}>
                <Typography variant="body2" color="white" sx={{ opacity: 0.7, mb: 2 }}>
                  FOLLOW US
                </Typography>
                <Box
                  component="a"
                  href="https://www.instagram.com/bluemind.freediving/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow Blue Mind Freediving on Instagram"
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    display: "inline-flex",
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
              flex: { xs: "1 1 auto", md: "0 0 60%" },
              p: 4,
            }}
          >
            <Typography
              variant="h5"
              component="h3"
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
                rows={5}
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
                  borderRadius: '50px',
                  fontFamily: "Poppins",
                  fontWeight: 500,
                  textTransform: "none",
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Send Message"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Map */}
        <Box sx={{ mt: 6, borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2436.5!2d4.8243!3d52.3676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c5e22d8dc5c4b7%3A0x8b7b7b7b7b7b7b7b!2sSloterparkbad!5e0!3m2!1sen!2snl!4v1234567890"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Blue Mind Freediving training location - Sloterparkbad Amsterdam"
          />
        </Box>
      </Container>

      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={handleCloseAlert} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleCloseAlert} severity="success" sx={{ width: "100%" }}>{successMessage}</Alert>
      </Snackbar>

      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={handleCloseAlert} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleCloseAlert} severity="error" sx={{ width: "100%" }}>{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Contact;
