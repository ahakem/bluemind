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

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "all 0.3s ease",
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
                    height="240"
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
                    sx={{
                      position: "absolute",
                      bottom: 16,
                      left: 16,
                      fontWeight: 500,
                    }}
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    fontFamily="Poppins"
                    fontWeight={600}
                    mb={1.5}
                  >
                    {service.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                    sx={{ flexGrow: 1 }}
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
                      variant="subtitle2"
                      fontWeight={600}
                      color="primary"
                    >
                      {service.duration}
                    </Typography>
                    <Button
                      href="#contact"
                      color="error"
                      sx={{
                        fontWeight: 500,
                        textTransform: "none",
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
