'use client';

import { Box, Container, Typography, Card, CardContent, Button, CircularProgress, Skeleton, IconButton } from "@mui/material";
import { useCommunityData } from "@/hooks/useCommunityData";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import InstagramIcon from "@mui/icons-material/Instagram";
import LanguageIcon from "@mui/icons-material/Language";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

// Dark mode aquatic theme colors
const darkBlue = "#001f3f";
const deepBlue = "#003366";
const accentBlue = "#0077be";
const white = "#ffffff";

// Helper function to get social icon
const getSocialIcon = (platform: string | undefined) => {
  switch (platform?.toLowerCase()) {
    case "instagram":
      return <InstagramIcon sx={{ fontSize: 20 }} />;
    case "facebook":
      return <FacebookIcon sx={{ fontSize: 20 }} />;
    case "linkedin":
      return <LinkedInIcon sx={{ fontSize: 20 }} />;
    case "youtube":
      return <YouTubeIcon sx={{ fontSize: 20 }} />;
    case "whatsapp":
      return <WhatsAppIcon sx={{ fontSize: 20 }} />;
    case "website":
      return <LanguageIcon sx={{ fontSize: 20 }} />;
    default:
      return <LanguageIcon sx={{ fontSize: 20 }} />;
  }
};

const Community = () => {
  const { partners, instructors: guestInstructors, loading } = useCommunityData();

  return (
    <Box
      component="section"
      id="community"
      role="region"
      aria-labelledby="community-heading"
      sx={{
        bgcolor: darkBlue,
        color: white,
        minHeight: "100vh",
      }}
    >
      {/* Hero / Intro Section */}
      <Box
        sx={{
          py: 12,
          background: `linear-gradient(180deg, ${darkBlue} 0%, ${deepBlue} 100%)`,
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="subtitle1"
            component="p"
            fontFamily="Montserrat"
            sx={{ 
              color: accentBlue, 
              letterSpacing: 2,
              textTransform: "uppercase",
              mb: 2,
            }}
          >
            Our Community
          </Typography>
          <Typography
            id="community-heading"
            variant="h2"
            component="h1"
            fontFamily="Poppins"
            fontWeight={700}
            sx={{ 
              mb: 4,
              color: white,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Freediving is Better Together
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: accentBlue, mx: "auto", mb: 4 }} />
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "1rem", md: "1.2rem" },
              lineHeight: 1.8,
              color: "rgba(255, 255, 255, 0.9)",
              maxWidth: 700,
              mx: "auto",
            }}
          >
            At Blue Mind Freediving, we believe that the freediving journey is enriched through 
            connection and collaboration. Our community extends beyond our regular training sessions 
            to include incredible partners, guest instructors, and collaborators who share our 
            passion for the underwater world. Together, we&apos;re building Amsterdam&apos;s most 
            supportive and inspiring freediving ecosystem.
          </Typography>
        </Container>
      </Box>

      {/* Partners Section */}
      <Box
        sx={{
          py: 10,
          bgcolor: deepBlue,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="subtitle1"
              fontFamily="Montserrat"
              sx={{ 
                color: accentBlue, 
                letterSpacing: 2,
                textTransform: "uppercase",
                mb: 1,
              }}
            >
              Partners
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              fontFamily="Poppins"
              fontWeight={700}
              sx={{ color: white }}
            >
              Our Community Partners
            </Typography>
            <Box sx={{ width: 60, height: 3, bgcolor: accentBlue, mx: "auto", mt: 2 }} />
          </Box>

          {/* Partner Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 4,
            }}
          >
            {partners.map((partner) => (
              <Card
                key={partner.id}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 3,
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 20px 40px rgba(0, 119, 190, 0.2)`,
                    borderColor: accentBlue,
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: "center" }}>
                  {/* Logo Image */}
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      borderRadius: 2,
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      border: "2px dashed rgba(255, 255, 255, 0.3)",
                      overflow: "hidden",
                    }}
                  >
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          padding: "8px",
                        }}
                      />
                    ) : (
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.7rem" }}
                      >
                        LOGO
                      </Typography>
                    )}
                  </Box>
                  
                  <Typography
                    variant="h6"
                    fontFamily="Poppins"
                    fontWeight={600}
                    sx={{ color: white, mb: 2 }}
                  >
                    {partner.name}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      lineHeight: 1.6,
                      minHeight: 48,
                      mb: 3,
                    }}
                  >
                    {partner.description}
                  </Typography>

                  {/* Partner Links Section */}
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                    {partner.website && (
                      <Button
                        component="a"
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{
                          color: accentBlue,
                          textTransform: "none",
                          fontSize: "0.85rem",
                          "&:hover": {
                            bgcolor: "rgba(0, 119, 190, 0.1)",
                          },
                        }}
                      >
                        <LanguageIcon sx={{ mr: 0.5, fontSize: 16 }} />
                        Website
                      </Button>
                    )}
                    {partner.socialLink && (
                      <IconButton
                        component="a"
                        href={partner.socialLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{
                          color: accentBlue,
                          "&:hover": {
                            bgcolor: "rgba(0, 119, 190, 0.2)",
                          },
                        }}
                        title={partner.socialPlatform}
                      >
                        {getSocialIcon(partner.socialPlatform)}
                      </IconButton>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Guest Instructors Section */}
      <Box
        sx={{
          py: 10,
          bgcolor: darkBlue,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="subtitle1"
              fontFamily="Montserrat"
              sx={{ 
                color: accentBlue, 
                letterSpacing: 2,
                textTransform: "uppercase",
                mb: 1,
              }}
            >
              Collaborators
            </Typography>
            <Typography
              variant="h3"
              component="h2"
              fontFamily="Poppins"
              fontWeight={700}
              sx={{ color: white }}
            >
              Guest Instructors
            </Typography>
            <Box sx={{ width: 60, height: 3, bgcolor: accentBlue, mx: "auto", mt: 2, mb: 4 }} />
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255, 255, 255, 0.8)",
                maxWidth: 600,
                mx: "auto",
              }}
            >
              We collaborate with talented instructors and athletes from around the world 
              to bring diverse expertise and perspectives to our community.
            </Typography>
          </Box>

          {/* Instructor Cards */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 4,
              justifyItems: "center",
            }}
          >
            {guestInstructors.map((instructor) => (
              <Card
                key={instructor.id}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.03)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 4,
                  overflow: "visible",
                  transition: "all 0.3s ease",
                  maxWidth: 340,
                  width: "100%",
                  pt: 8,
                  position: "relative",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 25px 50px rgba(0, 119, 190, 0.15)`,
                    borderColor: "rgba(0, 119, 190, 0.3)",
                  },
                }}
              >
                {/* Circular Image */}
                <Box
                  sx={{
                    position: "absolute",
                    top: -50,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 120,
                    height: 120,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: `4px solid ${accentBlue}`,
                    bgcolor: "rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {instructor.image ? (
                    <img
                      src={instructor.image}
                      alt={instructor.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: deepBlue,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.65rem" }}
                      >
                        PHOTO
                      </Typography>
                    </Box>
                  )}
                </Box>

                <CardContent sx={{ p: 4, pt: 5, textAlign: "center" }}>
                  <Typography
                    variant="h5"
                    fontFamily="Poppins"
                    fontWeight={600}
                    sx={{ color: white, mb: 1 }}
                  >
                    {instructor.name}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: accentBlue,
                      fontWeight: 500,
                      mb: 2,
                      letterSpacing: 0.5,
                    }}
                  >
                    {instructor.specialty}
                  </Typography>
                  
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255, 255, 255, 0.7)",
                      lineHeight: 1.7,
                      mb: 3,
                    }}
                  >
                    {instructor.bio}
                  </Typography>
                  
                  <Button
                    component="a"
                    href={instructor.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    sx={{
                      borderColor: accentBlue,
                      color: accentBlue,
                      borderRadius: 50,
                      px: 3,
                      textTransform: "none",
                      "&:hover": {
                        bgcolor: accentBlue,
                        color: white,
                        borderColor: accentBlue,
                      },
                    }}
                  >
                    {instructor.socialPlatform}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box
        sx={{
          py: 8,
          background: `linear-gradient(180deg, ${darkBlue} 0%, ${deepBlue} 100%)`,
          textAlign: "center",
        }}
      >
        <Container maxWidth="sm">
          <Typography
            variant="h4"
            fontFamily="Poppins"
            fontWeight={600}
            sx={{ color: white, mb: 2 }}
          >
            Become Part of Our Community
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "rgba(255, 255, 255, 0.8)", mb: 4 }}
          >
            Interested in partnering with us or joining as a guest instructor? 
            We&apos;d love to hear from you.
          </Typography>
          <Button
            component="a"
            href="/contact"
            variant="contained"
            size="large"
            sx={{
              bgcolor: accentBlue,
              color: white,
              px: 5,
              py: 1.5,
              borderRadius: 50,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              "&:hover": {
                bgcolor: "#005a8c",
              },
            }}
          >
            Get in Touch
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Community;
