'use client';

import { useState, useEffect } from "react";
import { Fab } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import useScrollPosition from "@/hooks/useScrollPosition";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);
  const scrollPosition = useScrollPosition();

  useEffect(() => {
    setVisible(scrollPosition > 300);
  }, [scrollPosition]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <Fab
      color="primary"
      aria-label="back to top"
      onClick={scrollToTop}
      sx={{
        position: "fixed",
        bottom: 24,
        right: 24,
        display: visible ? "flex" : "none",
        transition: "all 0.3s ease",
        zIndex: 10,
      }}
    >
      <KeyboardArrowUpIcon />
    </Fab>
  );
};

export default BackToTop;
