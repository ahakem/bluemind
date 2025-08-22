import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./lib/theme";
import { HelmetProvider } from 'react-helmet-async';
createRoot(document.getElementById("root")!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <HelmetProvider>
    <App />
    </HelmetProvider>
  </ThemeProvider>
);
