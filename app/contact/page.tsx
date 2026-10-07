import type { Metadata } from "next";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import ContactForm from "@/shared/components/ContactForm";
import ContentPage from "@/shared/ui/ContentPage";
import { CONTACT_INFO } from "@/shared/constants";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: "راسل فريق سكنلي أو اتصل بنا مباشرة.",
};

const panelSx = {
  border: 1,
  borderColor: "divider",
  borderRadius: "var(--r-card)",
  p: { xs: 2.5, md: 4 },
} as const;

export default function ContactPage() {
  return (
    <ContentPage
      width="wide"
      title="تواصل معنا"
      description="عندك سؤال عن إعلان أو مشكلة في حسابك؟ اكتب لنا وسنرد على بريدك الإلكتروني."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Box
          component="section"
          aria-labelledby="contact-form-title"
          sx={{ ...panelSx, bgcolor: "background.paper", boxShadow: "var(--c-card-shadow)" }}
        >
          <Typography id="contact-form-title" component="h2" variant="h5" sx={{ mb: 2.5 }}>
            أرسل رسالة
          </Typography>
          <ContactForm />
        </Box>

        <Box
          component="aside"
          aria-labelledby="contact-direct-title"
          sx={{ ...panelSx, bgcolor: "var(--c-primary-soft)", borderColor: "transparent", alignSelf: "start" }}
        >
          <Typography id="contact-direct-title" component="h2" variant="h5" sx={{ mb: 0.5 }}>
            تواصل مباشرة
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            للأسئلة العاجلة اتصل بنا أو راسلنا على البريد.
          </Typography>
          <Box component="address" sx={{ fontStyle: "normal", display: "flex", flexDirection: "column", gap: 2 }}>
            <ContactLine icon={<PhoneOutlined />} label="الهاتف">
              <MuiLink href={`tel:${CONTACT_INFO.PHONE_E164}`} underline="hover">
                <span dir="ltr" className="num">
                  {CONTACT_INFO.PHONE_DISPLAY}
                </span>
              </MuiLink>
            </ContactLine>
            <ContactLine icon={<EmailOutlined />} label="البريد الإلكتروني">
              <MuiLink href={`mailto:${CONTACT_INFO.EMAIL}`} underline="hover" sx={{ wordBreak: "break-all" }}>
                <span dir="ltr">{CONTACT_INFO.EMAIL}</span>
              </MuiLink>
            </ContactLine>
          </Box>
        </Box>
      </div>
    </ContentPage>
  );
}

function ContactLine({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
      <Box
        aria-hidden
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          color: "primary.main",
          bgcolor: "background.paper",
          "& svg": { fontSize: 20 },
        }}
      >
        {icon}
      </Box>
      <div>
        <Typography variant="caption" color="text.secondary" component="p">
          {label}
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontWeight: 500 }}>
          {children}
        </Typography>
      </div>
    </Box>
  );
}
