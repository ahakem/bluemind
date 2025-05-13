import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, Button, Chip } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { services } from "../data";

const Services = () => {
  return (
    <Box id="services" sx={{ py: 10, bgcolor: "white" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="subtitle1"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Our Programs
          </Typography>
          <Typography
            variant="h3"
            fontFamily="Poppins"
            fontWeight={700}
          >
            Specialized Freediving Training
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
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
                      href="#contact"
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

        <Box sx={{ textAlign: "center", mt: 6 }}>
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
              fontWeight: 500,
              textTransform: "none",
            }}
          >
            View All Training Programs
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Services;
