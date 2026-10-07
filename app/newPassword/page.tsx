"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MuiLink from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import { useToast } from "@/shared/provider/ToastProvider";
import { API_URL } from "@/shared/utils/auth";
import { emailSchema, passwordSchema, RESET_EMAIL_KEY } from "@/shared/utils/authValidation";
import AuthLayout, { AuthForm } from "@/shared/ui/auth/AuthLayout";
import PasswordField from "@/shared/ui/auth/PasswordField";
import PasswordRules from "@/shared/ui/auth/PasswordRules";
import { resetErrorMessage } from "@/shared/ui/auth/authApi";

const validationSchema = yup.object({
  email: emailSchema,
  code: yup.string().trim().required("اكتب الرمز الذي وصلك على البريد."),
  newPassword: passwordSchema,
  confirmNewPassword: yup
    .string()
    .required("أعد كتابة كلمة المرور الجديدة.")
    .oneOf([yup.ref("newPassword")], "كلمتا المرور غير متطابقتين."),
});

type Field = "email" | "code" | "newPassword" | "confirmNewPassword";

/** For users who already have a reset code: email, code and the new password on one form. */
export default function NewPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { email: "", code: "", newPassword: "", confirmNewPassword: "" },
    validationSchema,
    validateOnChange: false,
    onSubmit: async (values) => {
      setError(null);
      try {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...values, code: values.code.trim() }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(resetErrorMessage(res.status, typeof data?.message === "string" ? data.message : ""));
          return;
        }
        try {
          sessionStorage.removeItem(RESET_EMAIL_KEY);
        } catch {
          // ignore
        }
        showToast("تم تغيير كلمة المرور. سجّل الدخول بكلمة المرور الجديدة.", "success");
        router.push(`/login?email=${encodeURIComponent(values.email)}`);
      } catch {
        setError("تعذّر الاتصال بالخادم. تحقق من اتصالك ثم حاول مرة أخرى.");
      }
    },
  });

  // Carry the email over from the forgot-password step (?email=… or sessionStorage).
  useEffect(() => {
    let email = new URLSearchParams(window.location.search).get("email") || "";
    if (!email) {
      try {
        email = sessionStorage.getItem(RESET_EMAIL_KEY) || "";
      } catch {
        email = "";
      }
    }
    if (email) formik.setFieldValue("email", email, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fieldError = (name: Field) => (formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined);
  const field = (name: Field) => ({
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
      title="تعيين كلمة مرور جديدة"
      description="اكتب بريدك والرمز الذي وصلك، ثم اختر كلمة مرور جديدة."
      footer={
        <>
          لم يصلك رمز؟{" "}
          <MuiLink component={Link} href="/resetPassword" sx={{ fontWeight: 600 }}>
            اطلب رمزًا
          </MuiLink>
        </>
      }
    >
      <div aria-live="polite">
        {error && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </div>
      <AuthForm onSubmit={formik.handleSubmit}>
        <TextField
          {...field("email")}
          label="البريد الإلكتروني"
          type="email"
          autoComplete="email"
          helperText={fieldError("email")}
          slotProps={{ htmlInput: { dir: "ltr" } }}
        />
        <TextField
          {...field("code")}
          label="رمز التحقق"
          autoComplete="one-time-code"
          helperText={fieldError("code")}
          slotProps={{ htmlInput: { dir: "ltr" } }}
        />
        <PasswordField
          {...field("newPassword")}
          label="كلمة المرور الجديدة"
          autoComplete="new-password"
          helperText={
            <>
              <PasswordRules id="new-password-rules" value={formik.values.newPassword} />
              {fieldError("newPassword") && (
                <Box component="span" sx={{ display: "block", mt: 0.75 }}>
                  {fieldError("newPassword")}
                </Box>
              )}
            </>
          }
          slotProps={{ formHelperText: { component: "div" } }}
        />
        <PasswordField
          {...field("confirmNewPassword")}
          label="تأكيد كلمة المرور الجديدة"
          autoComplete="new-password"
          helperText={fieldError("confirmNewPassword")}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={formik.isSubmitting}
          aria-busy={formik.isSubmitting || undefined}
          startIcon={formik.isSubmitting ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
          sx={{ height: 44 }}
        >
          {formik.isSubmitting ? "جارٍ الحفظ…" : "حفظ كلمة المرور"}
        </Button>
      </AuthForm>
    </AuthLayout>
  );
}
