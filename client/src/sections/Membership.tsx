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
  ListItemText
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import DownloadIcon from "@mui/icons-material/Download";
import DocumentScannerIcon from "@mui/icons-material/DocumentScanner";
import EmailIcon from "@mui/icons-material/Email";

// Import document paths
import membershipFormDoc from "../assets/documents/membership-form.txt";
import membershipInfoDoc from "../assets/documents/membership-info.txt";

// Membership plans
const membershipPlans = [
  {
    title: "Monthly",
    price: "$85",
    period: "per month",
    features: [
      "4 training sessions per month",
      "Month-to-month commitment",
      "10% discount on additional sessions",
      "Equipment rental during sessions"
    ],
    popular: false,
    color: "primary"
  },
  {
    title: "Annual",
    price: "$850",
    period: "per year",
    features: [
      "4 training sessions per month",
      "15% discount on additional sessions",
      "Free attendance at 2 workshops per year",
      "Priority event registration",
      "Full access to club resources"
    ],
    popular: true,
    color: "secondary"
  },
  {
    title: "Student",
    price: "$65",
    period: "per month",
    features: [
      "4 training sessions per month",
      "Valid student ID required",
      "5% discount on additional sessions",
      "Equipment rental during sessions"
    ],
    popular: false,
    color: "primary"
  }
];

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
    <Box id="membership" sx={{ py: 10, bgcolor: "white" }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="subtitle1"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Join Our Community
          </Typography>
          <Typography
            variant="h3"
            fontFamily="Poppins"
            fontWeight={700}
          >
            Membership Options
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
        </Box>

        {/* Membership Plans */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {membershipPlans.map((plan, index) => (
            <Grid key={index} sx={{ width: { xs: '100%', sm: '100%', md: '33.333%' }, p: 1.5 }}>
              <Card 
                raised={plan.popular}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  overflow: "hidden",
                  position: "relative",
                  border: plan.popular ? `2px solid` : "none",
                  borderColor: plan.popular ? "secondary.main" : "transparent",
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-10px)",
                  }
                }}
              >
                {plan.popular && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 20,
                      right: -35,
                      transform: "rotate(45deg)",
                      bgcolor: "secondary.main",
                      color: "white",
                      py: 0.5,
                      px: 4,
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      zIndex: 1,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Popular
                  </Box>
                )}
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography variant="h5" component="h3" fontWeight={600} gutterBottom>
                    {plan.title}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "baseline", mb: 2 }}>
                    <Typography variant="h3" component="span" fontWeight={700} color={`${plan.color}.main`}>
                      {plan.price}
                    </Typography>
                    <Typography variant="subtitle1" component="span" color="text.secondary" ml={1}>
                      {plan.period}
                    </Typography>
                  </Box>
                  <List sx={{ mb: 2 }}>
                    {plan.features.map((feature, idx) => (
                      <ListItem key={idx} disableGutters sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckIcon fontSize="small" sx={{ color: `${plan.color}.main` }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature} 
                          sx={{ 
                            m: 0,
                            "& .MuiListItemText-primary": {
                              fontSize: "0.875rem",
                            }
                          }} 
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
                <CardActions sx={{ p: 3, pt: 0 }}>
                  <Button 
                    fullWidth 
                    variant={plan.popular ? "contained" : "outlined"} 
                    color={plan.color === "primary" ? "primary" : "secondary"}
                    href="#contact"
                    sx={{ 
                      borderRadius: 2,
                      py: 1,
                      textTransform: "none",
                      fontWeight: 600
                    }}
                  >
                    Get Started
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* How to Join Section */}
        <Box sx={{ mb: 6 }}>
          <Typography
            variant="h4"
            fontFamily="Poppins"
            fontWeight={600}
            align="center"
            mb={4}
          >
            How to Become a Member
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                    <Box 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: "50%", 
                        bgcolor: "primary.light", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        mb: 2
                      }}
                    >
                      <DocumentScannerIcon sx={{ fontSize: 40, color: "primary.main" }} />
                    </Box>
                    <Typography variant="h5" fontWeight={600} align="center">
                      Step 1: Download & Complete Forms
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" paragraph align="center">
                    Download our membership forms below. Complete them and bring them to your first session or email them to us.
                  </Typography>
                  
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "center", gap: 2, mt: 3 }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadDocument(membershipFormDoc, 'blue-mind-membership-form.txt')}
                    >
                      Membership Form
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadDocument(membershipInfoDoc, 'blue-mind-membership-info.txt')}
                    >
                      Membership Info
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: "100%", borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
                    <Box 
                      sx={{ 
                        width: 80, 
                        height: 80, 
                        borderRadius: "50%", 
                        bgcolor: "secondary.light", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center",
                        mb: 2
                      }}
                    >
                      <EmailIcon sx={{ fontSize: 40, color: "secondary.main" }} />
                    </Box>
                    <Typography variant="h5" fontWeight={600} align="center">
                      Step 2: Submit Your Application
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" paragraph align="center">
                    Email your completed forms to <strong>membership@bluemindfreediving.com</strong> or use our contact form below to submit your information and we'll get back to you.
                  </Typography>
                  
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Button
                      variant="contained"
                      color="secondary"
                      href="#contact"
                      sx={{ 
                        borderRadius: 50,
                        px: 4,
                        py: 1.5,
                        textTransform: "none",
                        fontWeight: 600
                      }}
                    >
                      Contact Us
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
        
        {/* FAQ or Additional Info */}
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="body1" color="text.secondary">
            Have questions about our membership options? Check out our <a href="#faq" style={{ color: 'inherit', fontWeight: 'bold' }}>FAQ section</a> or contact us directly.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Membership;