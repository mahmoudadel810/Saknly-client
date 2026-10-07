"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import CallOutlined from "@mui/icons-material/CallOutlined";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import MailOutlineOutlined from "@mui/icons-material/MailOutlineOutlined";
import InquiryForm from "@/shared/ui/listing/InquiryForm";

export interface ContactSource {
  contactInfo?: { name?: string; phone?: string; email?: string; whatsapp?: string } | null;
  owner?: { userName?: string; firstName?: string; lastName?: string; email?: string; phone?: string } | null;
  agent?: { userName?: string; email?: string; phone?: string } | null;
}

export interface ContactChannels {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
}

/**
 * The listing's contact channels: the contact details the owner entered on the listing, falling back to the
 * owner's account. Only fields that exist are offered; nothing is invented.
 */
export function contactChannels(listing: ContactSource): ContactChannels {
  const c = listing.contactInfo ?? {};
  const owner = listing.owner ?? {};
  const ownerName = owner.userName || [owner.firstName, owner.lastName].filter(Boolean).join(" ");
  const phone = (c.phone || owner.phone || "").trim() || null;
  const whatsapp = (c.whatsapp || c.phone || owner.phone || "").trim() || null;
  return {
    name: (c.name || ownerName || "").trim() || "المالك",
    phone,
    whatsapp,
    email: (c.email || owner.email || "").trim() || null,
  };
}

/** tel: wants the digits and a leading +. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** wa.me wants the international number without + or leading zeros; Egyptian 01… numbers get 20. */
export function whatsappHref(phone: string, text?: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("01")) digits = `2${digits}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function ContactButtons({
  channels,
  title,
  size = "large",
}: {
  channels: ContactChannels;
  title: string;
  size?: "medium" | "large";
}) {
  return (
    <>
      {channels.phone && (
        <Button
          component="a"
          href={telHref(channels.phone)}
          variant="contained"
          size={size}
          startIcon={<CallOutlined aria-hidden />}
          aria-label={`اتصل بـ${channels.name} على ${channels.phone}`}
        >
          اتصال
        </Button>
      )}
      {channels.whatsapp && (
        <Button
          component="a"
          href={whatsappHref(channels.whatsapp, `مرحبًا، أسأل عن إعلان «${title}» على سكنلي.`)}
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          size={size}
          startIcon={<ChatOutlined aria-hidden />}
        >
          واتساب
        </Button>
      )}
    </>
  );
}

/**
 * The contact panel on the listing page: who to contact, call / WhatsApp / email, and the inquiry form.
 * The page makes it sticky on desktop; on phones the call buttons also sit in a bottom bar.
 */
export default function ContactCard({
  listing,
  propertyId,
  title,
}: {
  listing: ContactSource;
  propertyId: string;
  title: string;
}) {
  const channels = contactChannels(listing);
  const hasDirect = Boolean(channels.phone || channels.whatsapp || channels.email);

  return (
    <Box
      component="section"
      aria-labelledby="contact-title"
      sx={{ border: 1, borderColor: "divider", borderRadius: "10px", bgcolor: "background.paper", p: { xs: 2, md: 2.5 } }}
    >
      <Typography id="contact-title" component="h2" variant="h5">
        تواصل مع المالك
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {channels.name}
        {channels.phone && (
          <Box component="span" sx={{ display: "block", fontVariantNumeric: "tabular-nums", color: "text.primary" }}>
            {channels.phone}
          </Box>
        )}
      </Typography>

      {hasDirect && (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1, mt: 2 }}>
          <ContactButtons channels={channels} title={title} />
          {channels.email && (
            <Button
              component="a"
              href={`mailto:${channels.email}?subject=${encodeURIComponent(`استفسار عن «${title}»`)}`}
              color="secondary"
              startIcon={<MailOutlineOutlined aria-hidden />}
              sx={{ gridColumn: "1 / -1" }}
            >
              مراسلة بالبريد الإلكتروني
            </Button>
          )}
        </Box>
      )}

      <Divider sx={{ my: 2.5 }} />

      <Typography id="inquiry-title" component="h3" variant="h6" sx={{ mb: 0.5 }}>
        أرسل استفسارًا
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        تصل رسالتك إلى صاحب الإعلان مع بيانات التواصل التي تكتبها هنا.
      </Typography>
      <InquiryForm propertyId={propertyId} />
    </Box>
  );
}
