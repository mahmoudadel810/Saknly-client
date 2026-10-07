import React from "react";
import Image from "next/image";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { LogoMark } from "@/shared/ui/Logo";

export interface AuthLayoutProps {
  /** The page's h1: "تسجيل الدخول". */
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Secondary links under the form: "ليس لديك حساب؟ إنشاء حساب". */
  footer?: React.ReactNode;
}

/**
 * The one layout for every auth page (DESIGN-SYSTEM.md v2, "Photography leads"): a split screen. The form
 * column (400px wide, at the inline start) holds the mark, the title, the form and a footer line for the
 * alternative route. From md up, the other half is a photo panel with a dark scrim and one true sentence
 * about the site; below md the photo is left out so the form starts at the top of the screen.
 */
export default function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <Box
      component="main"
      id="main"
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)", lg: "minmax(0, 5fr) minmax(0, 6fr)" },
        minHeight: "calc(100dvh - 64px)",
        bgcolor: "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: { xs: "flex-start", md: "center" },
          px: { xs: 2, sm: 4 },
          py: { xs: 4, md: 6 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <LogoMark size={44} />
          <Typography component="h1" variant="h3" sx={{ mt: 3, fontSize: { xs: "1.5rem", sm: "1.75rem" } }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              {description}
            </Typography>
          )}
          <Box sx={{ mt: 4 }}>{children}</Box>
          {footer && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
              {footer}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{
          display: { xs: "none", md: "block" },
          // Sticky and one viewport tall, so a long form (sign-up) scrolls past a still photo.
          position: "sticky",
          top: 76,
          alignSelf: "start",
          height: "calc(100dvh - 88px)",
          minHeight: 520,
          m: 1.5,
          marginInlineStart: 0,
          borderRadius: "var(--r-card)",
          overflow: "hidden",
          bgcolor: "var(--c-primary-soft)",
        }}
      >
        <Image
          src="/images/hero/auth-apartment.webp"
          alt=""
          fill
          sizes="(min-width: 1200px) 55vw, 50vw"
          style={{ objectFit: "cover", objectPosition: "50% 50%" }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(6, 26, 24, 0) 35%, rgba(6, 26, 24, 0.55) 62%, rgba(6, 26, 24, 0.86) 100%)",
          }}
        />
        <Box sx={{ position: "absolute", insetInline: 0, bottom: 0, p: { md: 4, lg: 6 }, color: "var(--c-over-photo)" }}>
          <Typography component="p" sx={{ fontSize: { md: "1.5rem", lg: "1.75rem" }, fontWeight: 700, lineHeight: 1.4, maxWidth: "22ch" }}>
            سكنك القادم يبدأ من هنا
          </Typography>
          <Typography component="p" sx={{ mt: 1, fontSize: "1rem", lineHeight: 1.75, maxWidth: "44ch", opacity: 0.92 }}>
            شقق وفلل ومحلات للبيع والإيجار، وسكن طلابي قرب الجامعات. تواصل مع المالك مباشرة.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/** "أو" between the form and the Google button. */
export function AuthDivider() {
  return (
    <Divider
      sx={{
        my: 2.5,
        color: "text.secondary",
        typography: "caption",
        "&::before, &::after": { borderColor: "divider" },
      }}
    >
      أو
    </Divider>
  );
}

/** The vertical rhythm of an auth form. */
export function AuthForm({
  onSubmit,
  children,
  label,
}: {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
  /** The form's accessible name when the page has more than one form. */
  label?: string;
}) {
  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      noValidate
      aria-label={label}
      // Full-width actions match the 48px fields.
      sx={{ display: "flex", flexDirection: "column", gap: 2.5, "& .MuiButton-fullWidth": { minHeight: 48 } }}
    >
      {children}
    </Box>
  );
}
