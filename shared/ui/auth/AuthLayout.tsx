import React from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { LogoMark } from "@/shared/ui/Logo";

export interface AuthLayoutProps {
  /** The page's h1: "تسجيل الدخول". */
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Secondary links under the card: "ليس لديك حساب؟ إنشاء حساب". */
  footer?: React.ReactNode;
}

/**
 * The one layout for every auth page (DESIGN-SYSTEM.md, Page goals): a centred 400px card on the page
 * background, with the mark, the title, the form and a footer line for the alternative route.
 */
export default function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <Box
      component="main"
      id="main"
      sx={{
        minHeight: "calc(100dvh - 64px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: { xs: "flex-start", sm: "center" },
        px: 2,
        py: { xs: 3, sm: 6 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 400,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: "10px",
          px: { xs: 2.5, sm: 4 },
          py: { xs: 3, sm: 4 },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <LogoMark size={40} />
        </Box>
        <Typography component="h1" variant="h3" sx={{ textAlign: "center" }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 1 }}>
            {description}
          </Typography>
        )}
        <Box sx={{ mt: 3 }}>{children}</Box>
      </Box>
      {footer && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, textAlign: "center", maxWidth: 400 }}>
          {footer}
        </Typography>
      )}
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
      sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}
    >
      {children}
    </Box>
  );
}
