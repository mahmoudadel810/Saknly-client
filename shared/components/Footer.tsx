"use client";
import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link as MuiLink,
  IconButton,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import Link from "next/link";

const Footer = () => {
  return (
    <Box
      component="footer"
      className="bg-[var(--primary-800)] dark:bg-[#1f2937] text-black dark:text-neutral-300"
      sx={{
        borderTop: "1px solid var(--neutral-700)",
        boxShadow: "inset 0 1px 4px rgba(0,0,0,0.15)",
        pt: { xs: 6, sm: 8, md: 12 },
        pb: { xs: 4, sm: 6, md: 8 },
      }}
    >
      <Container maxWidth="lg">
        <Box dir="rtl">
          <Grid container spacing={{ xs: 12 }} alignItems="flex-start">
            {/* سكنلي */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography
                variant="h4"
                sx={{
                  color: "var(--text-white)",
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: "1.6rem", sm: "1.8rem", md: "2rem" },
                }}
              >
                سكنلي
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "var(--neutral-400)",
                  mb: 1,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  lineHeight: 1.7,
                }}
              >
                رحلتك نحو المنزل المثالي تبدأ من هنا.
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "var(--neutral-400)",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  lineHeight: 1.7,
                }}
              >
                اعثر على العقارات للإيجار والبيع بسهولة.
              </Typography>
            </Grid>

            {/* روابط سريعة */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "var(--text-white)",
                  fontWeight: 600,
                  mb: 2,
                  fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
                }}
              >
                روابط سريعة
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                  { href: "/about", label: "من نحن" },
                  { href: "/contact", label: "اتصل بنا" },
                  { href: "/faq", label: "الأسئلة الشائعة" },
                  { href: "/privacy-policy", label: "سياسة الخصوصية" },
                ].map((link) => (
                  <MuiLink
                    key={link.href}
                    component={Link}
                    href={link.href}
                    sx={{
                      color: "var(--neutral-300)",
                      textDecoration: "none",
                      fontSize: { xs: "0.9rem", sm: "0.95rem" },
                      transition: "color 0.2s",
                      "&:hover": {
                        color: "var(--primary-400)",
                      },
                    }}
                  >
                    {link.label}
                  </MuiLink>
                ))}
              </Box>
            </Grid>

            {/* تابعنا */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "flex-start", md: "center" }, // change here
                  textAlign: { xs: "start", md: "center" },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: "var(--text-white)",
                    fontWeight: 600,
                    mb: 2,
                    fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
                  }}
                >
                  تابعنا
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row", // icons side by side
                    gap: 2,
                    justifyContent: "center",
                  }}
                >
                  {[
                    { icon: <FacebookIcon />, href: "#" },
                    { icon: <TwitterIcon />, href: "#" },
                    { icon: <InstagramIcon />, href: "#" },
                  ].map((social, index) => (
                    <IconButton
                      key={index}
                      component="a"
                      href={social.href}
                      sx={{
                        color: "var(--primary-400)",
                        transition: "color 0.2s",
                        "&:hover": {
                          color: "var(--primary-300)",
                        },
                      }}
                    >
                      {React.cloneElement(social.icon, {
                        sx: { fontSize: 26 },
                      })}
                    </IconButton>
                  ))}
                </Box>
              </Box>
            </Grid>


            {/* تواصل معنا */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "var(--text-white)",
                  fontWeight: 600,
                  mb: 2,
                  fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
                }}
              >
                تواصل معنا
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "var(--neutral-400)",
                  mb: 1,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  lineHeight: 1.6,
                }}
              >
                ١٢٣ شارع النيل، القاهرة، مصر
              </Typography>
              <MuiLink
                href="mailto:contact@saknly.com"
                sx={{
                  color: "var(--primary-300)",
                  textDecoration: "none",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  transition: "color 0.2s",
                  "&:hover": {
                    color: "var(--primary-400)",
                  },
                }}
              >
                contact@saknly.com
              </MuiLink>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            borderTop: "1px solid var(--neutral-700)",
            mt: { xs: 6, sm: 8, md: 10 },
            pt: { xs: 3, sm: 4, md: 5 },
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: { xs: "0.8rem", sm: "0.85rem" },
              color: "var(--neutral-500)",
            }}
          >
            © 2025 سكنلي. جميع الحقوق محفوظة.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
