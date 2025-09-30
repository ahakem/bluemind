import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button, Chip, Paper } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { services } from "../data";

// Why Choose Us reasons with extended descriptions
const reasonsData = [
  {
    title: "Experienced Instructors",
    description: "Learn from certified freediving professionals with years of training experience in both pool and open water environments."
  },
  {
    title: "Safety First Approach",
    description: "Our priority is your safety with proper supervision, buddy systems, and strict adherence to international freediving standards."
  },
  {
    title: "Personalized Coaching",
    description: "Receive individual feedback and technique adjustments in small groups to improve your skills more effectively."
  },
  {
    title: "Mental Training",
    description: "Develop advanced relaxation and focus techniques essential for extending breath-hold times and reducing anxiety."
  },
  {
    title: "Progressive Methods",
    description: "Follow our structured training methodology designed to build skills incrementally at your own pace."
  },
  {
    title: "Supportive Community",
    description: "Join Amsterdam's dedicated freediving community where members support each other's growth and celebrate achievements."
  },
];

const Services = () => {
  return (
    <Box 
      component="section" 
      id="services" 
      role="main"
      aria-labelledby="services-heading"
      sx={{ py: 10, bgcolor: "white" }}
    >
      <Container maxWidth="lg">
        <Box component="header" sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="subtitle1"
            component="p"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            What We Offer
          </Typography>
          <Typography
            id="services-heading"
            variant="h3"
            component="h2"
            fontFamily="Poppins"
            fontWeight={700}
          >
            Pool Training Programs
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ 
              maxWidth: 750, 
              mx: "auto", 
              mt: 3,
              px: 2
            }}
          >
            Our training programs focus on developing freediving skills in a controlled pool environment,
            with an emphasis on technique, safety, and mental preparation.
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {services.map((service, index) => (
            <Grid key={index} sx={{ width: { xs: '100%', sm: '50%', md: '33.333%', lg: '25%' }, p: 1.5 }}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  maxWidth: "100%",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 4,
                    "& .MuiCardMedia-root": {
                      transform: "scale(1.05)",
                    },
                  },
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={service.image}
                    alt={service.title}
                    loading="lazy"
                    sx={{
                      transition: "transform 0.5s ease",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: "50%",
                      background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                    }}
                  />
                  <Chip
                    label={service.level}
                    color={
                      service.level === "Beginner Friendly" ? "primary" : 
                      service.level === "Intermediate" ? "secondary" : "error"
                    }
                    size="small"
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      left: 12,
                      fontWeight: 500,
                      fontSize: "0.7rem",
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: { xs: 2, md: 2.5 } }}>
                  <Typography
                    variant="h6"
                    component="h3"
                    fontFamily="Poppins"
                    fontWeight={600}
                    mb={1}
                    fontSize={{ xs: "1rem", md: "1.1rem" }}
                  >
                    {service.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={2}
                    sx={{ 
                      flexGrow: 1,
                      fontSize: "0.875rem",
                      display: "-webkit-box",
                      overflow: "hidden",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: 3
                    }}
                  >
                    {service.description}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color="primary"
                      fontSize="0.75rem"
                    >
                      {service.duration}
                    </Typography>
                    <Button
                      onClick={() => {
                        const element = document.querySelector("#contact");
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      color="error"
                      size="small"
                      sx={{
                        fontWeight: 500,
                        textTransform: "none",
                        fontSize: "0.75rem",
                        p: 0,
                        minWidth: 0,
                        "&:hover": { bgcolor: "transparent" },
                      }}
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                    >
                      Learn More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Why Choose Us section - Redesigned */}
        <Box 
          sx={{ 
            mt: 12,
            mb: 6,
            position: "relative",
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            background: "linear-gradient(135deg, #f0f7ff 0%, #e6f0ff 100%)",
            p: { xs: 4, md: 6 },
          }}
        >
          {/* Background pattern */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.04,
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230057B8' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Box sx={{ textAlign: "center", mb: 6 }}>
              <Typography
                variant="subtitle1"
                fontFamily="Montserrat"
                color="primary"
                mb={1}
              >
                Freediving Excellence
              </Typography>
              <Typography
                variant="h3"
                fontFamily="Poppins"
                fontWeight={700}
                mb={2}
              >
                Why Choose Us
              </Typography>
              <Box 
                sx={{ 
                  width: 80, 
                  height: 3, 
                  background: "linear-gradient(90deg, #035497 0%, #4191FF 100%)", 
                  mx: "auto", 
                  mb: 3 
                }} 
              />
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  maxWidth: 700, 
                  mx: "auto", 
                  mb: 4,
                  px: 2
                }}
              >
                Blue Mind Freediving offers a unique approach to pool training that focuses on technical skill development, 
                mental preparation, and a supportive community environment.
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {reasonsData.map((reason, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3,
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: "rgba(255,255,255,0.9)",
                      border: "1px solid rgba(0,0,0,0.05)",
                      transition: "all 0.3s ease",
                      display: "flex",
                      flexDirection: "column",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: "0 10px 30px rgba(0,87,184,0.1)",
                        borderColor: "rgba(0,87,184,0.2)"
                      }
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        mb: 2
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "linear-gradient(45deg, #035497 30%, #4191FF 90%)",
                          boxShadow: "0 4px 12px rgba(0,87,184,0.2)",
                          mr: 2
                        }}
                      >
                        <CheckCircleIcon sx={{ color: "white", fontSize: 22 }} />
                      </Box>
                      <Typography 
                        variant="h6" 
                        fontWeight={600}
                        fontSize="1.05rem"
                      >
                        {reason.title}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ flexGrow: 1 }}
                    >
                      {reason.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
          
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => {
              const element = document.querySelector("#contact");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              }
            }}
            sx={{
              borderRadius: "50px",
              px: 4,
              py: 1.5,
              fontFamily: "Poppins",
              fontWeight: 500,
              textTransform: "none",
              boxShadow: "0 6px 15px rgba(0,87,184,0.2)",
              "&:hover": {
                boxShadow: "0 8px 25px rgba(0,87,184,0.3)",
                transform: "translateY(-2px)"
              }
            }}
          >
            Join Our Training Sessions
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Services;
