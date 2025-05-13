import { Box, Container, Typography, Grid } from "@mui/material";
import { counters } from "../data";

const Counter = () => {
  return (
    <Box
      sx={{
        py: 8,
        bgcolor: "primary.main",
        color: "white",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} textAlign="center">
          {counters.map((counter, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Typography
                variant="h2"
                component="div"
                fontFamily="Poppins"
                fontWeight={700}
                mb={1}
              >
                {counter.number}
              </Typography>
              <Typography
                variant="h6"
                fontWeight={500}
                sx={{ opacity: 0.9 }}
              >
                {counter.label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Counter;
