"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFormik } from "formik";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MuiLink from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import GoogleButton from "@/components/googleButton";
import { API_URL } from "@/shared/utils/auth";
import { emailSchema, passwordSchema, phoneSchema } from "@/shared/utils/authValidation";
import AuthLayout, { AuthDivider, AuthForm } from "@/shared/ui/auth/AuthLayout";
import PasswordField from "@/shared/ui/auth/PasswordField";
import PasswordRules from "@/shared/ui/auth/PasswordRules";
import { RESEND_FAILED_MESSAGE, RESEND_SENT_MESSAGE, resendConfirmation } from "@/shared/ui/auth/authApi";

// Mirrors server/modules/Auth/authValidation.js (registerValidator).
const validationSchema = yup.object({
  userName: yup
    .string()
    .trim()
    .required("اكتب اسم المستخدم.")
    .min(3, "اسم المستخدم من 3 إلى 30 حرفًا.")
    .max(30, "اسم المستخدم من 3 إلى 30 حرفًا.")
    .matches(/^[a-zA-Z؀-ۿ][a-zA-Z؀-ۿ0-9 ]*$/, "ابدأ بحرف عربي أو إنجليزي، واستخدم حروفًا وأرقامًا ومسافات فقط."),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: yup
    .string()
    .required("أعد كتابة كلمة المرور.")
    .oneOf([yup.ref("password")], "كلمتا المرور غير متطابقتين."),
  phone: phoneSchema,
  address: yup.string().trim().required("اكتب عنوانك.").max(200, "العنوان حتى 200 حرف."),
});

type Values = yup.InferType<typeof validationSchema>;
type Field = keyof Values;

const FIELDS_IN_ORDER: Field[] = ["userName", "email", "password", "confirmPassword", "phone", "address"];

export default function RegisterPage() {
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [existingEmail, setExistingEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [resend, setResend] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const formik = useFormik<Values>({
    initialValues: { userName: "", email: "", password: "", confirmPassword: "", phone: "", address: "" },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      setFormError(null);
      setExistingEmail(null);
      setResend("idle");
      try {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, userName: values.userName.trim(), address: values.address.trim() }),
        });

        if (res.status === 409) {
          // Any existing account, confirmed or not: the server does not say which.
          formik.setFieldError("email", "هذا البريد مسجّل بالفعل.");
          setExistingEmail(values.email);
          return;
        }
        if (!res.ok) {
          setFormError(
            res.status === 400
              ? "راجع البيانات المكتوبة ثم حاول مرة أخرى."
              : "تعذّر إنشاء الحساب الآن. حاول مرة أخرى بعد قليل.",
          );
          return;
        }
        setRegisteredEmail(values.email);
      } catch {
        setFormError("تعذّر الاتصال بالخادم. تحقق من اتصالك ثم حاول مرة أخرى.");
      }
    },
  });

  const onResend = async (email: string) => {
    setResend("sending");
    setResend((await resendConfirmation(email)) ? "sent" : "failed");
  };

  // Focus the first invalid field after a submit attempt.
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = await formik.validateForm();
    formik.setTouched(Object.fromEntries(FIELDS_IN_ORDER.map((f) => [f, true])), false);
    const first = FIELDS_IN_ORDER.find((f) => errors[f]);
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }
    formik.submitForm();
  };

  if (registeredEmail) {
    return (
      <AuthLayout title="تحقق من بريدك الإلكتروني">
        <Box sx={{ textAlign: "center" }}>
          <MarkEmailReadOutlined aria-hidden sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="body1" sx={{ mt: 1 }}>
            أنشأنا حسابك وأرسلنا رابط التأكيد إلى{" "}
            <Box component="strong" dir="ltr" sx={{ display: "inline-block" }}>
              {registeredEmail}
            </Box>
            . افتح الرابط لتفعيل حسابك ثم سجّل الدخول.
          </Typography>
          <div aria-live="polite">
            {resend === "sent" && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {RESEND_SENT_MESSAGE}
              </Typography>
            )}
            {resend === "failed" && (
              <Typography variant="body2" sx={{ mt: 2, color: "error.main" }}>
                {RESEND_FAILED_MESSAGE}
              </Typography>
            )}
          </div>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 3 }}>
            <Button component={Link} href={`/login?email=${encodeURIComponent(registeredEmail)}`} variant="contained">
              الذهاب إلى تسجيل الدخول
            </Button>
            <Button
              onClick={() => onResend(registeredEmail)}
              disabled={resend === "sending" || resend === "sent"}
              variant="outlined"
              color="inherit"
            >
              {resend === "sending" ? "جارٍ الإرسال…" : "لم يصلني الرابط، أعد الإرسال"}
            </Button>
          </Box>
        </Box>
      </AuthLayout>
    );
  }

  const fieldError = (name: Field) => (formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined);
  const textField = (name: Field) => ({
    id: name,
    name,
    value: formik.values[name],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(fieldError(name)),
    required: true,
    fullWidth: true,
  });

  return (
    <AuthLayout
      title="إنشاء حساب"
      description="أنشئ حسابًا لتنشر عقارك وتحفظ العقارات التي تعجبك."
      footer={
        <>
          لديك حساب بالفعل؟{" "}
          <MuiLink component={Link} href="/login" sx={{ fontWeight: 600 }}>
            تسجيل الدخول
          </MuiLink>
        </>
      }
    >
      <GoogleButton />
      <AuthDivider />

      <div aria-live="polite">
        {formError && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}
        {existingEmail && (
          <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              لديك حساب بهذا البريد.
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              <MuiLink component={Link} href={`/login?email=${encodeURIComponent(existingEmail)}`}>
                سجّل الدخول
              </MuiLink>
              . وإن لم تؤكد بريدك بعد، أعد إرسال رابط التأكيد.
            </Typography>
            {resend === "sent" ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {RESEND_SENT_MESSAGE}
              </Typography>
            ) : (
              <Button
                size="small"
                onClick={() => onResend(existingEmail)}
                disabled={resend === "sending"}
                sx={{ mt: 1, px: 0 }}
              >
                {resend === "sending" ? "جارٍ الإرسال…" : "إعادة إرسال رابط التأكيد"}
              </Button>
            )}
            {resend === "failed" && (
              <Typography variant="body2" sx={{ mt: 0.5, color: "error.main" }}>
                {RESEND_FAILED_MESSAGE}
              </Typography>
            )}
          </Alert>
        )}
      </div>

      <AuthForm onSubmit={onSubmit}>
        <TextField
          {...textField("userName")}
          label="اسم المستخدم"
          autoComplete="username"
          helperText={fieldError("userName") ?? "يظهر مع تعليقاتك. من 3 إلى 30 حرفًا."}
        />
        <TextField
          {...textField("email")}
          label="البريد الإلكتروني"
          type="email"
          autoComplete="email"
          helperText={fieldError("email") ?? "سنرسل إليه رابط تأكيد الحساب."}
          slotProps={{ htmlInput: { dir: "ltr" } }}
        />
        <PasswordField
          {...textField("password")}
          label="كلمة المرور"
          autoComplete="new-password"
          // The rules sit in the helper text, so the field's aria-describedby already points at them.
          helperText={
            <>
              <PasswordRules id="password-rules" value={formik.values.password} />
              {fieldError("password") && (
                <Box component="span" sx={{ display: "block", mt: 0.75 }}>
                  {fieldError("password")}
                </Box>
              )}
            </>
          }
          slotProps={{ formHelperText: { component: "div" } }}
        />
        <PasswordField
          {...textField("confirmPassword")}
          label="تأكيد كلمة المرور"
          autoComplete="new-password"
          helperText={fieldError("confirmPassword")}
        />
        <TextField
          {...textField("phone")}
          label="رقم الهاتف"
          type="tel"
          autoComplete="tel-national"
          helperText={fieldError("phone") ?? "11 رقمًا يبدأ بـ 01، مثل 01012345678."}
          slotProps={{ htmlInput: { dir: "ltr", inputMode: "numeric", maxLength: 11 } }}
        />
        <TextField
          {...textField("address")}
          label="العنوان"
          autoComplete="street-address"
          helperText={fieldError("address") ?? "المدينة والحي، مثل: شبين الكوم، حي الجامعة."}
          slotProps={{ htmlInput: { maxLength: 200 } }}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={formik.isSubmitting}
          aria-busy={formik.isSubmitting || undefined}
          startIcon={formik.isSubmitting ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
          sx={{ height: 44, mt: 0.5 }}
        >
          {formik.isSubmitting ? "جارٍ إنشاء الحساب…" : "إنشاء حساب"}
        </Button>
      </AuthForm>
    </AuthLayout>
  );
}
