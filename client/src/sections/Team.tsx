import { Box, Container, Typography, Grid, Card, CardMedia, CardContent, IconButton } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { team } from "../data";

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
            Meet Our Instructors
          </Typography>
          <Typography
            variant="h3"
            fontFamily="Poppins"
            fontWeight={700}
          >
            Expert Freediving Team
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
        </Box>

        <Grid container spacing={4}>
          {team.map((member, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 2,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                    "& .MuiCardMedia-root": {
                      transform: "scale(1.05)",
                    },
                    "& .overlay": {
                      opacity: 1,
                    },
                  },
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height={280}
                    image={member.image}
                    alt={member.name}
                    sx={{ transition: "transform 0.5s ease" }}
                  />
                  <Box
                    className="overlay"
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      pb: 3,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <Box>
                      <IconButton
                        sx={{
                          bgcolor: "white",
                          color: "primary.main",
                          width: 36,
                          height: 36,
                          mx: 0.5,
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        <FacebookIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        sx={{
                          bgcolor: "white",
                          color: "primary.main",
                          width: 36,
                          height: 36,
                          mx: 0.5,
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        <InstagramIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        sx={{
                          bgcolor: "white",
                          color: "primary.main",
                          width: 36,
                          height: 36,
                          mx: 0.5,
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        <LinkedInIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    fontFamily="Poppins"
                    fontWeight={600}
                    mb={0.5}
                  >
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="primary.main">
                    {member.position}
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
