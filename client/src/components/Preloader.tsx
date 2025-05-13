import { Box, CircularProgress } from "@mui/material";

const Preloader = () => {
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        opacity: 1,
        transition: "opacity 0.3s ease",
      }}
    >
      <CircularProgress
        size={80}
        thickness={4}
        sx={{
          color: "primary.main",
        }}
      />
    </Box>
  );
};

export default Preloader;
