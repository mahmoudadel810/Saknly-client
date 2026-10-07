"use client";

import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { api, getErrorMessage } from "@/shared/services/api";
import { useToast } from "@/shared/provider/ToastProvider";

type Field = "name" | "email" | "phone" | "message";
type Values = Record<Field, string>;
type Errors = Partial<Record<Field, string>>;

const EMPTY: Values = { name: "", email: "", phone: "", message: "" };

// The same rules as the server's createInquiryValidator, so a valid form is never refused for its fields.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/;

function validate(v: Values): Errors {
  const e: Errors = {};
  const name = v.name.trim();
  if (!name) e.name = "اكتب اسمك.";
  else if (name.length < 2 || name.length > 50) e.name = "الاسم بين حرفين و50 حرفًا.";
  if (!v.email.trim()) e.email = "اكتب بريدك الإلكتروني.";
  else if (!EMAIL.test(v.email.trim())) e.email = "البريد الإلكتروني غير صحيح.";
  const phone = v.phone.trim();
  if (!phone) e.phone = "اكتب رقم هاتفك.";
  else if (!PHONE.test(phone) || phone.replace(/\D/g, "").length < 7 || phone.length > 30) e.phone = "رقم الهاتف غير صحيح.";
  const message = v.message.trim();
  if (!message) e.message = "اكتب رسالتك.";
  else if (message.length < 10) e.message = "الرسالة قصيرة جدًا (10 أحرف على الأقل).";
  else if (message.length > 500) e.message = "الرسالة أطول من 500 حرف.";
  return e;
}

/** "Send the owner a question": the inquiry goes to the listing's agent or owner. Errors show per field. */
export default function InquiryForm({ propertyId, idPrefix = "inquiry" }: { propertyId: string; idPrefix?: string }) {
  const { showToast } = useToast();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const change = (field: Field) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      document.getElementById(`${idPrefix}-${first}`)?.focus();
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post("/property-inquiry/add-property-inquiry", {
        property: propertyId,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        message: values.message.trim(),
      });
      showToast("أُرسل استفسارك إلى المالك.", "success");
      setValues(EMPTY);
    } catch (err) {
      setSubmitError(getErrorMessage(err, "تعذر إرسال الاستفسار. حاول مرة أخرى."));
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name: Field) => ({
    id: `${idPrefix}-${name}`,
    value: values[name],
    onChange: change(name),
    error: Boolean(errors[name]),
    helperText: errors[name],
    required: true,
    fullWidth: true,
    disabled: submitting,
  });

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {submitError && <Alert severity="error">{submitError}</Alert>}
      <TextField label="الاسم" {...field("name")} slotProps={{ htmlInput: { maxLength: 50, autoComplete: "name" } }} />
      <TextField
        label="البريد الإلكتروني"
        type="email"
        {...field("email")}
        slotProps={{ htmlInput: { autoComplete: "email" } }}
      />
      <TextField
        label="رقم الهاتف"
        type="tel"
        {...field("phone")}
        slotProps={{ htmlInput: { maxLength: 30, autoComplete: "tel", inputMode: "tel" } }}
      />
      <TextField
        label="رسالتك"
        multiline
        minRows={3}
        {...field("message")}
        helperText={errors.message ?? `${values.message.length} / 500`}
        slotProps={{ htmlInput: { maxLength: 500 } }}
      />
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={submitting}
        startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : undefined}
      >
        {submitting ? "جاري الإرسال…" : "إرسال الاستفسار"}
      </Button>
    </Box>
  );
}
