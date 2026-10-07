"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";

const COLUMNS: { id: string; title: string; links: { href: string; label: string }[] }[] = [
  {
    id: "footer-browse",
    title: "تصفح",
    links: [
      { href: "/properties", label: "كل العقارات" },
      { href: "/properties?category=sale", label: "للبيع" },
      { href: "/properties?category=rent", label: "للإيجار" },
      { href: "/properties?isStudentFriendly=true", label: "سكن الطلاب" },
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

/**
 * Compact public footer in three columns (DESIGN-SYSTEM.md, Shells). Contact details live on /contact; the
 * old footer's street address, mailbox and "#" social links were placeholders, so they are not repeated here.
 */
export default function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 3 }, pt: { xs: 4, md: 5 }, pb: 3 }}>
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Box
              component={Link}
              href="/"
              sx={{ display: "inline-flex", alignItems: "center", gap: 1, color: "text.primary", textDecoration: "none" }}
            >
              <Image src="/logo.svg" alt="" width={28} height={28} />
              <Typography component="span" sx={{ fontSize: "1.125rem", fontWeight: 700 }}>
                سكنلي
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, maxWidth: "36ch" }}>
              عقارات للبيع والإيجار وسكن الطلاب. ابحث عن العقار المناسب وتواصل مع مالكه مباشرة.
            </Typography>
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
