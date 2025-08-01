import { Box, Container, Typography, Grid, Card, CardMedia, CardContent } from "@mui/material";
import { team } from "../../data/index";

const Team = () => {
  return (
    <Box id="team" sx={{ py: 10, bgcolor: "white" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="subtitle1"
            fontFamily="Montserrat"
            color="primary"
            mb={1}
          >
            Meet Our Board
          </Typography>
          <Typography
            variant="h3"
            fontFamily="Poppins"
            fontWeight={700}
          >
            Board Members
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {team.map((member, index) => (
            <Grid item xs={12} sm={6} md={5} key={index}>
              <Card
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={member.image}
                  alt={member.name}
                />
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Typography
                    variant="h5"
                    fontFamily="Poppins"
                    fontWeight={600}
                    mb={1}
                  >
                    {member.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="primary.main"
                    mb={2}
                  >
                    {member.position}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {member.bio} xxxx
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default Team;