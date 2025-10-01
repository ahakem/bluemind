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
      main: "#0056b3", // Ensuring 4.5:1 contrast ratio
      dark: "#003d80", // Enhanced for better contrast
      contrastText: "#ffffff",
    },
    secondary: {
      light: "#33c5df",
      main: "#0095b0", // Adjusted for better contrast
      dark: "#006d7a", // Enhanced contrast
      contrastText: "#ffffff",
    },
    accent: {
      light: "#ff7a4f",
      main: "#e64a19", // Adjusted for better contrast on white backgrounds
      dark: "#bf360c", // Enhanced contrast
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121", // Enhanced for better contrast
      secondary: "#424242", // Ensuring sufficient contrast
    },
  },
  typography: {
    fontFamily: [
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
      fontWeight: 700,
    },
    h3: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
      fontWeight: 700,
    },
    h4: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
      fontWeight: 600,
    },
    h5: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
      fontWeight: 600,
    },
    h6: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
      fontWeight: 500,
    },
    subtitle2: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
      fontWeight: 500,
    },
    body1: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
    },
    body2: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
    },
    button: {
      fontFamily: "Helvetica Neue, Arial, sans-serif",
      fontWeight: 500,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: "Helvetica Neue, Arial, sans-serif !important",
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
    MuiAppBar: {
      styleOverrides: {
        root: {
          fontFamily: "Helvetica Neue, Arial, sans-serif !important",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          fontFamily: "Helvetica Neue, Arial, sans-serif !important",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "Helvetica Neue, Arial, sans-serif !important",
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
  },
});

export default theme;
