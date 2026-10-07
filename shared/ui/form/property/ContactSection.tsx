import TextField from "@mui/material/TextField";
import { LIMITS } from "@/shared/utils/propertyFormValidation";
import FormSection, { FieldRow } from "../FormSection";
import { bind, help, numericInput, type SectionProps } from "./fields";

export default function ContactSection(p: SectionProps) {
  return (
    <FormSection
      id="pf-contact"
      step={6}
      title="بيانات التواصل"
      description="تظهر هذه البيانات لكل زوار صفحة الإعلان، ليتصلوا بك مباشرة."
    >
      <FieldRow>
        <TextField
          {...bind(p, "contactInfo.name")}
          required
          label="الاسم"
          autoComplete="name"
          helperText={help(p, "contactInfo.name", "بالحروف العربية أو الإنجليزية.")}
          slotProps={{ htmlInput: { maxLength: LIMITS.contactName } }}
        />
        <TextField
          {...bind(p, "contactInfo.phone", { digits: true })}
          required
          type="tel"
          label="رقم الهاتف"
          autoComplete="tel-national"
          helperText={help(p, "contactInfo.phone", "مثال: 01012345678")}
          slotProps={{ htmlInput: { ...numericInput.htmlInput, maxLength: 11 } }}
        />
      </FieldRow>
      <FieldRow>
        <TextField
          {...bind(p, "contactInfo.whatsapp", { digits: true })}
          type="tel"
          label="رقم واتساب"
          helperText={help(p, "contactInfo.whatsapp", "اختياري.")}
          slotProps={{ htmlInput: { ...numericInput.htmlInput, maxLength: 11 } }}
        />
        <TextField
          {...bind(p, "contactInfo.email")}
          type="email"
          label="البريد الإلكتروني"
          autoComplete="email"
          helperText={help(p, "contactInfo.email", "اختياري.")}
          slotProps={{ htmlInput: { dir: "ltr" } }}
        />
      </FieldRow>
    </FormSection>
  );
}
