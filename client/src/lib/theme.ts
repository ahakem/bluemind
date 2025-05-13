import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface PaletteOptions {
    accent?: PaletteColorOptions;
  }
  
  interface Palette {
    accent: PaletteColor;
  }
}

export const theme = createTheme({
  palette: {
    primary: {
      light: "#1a75cf",
      main: "#0056b3",
      dark: "#004090",
      contrastText: "#ffffff",
    },
    secondary: {
      light: "#33c5df",
      main: "#00b8d4",
      dark: "#0095b0",
      contrastText: "#ffffff",
    },
    accent: {
      light: "#ff7a4f",
      main: "#ff5722",
      dark: "#e64a19",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: [
      "Roboto",
      "Poppins",
      "Montserrat",
      "sans-serif",
    ].join(","),
    h1: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: "Montserrat, sans-serif",
      fontWeight: 500,
    },
    body1: {
      fontFamily: "Roboto, sans-serif",
    },
    body2: {
      fontFamily: "Roboto, sans-serif",
    },
    button: {
      fontFamily: "Poppins, sans-serif",
      fontWeight: 500,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          padding: "8px 22px",
          fontWeight: 500,
          textTransform: "none",
          boxShadow: "none",
        },
        containedPrimary: {
          "&:hover": {
            backgroundColor: "#004090",
            boxShadow: "0px 4px 10px rgba(0, 86, 179, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
        },
      },
    },
  },
});

export default theme;
