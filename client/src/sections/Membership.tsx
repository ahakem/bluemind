import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Paper
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DownloadIcon from "@mui/icons-material/Download";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import EmailIcon from "@mui/icons-material/Email";
import PoolIcon from "@mui/icons-material/Pool";

// Import document paths
import membershipFormDoc from "../assets/documents/membership-form.txt";
import membershipInfoDoc from "../assets/documents/membership-info.txt";

// No membership plans needed now

const Membership = () => {
  // Function to download a text file
  const downloadDocument = (documentPath: string, filename: string) => {
    fetch(documentPath)
      .then(response => response.text())
      .then(text => {
        const element = document.createElement('a');
        const file = new Blob([text], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      });
  };

  return (
    <Box id="membership" sx={{ 
      py: 10, 
      backgroundColor: "#f5f9ff",
      backgroundImage: "linear-gradient(rgba(13, 71, 161, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(13, 71, 161, 0.03) 1px, transparent 1px)",
      backgroundSize: "20px 20px"
    }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: 5 }}>
          <Typography
            variant="subtitle1"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Join Our Club
          </Typography>
          <Typography
            variant="h3"
            fontFamily="Poppins"
            fontWeight={700}
            mb={1}
          >
            How to Become a Member
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
            Joining Blue Mind Freediving is easy! Download our membership documents, complete them, and submit your application. Our team will contact you to finalize your membership.
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

          {/* Step 1 - Download Documents */}
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
              <DocumentScannerIcon sx={{ fontSize: 40, color: "primary.main" }} />
            </Box>
            
            <Typography 
              variant="h5" 
              fontWeight={600} 
              align="center"
              sx={{ mb: 2 }}
            >
              1. Download Forms
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
                Our membership documents contain all the information you need to get started with Blue Mind Freediving.
              </Typography>
              
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadDocument(membershipFormDoc, 'blue-mind-membership-form.txt')}
                  sx={{ 
                    borderRadius: 1,
                    py: 1.2,
                    fontWeight: 500
                  }}
                >
                  Membership Form
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<DownloadIcon />}
                  onClick={() => downloadDocument(membershipInfoDoc, 'blue-mind-membership-info.txt')}
                  sx={{ 
                    borderRadius: 1,
                    py: 1.2,
                    fontWeight: 500
                  }}
                >
                  Membership Info
                </Button>
              </Box>
            </Paper>
          </Box>

          {/* Step 2 - Submit Application */}
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
              fontWeight={600} 
              align="center"
              sx={{ mb: 2 }}
            >
              2. Submit Your Application
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
                Email your completed form to <strong>info@bluemindfreediving.com</strong> or submit through our contact form.
              </Typography>
              
              <Button
                variant="contained"
                color="secondary"
                href="#contact"
                sx={{ 
                  borderRadius: 1,
                  py: 1.2,
                  fontWeight: 500,
                  mt: "auto"
                }}
              >
                Contact Us
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
                We'll guide you through your first sessions and help you feel comfortable in our training environment.
              </Typography>
              
              <Button
                variant="outlined"
                color="primary"
                href="#calendar"
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
          <Typography variant="h4" color="white" fontWeight={600} mb={2}>
            Ready to Begin Your Freediving Journey?
          </Typography>
          <Typography variant="body1" color="white" mb={3} sx={{ opacity: 0.9 }}>
            Join our Amsterdam community and discover the transformative power of freediving.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href="#contact"
            sx={{ 
              borderRadius: "50px",
              px: 5,
              py: 1.5,
              fontWeight: 600,
              textTransform: "none"
            }}
          >
            Join Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Membership;