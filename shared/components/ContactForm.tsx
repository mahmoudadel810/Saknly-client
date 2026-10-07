"use client";

import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { api } from "@/shared/services/api";
import { useToast } from "@/shared/provider/ToastProvider";

type Field = "name" | "email" | "subject" | "message";
type Values = Record<Field, string>;

const EMPTY: Values = { name: "", email: "", subject: "", message: "" };

// Limits from server/modules/contact/contactValidation.js (subject 100, message 2000); the name cap is ours.
const LIMITS = { name: 50, subject: 100, message: 2000 } as const;

// The server's email pattern (contactValidation.js), so a valid-looking address is not rejected after sending.
const EMAIL_PATTERN = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

function validate(values: Values): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  const name = values.name.trim();
  const subject = values.subject.trim();
  const message = values.message.trim();
  if (!name) errors.name = "اكتب اسمك.";
  else if (name.length < 2) errors.name = "الاسم قصير جدًا.";
  if (!values.email.trim()) errors.email = "اكتب بريدك الإلكتروني لنرد عليك.";
  else if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "البريد الإلكتروني غير صحيح. مثال: name@example.com";
  if (!subject) errors.subject = "اكتب موضوع الرسالة.";
  if (!message) errors.message = "اكتب رسالتك.";
  else if (message.length < 10) errors.message = "الرسالة قصيرة جدًا. اكتب 10 أحرف على الأقل.";
  return errors;
}

/** The contact form: POST /contact/contact-us. Errors are shown per field; the result is announced. */
export default function ContactForm() {
  const { showToast } = useToast();
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<"sent" | "failed" | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as Field;
    setValues((prev) => ({ ...prev, [name]: e.target.value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    if (result) setResult(null);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sending) return;
    const found = validate(values);
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setSending(true);
    setResult(null);
    try {
      await api.post("/contact/contact-us", {
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });
      setValues(EMPTY);
      setResult("sent");
      showToast("أُرسلت رسالتك", "success");
    } catch {
      // The server's validation messages are in English, so they are not shown; ours above match its rules.
      setResult("failed");
    } finally {
      setSending(false);
    }
  };

  const field = (name: Field) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    onChange,
    error: Boolean(errors[name]),
    fullWidth: true,
    required: true,
  });

  return (
    <Box component="form" onSubmit={onSubmit} noValidate sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          {...field("name")}
          label="الاسم"
          autoComplete="name"
          helperText={errors.name}
          slotProps={{ htmlInput: { maxLength: LIMITS.name } }}
        />
        <TextField
          {...field("email")}
          label="البريد الإلكتروني"
          type="email"
          autoComplete="email"
          helperText={errors.email ?? "نرد على هذا البريد."}
          slotProps={{ htmlInput: { dir: "ltr" } }}
        />
      </div>
      <TextField
        {...field("subject")}
        label="الموضوع"
        helperText={errors.subject ?? `حتى ${LIMITS.subject} حرف.`}
        slotProps={{ htmlInput: { maxLength: LIMITS.subject } }}
      />
      <TextField
        {...field("message")}
        label="الرسالة"
        multiline
        minRows={5}
        helperText={errors.message ?? `${values.message.length} / ${LIMITS.message}`}
        slotProps={{ htmlInput: { maxLength: LIMITS.message } }}
      />

      <div aria-live="polite">
        {result === "sent" && (
          <Alert severity="success" variant="outlined">
            وصلتنا رسالتك، وسنرد عليك على بريدك الإلكتروني.
          </Alert>
        )}
        {result === "failed" && (
          <Alert severity="error" variant="outlined">
            لم نتمكن من إرسال رسالتك. تحقق من اتصالك ثم حاول مرة أخرى.
          </Alert>
        )}
      </div>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          disabled={sending}
          aria-busy={sending || undefined}
          startIcon={sending ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
          sx={{ minWidth: 160 }}
        >
          {sending ? "جارٍ الإرسال…" : "إرسال الرسالة"}
        </Button>
      </Box>
    </Box>
  );
}
