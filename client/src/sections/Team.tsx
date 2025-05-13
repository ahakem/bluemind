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

        <Grid container spacing={3}>
          {team.map((member, index) => (
            <Grid key={index} sx={{ width: { xs: '100%', sm: '50%', md: '25%', lg: '25%' }, p: 1.5 }}>
              <Card
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 2,
                  transition: "all 0.3s ease",
                  maxWidth: "100%",
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
                    height={220}
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
                      pb: 2,
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <Box>
                      <IconButton
                        sx={{
                          bgcolor: "white",
                          color: "primary.main",
                          width: 32,
                          height: 32,
                          mx: 0.5,
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        <FacebookIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        sx={{
                          bgcolor: "white",
                          color: "primary.main",
                          width: 32,
                          height: 32,
                          mx: 0.5,
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        <InstagramIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <IconButton
                        sx={{
                          bgcolor: "white",
                          color: "primary.main",
                          width: 32,
                          height: 32,
                          mx: 0.5,
                          "&:hover": {
                            bgcolor: "primary.main",
                            color: "white",
                          },
                        }}
                      >
                        <LinkedInIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
                <CardContent sx={{ textAlign: "center", p: 2 }}>
                  <Typography
                    variant="h6"
                    fontFamily="Poppins"
                    fontWeight={600}
                    mb={0.5}
                    fontSize={{ xs: "0.95rem", sm: "1rem" }}
                  >
                    {member.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="primary.main"
                    fontSize="0.8rem"
                  >
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
