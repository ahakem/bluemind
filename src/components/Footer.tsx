'use client';

import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import WaterIcon from "@mui/icons-material/Water";
import Link from "next/link";
import Image from "next/image";
import { useIsFreediveOne } from "@/hooks/useIsFreediveOne";

const linkStyle = { color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", textDecoration: "none" } as const;
const sep = <Box component="span" sx={{ color: "rgba(255,255,255,0.3)" }}>|</Box>;

const Footer = () => {
  const isFreediveOne = useIsFreediveOne();

  if (isFreediveOne) {
    return (
      <Box
        component="footer"
        sx={{ bgcolor: "#001f3f", color: "white", py: 5, boxShadow: "0 -5px 20px rgba(0,0,0,0.15)" }}
      >
        <Container maxWidth="lg">
          {/* Nonprofit attribution */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography variant="body2" color="rgba(255,255,255,0.75)" sx={{ fontSize: "0.8rem" }}>
              freedive.one is a free community resource built and maintained by{" "}
              <MuiLink
                href="https://bluemindfreediving.nl"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: "rgba(255,255,255,0.95)", fontWeight: 600 }}
              >
                Blue Mind Freediving
              </MuiLink>
              {" "}· Registered Dutch non-profit (vereniging) · KVK: 96935685
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Brand */}
            <Link href="/dive-sites" style={{ textDecoration: "none" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WaterIcon sx={{ color: "#4fc3f7", fontSize: 22 }} />
                <Typography
                  variant="body1"
                  fontWeight={800}
                  sx={{ color: "white", letterSpacing: "-0.5px", "& span": { color: "#4fc3f7" } }}
                >
                  freedive<span>.one</span>
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.5)" sx={{ fontSize: "0.8rem" }}>
                  &copy; {new Date().getFullYear()}
                </Typography>
              </Box>
            </Link>

            {/* Links */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/about" style={linkStyle}>About</Link>
              {sep}
              <Link href="/privacy-policy" style={linkStyle}>Privacy Policy</Link>
              {sep}
              <Link href="/terms-of-service" style={linkStyle}>Terms of Service</Link>
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  // ── Blue Mind footer ──────────────────────────────────────────────────────
  return (
    <Box
      component="footer"
      sx={{ bgcolor: "#051a33", color: "white", py: 4, boxShadow: "0 -5px 20px rgba(0,0,0,0.1)" }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Typography variant="body2" color="rgba(255,255,255,0.85)" sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" } }}>
            Blue Mind Freediving is a registered Dutch non-profit association (vereniging) | KVK: 96935685
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, sm: 3 } }}>
            <Image
              src="/images/bluemind-light.png"
              alt="Blue Mind Freediving"
              width={120}
              height={50}
              style={{ width: 'auto', height: 50 }}
              loading="lazy"
            />
            <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              &copy; {new Date().getFullYear()} Blue Mind Freediving
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "center" }}>
            <Link href="/documents/privacy-policy" style={linkStyle}>Privacy Policy</Link>
            |
            <Link href="/documents/terms-of-service" style={linkStyle}>Terms of Service</Link>
            |
            <Typography variant="body2" color="rgba(255,255,255,0.7)" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Follow us
            </Typography>
            <MuiLink
              href="https://www.instagram.com/bluemind.freediving/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              sx={{
                color: "white",
                width: 38,
                height: 38,
                bgcolor: "rgba(255,255,255,0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s ease",
                "&:hover": { bgcolor: "primary.main", transform: "translateY(-3px)", boxShadow: "0 5px 15px rgba(0,0,0,0.2)" }
              }}
            >
              <InstagramIcon fontSize="small" />
            </MuiLink>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
