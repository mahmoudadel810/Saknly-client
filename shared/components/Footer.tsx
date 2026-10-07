"use client";

import Link from "next/link";
import Logo from "@/shared/ui/Logo";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import { CONTACT_INFO } from "@/shared/constants";

const COLUMNS: { id: string; title: string; links: { href: string; label: string }[] }[] = [
  {
    id: "footer-browse",
    title: "تصفح",
    links: [
      { href: "/properties", label: "كل العقارات" },
      { href: "/properties?category=sale", label: "للبيع" },
      { href: "/properties?category=rent", label: "للإيجار" },
      { href: "/properties?isStudentFriendly=true", label: "سكن طلابي" },
      { href: "/uploadProperty", label: "أضف عقارك" },
    ],
  },
  {
    id: "footer-about",
    title: "سكنلي",
    links: [
      { href: "/about", label: "من نحن" },
      { href: "/contact", label: "اتصل بنا" },
      { href: "/faq", label: "الأسئلة الشائعة" },
      { href: "/privacy-policy", label: "سياسة الخصوصية" },
    ],
  },
];

const contactLinkSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  width: "fit-content",
  color: "text.secondary",
  fontSize: "0.875rem",
  "&:hover": { color: "primary.main" },
} as const;

/**
 * Compact public footer in three columns (DESIGN-SYSTEM.md, Shells). The phone and email come from
 * CONTACT_INFO, the only real contact details; there is no public street address.
 */
export default function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 }, pt: { xs: 4, md: 5 }, pb: 3 }}>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="col-span-2 md:col-span-1">
            <Box
              component={Link}
              href="/"
              aria-label="سكنلي، الصفحة الرئيسية"
              sx={{ display: "inline-flex", alignItems: "center", color: "text.primary", textDecoration: "none" }}
            >
              <Logo size={28} showLatin />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: "36ch" }}>
              عقارات للبيع والإيجار وسكن طلابي. ابحث عن العقار المناسب وتواصل مع مالكه مباشرة.
            </Typography>
            <Box
              component="address"
              sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1, fontStyle: "normal" }}
            >
              <MuiLink
                href={`tel:${CONTACT_INFO.PHONE_E164}`}
                underline="hover"
                sx={contactLinkSx}
              >
                <PhoneOutlined aria-hidden sx={{ fontSize: 18 }} />
                <span dir="ltr" className="num">
                  {CONTACT_INFO.PHONE_DISPLAY}
                </span>
              </MuiLink>
              <MuiLink href={`mailto:${CONTACT_INFO.EMAIL}`} underline="hover" sx={contactLinkSx}>
                <EmailOutlined aria-hidden sx={{ fontSize: 18 }} />
                <span dir="ltr">{CONTACT_INFO.EMAIL}</span>
              </MuiLink>
            </Box>
          </div>

          {COLUMNS.map((column) => (
            <Box component="nav" key={column.id} aria-labelledby={column.id}>
              <Typography id={column.id} component="h2" variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                {column.title}
              </Typography>
              <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: 1, m: 0, p: 0, listStyle: "none" }}>
                {column.links.map((link) => (
                  <li key={link.href}>
                    <MuiLink
                      component={Link}
                      href={link.href}
                      underline="hover"
                      sx={{ color: "text.secondary", fontSize: "0.875rem", "&:hover": { color: "primary.main" } }}
                    >
                      {link.label}
                    </MuiLink>
                  </li>
                ))}
              </Box>
            </Box>
          ))}
        </div>

        <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary">
            © <span className="num">{new Date().getFullYear()}</span> سكنلي. جميع الحقوق محفوظة.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
