'use client';

import { Box, Container, Typography, Grid, Card, CardContent } from "@mui/material";
import { team } from "@/data";
import Image from "next/image";

const Team = () => {
  return (
    <Box 
      component="section" 
      id="team" 
      role="region"
      aria-labelledby="team-heading"
      sx={{ py: 10, bgcolor: "white" }}
    >
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
            id="team-heading"
            variant="h2"
            component="h2"
            fontFamily="Poppins"
            fontWeight={700}
          >
            Board Members
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "accent.main", mx: "auto", mt: 2 }} />
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {team.map((member, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  borderRadius: 2,
                  overflow: "hidden",
                  boxShadow: 3,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                  "&:hover img": {
                    filter: "grayscale(0%)",
                  },
                }}
              >
                <Box sx={{ position: 'relative', width: '100%', height: 300, overflow: 'hidden' }}>
                  <Image
                    src={member.image}
                    alt={`${member.name} - ${member.position} at Blue Mind Freediving Amsterdam`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{
                      objectFit: 'cover',
                      filter: 'grayscale(100%)',
                      transition: 'filter 0.3s ease-in-out',
                    }}
                    loading="lazy"
                  />
                </Box>
                <CardContent sx={{ textAlign: "center", p: 3, flexGrow: 1 }}>
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
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontSize: '1.1rem' }}
                  >
                    {member.bio}
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
