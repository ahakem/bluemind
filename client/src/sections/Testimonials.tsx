import { useState } from "react";
import { Box, Container, Typography, Card, CardContent, Avatar, Rating, IconButton } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { testimonials } from "../data";

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
  };

  return (
    <Box
      id="testimonials"
      sx={{
        py: 10,
        bgcolor: "primary.main",
        color: "white",
        position: "relative",
        overflow: "hidden",
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
          opacity: 0.1,
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
          <defs>
            <pattern id="wave" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M0 50 Q 25 0 50 50 Q 75 100 100 50" stroke="white" fill="none" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wave)" />
        </svg>
      </Box>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            variant="subtitle1"
            fontFamily="Montserrat"
            color="secondary.main"
            mb={1}
          >
            Testimonials
          </Typography>
          <Typography
            variant="h2"
            fontFamily="Poppins"
            fontWeight={700}
          >
            What Our Students Say
          </Typography>
          <Box sx={{ width: 80, height: 3, bgcolor: "white", mx: "auto", mt: 2 }} />
        </Box>

        <Box
          sx={{
            maxWidth: 800,
            mx: "auto",
            position: "relative",
          }}
        >
          <Card
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(8px)",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "center", md: "flex-start" },
                  gap: 3,
                }}
              >
                <Avatar
                  src={testimonials[currentSlide].image}
                  alt={testimonials[currentSlide].name}
                  sx={{ width: 100, height: 100 }}
                />
                <Box>
                  <Rating
                    value={5}
                    readOnly
                    sx={{
                      mb: 2,
                      "& .MuiRating-iconFilled": {
                        color: "secondary.main",
                      },
                    }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      fontStyle: "italic",
                      fontSize: "1.125rem",
                      mb: 4,
                    }}
                  >
                    "{testimonials[currentSlide].text}"
                  </Typography>
                  <Box>
                    <Typography
                      variant="h6"
                      fontFamily="Poppins"
                      fontWeight={600}
                    >
                      {testimonials[currentSlide].name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="secondary.main"
                      fontWeight={500}
                    >
                      {testimonials[currentSlide].title}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Pagination dots */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 4,
              gap: 1,
            }}
          >
            {testimonials.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentSlide(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  bgcolor: index === currentSlide ? "white" : "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                }}
              />
            ))}
          </Box>

          {/* Navigation buttons */}
          <IconButton
            onClick={handlePrev}
            aria-label="Previous testimonial"
            sx={{
              position: "absolute",
              top: "50%",
              left: { xs: "50%", md: -20 },
              transform: { xs: "translate(-60px, -50%)", md: "translateY(-50%)" },
              bgcolor: "white",
              color: "primary.main",
              "&:hover": { bgcolor: "grey.100" },
              zIndex: 2,
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            onClick={handleNext}
            aria-label="Next testimonial"
            sx={{
              position: "absolute",
              top: "50%",
              right: { xs: "50%", md: -20 },
              transform: { xs: "translate(60px, -50%)", md: "translateY(-50%)" },
              bgcolor: "white",
              color: "primary.main",
              "&:hover": { bgcolor: "grey.100" },
              zIndex: 2,
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default Testimonials;
