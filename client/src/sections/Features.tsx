import { Box, Container, Typography, Grid, Paper } from "@mui/material";
import PoolIcon from "@mui/icons-material/Pool";
import TimerIcon from "@mui/icons-material/Timer";
import GroupIcon from "@mui/icons-material/Group";
import { features } from "../data";

const Features = () => {
  return (
    <Box id="features" sx={{ py: 8, bgcolor: "white" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="subtitle1"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Why Choose Us
          </Typography>
          <Typography variant="h3" fontFamily="Poppins" fontWeight={700}>
            Freediving Excellence
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 8,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                    bgcolor: "primary.light",
                    opacity: 0.1,
                  }}
                >
                  {index === 0 ? (
                    <PoolIcon sx={{ fontSize: 32, color: "primary.main" }} />
                  ) : index === 1 ? (
                    <TimerIcon sx={{ fontSize: 32, color: "primary.main" }} />
                  ) : (
                    <GroupIcon sx={{ fontSize: 32, color: "primary.main" }} />
                  )}
                </Box>
                <Typography variant="h5" fontFamily="Poppins" fontWeight={600} mb={1.5}>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Features;
