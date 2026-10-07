"use client";

import { useState } from "react";
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
import Typography from "@mui/material/Typography";
import { useToast } from "@/shared/provider/ToastProvider";
import { API_URL } from "@/shared/utils/auth";
import { emailSchema, passwordSchema, RESET_EMAIL_KEY } from "@/shared/utils/authValidation";
import AuthLayout, { AuthForm } from "@/shared/ui/auth/AuthLayout";
import PasswordField from "@/shared/ui/auth/PasswordField";
import PasswordRules from "@/shared/ui/auth/PasswordRules";
import { resetErrorMessage } from "@/shared/ui/auth/authApi";

const emailStepSchema = yup.object({ email: emailSchema });

const resetStepSchema = yup.object({
  code: yup.string().trim().required("اكتب الرمز الذي وصلك على البريد."),
  newPassword: passwordSchema,
  confirmNewPassword: yup
    .string()
    .required("أعد كتابة كلمة المرور الجديدة.")
    .oneOf([yup.ref("newPassword")], "كلمتا المرور غير متطابقتين."),
});

/** POST /auth/forgot-password. The server answers 200 whether or not the account exists; 503 if mail failed. */
async function requestCode(email: string): Promise<"sent" | "mail-failed" | "failed"> {
  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) return "sent";
    return res.status === 503 ? "mail-failed" : "failed";
  } catch {
    return "failed";
  }
}

const REQUEST_ERRORS = {
  "mail-failed": "لم نتمكن من إرسال الرمز الآن. حاول مرة أخرى بعد قليل.",
  failed: "تعذّر إرسال الرمز. تحقق من البريد ومن اتصالك ثم حاول مرة أخرى.",
} as const;

/** Step 1 asks for the email, step 2 for the emailed code and the new password. */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState<"idle" | "sending" | "sent">("idle");

  const emailForm = useFormik({
    initialValues: { email: "" },
    validationSchema: emailStepSchema,
    validateOnChange: false,
    onSubmit: async (values) => {
      setError(null);
      const result = await requestCode(values.email);
      if (result !== "sent") {
        setError(REQUEST_ERRORS[result]);
        return;
      }
      try {
        sessionStorage.setItem(RESET_EMAIL_KEY, values.email);
      } catch {
        // sessionStorage unavailable; the email stays in component state.
      }
      setEmail(values.email);
    },
  });

  const resetForm = useFormik({
    initialValues: { code: "", newPassword: "", confirmNewPassword: "" },
    validationSchema: resetStepSchema,
    validateOnChange: false,
    onSubmit: async (values) => {
      setError(null);
      try {
        const res = await fetch(`${API_URL}/auth/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, ...values, code: values.code.trim() }),
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
        router.push(email ? `/login?email=${encodeURIComponent(email)}` : "/login");
      } catch {
        setError("تعذّر الاتصال بالخادم. تحقق من اتصالك ثم حاول مرة أخرى.");
      }
    },
  });

  const resend = async () => {
    if (!email) return;
    setResent("sending");
    setError(null);
    const result = await requestCode(email);
    if (result === "sent") setResent("sent");
    else {
      setResent("idle");
      setError(REQUEST_ERRORS[result]);
    }
  };

  const footer = (
    <MuiLink component={Link} href="/login" sx={{ fontWeight: 600 }}>
      العودة إلى تسجيل الدخول
    </MuiLink>
  );

  if (!email) {
    const emailError = emailForm.touched.email ? emailForm.errors.email : undefined;
    return (
      <AuthLayout
        title="استعادة كلمة المرور"
        description="اكتب بريدك الإلكتروني وسنرسل إليك رمزًا لتعيين كلمة مرور جديدة."
        footer={footer}
      >
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
          الخطوة 1 من 2
        </Typography>
        <div aria-live="polite">
          {error && (
            <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
        </div>
        <AuthForm onSubmit={emailForm.handleSubmit}>
          <TextField
            id="email"
            name="email"
            label="البريد الإلكتروني"
            type="email"
            autoComplete="email"
            required
            fullWidth
            value={emailForm.values.email}
            onChange={emailForm.handleChange}
            onBlur={emailForm.handleBlur}
            error={Boolean(emailError)}
            helperText={emailError}
            slotProps={{ htmlInput: { dir: "ltr" } }}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={emailForm.isSubmitting}
            aria-busy={emailForm.isSubmitting || undefined}
            startIcon={emailForm.isSubmitting ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
            sx={{ height: 44 }}
          >
            {emailForm.isSubmitting ? "جارٍ الإرسال…" : "إرسال الرمز"}
          </Button>
          <MuiLink component={Link} href="/newPassword" variant="body2" sx={{ alignSelf: "center" }}>
            لديك رمز بالفعل؟
          </MuiLink>
        </AuthForm>
      </AuthLayout>
    );
  }

  const fieldError = (name: "code" | "newPassword" | "confirmNewPassword") =>
    resetForm.touched[name] && resetForm.errors[name] ? resetForm.errors[name] : undefined;

  return (
    <AuthLayout
      title="تعيين كلمة مرور جديدة"
      description={
        <>
          إن كان لهذا البريد حساب، فقد أرسلنا رمزًا إلى{" "}
          <Box component="strong" dir="ltr" sx={{ display: "inline-block" }}>
            {email}
          </Box>
          .
        </>
      }
      footer={footer}
    >
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mb: 2 }}>
        الخطوة 2 من 2
      </Typography>
      <div aria-live="polite">
        {error && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {resent === "sent" && !error && (
          <Alert severity="success" variant="outlined" sx={{ mb: 2 }}>
            أرسلنا رمزًا جديدًا. استخدم آخر رمز وصلك.
          </Alert>
        )}
      </div>
      <AuthForm onSubmit={resetForm.handleSubmit}>
        <TextField
          id="code"
          name="code"
          label="رمز التحقق"
          autoComplete="one-time-code"
          required
          fullWidth
          value={resetForm.values.code}
          onChange={resetForm.handleChange}
          onBlur={resetForm.handleBlur}
          error={Boolean(fieldError("code"))}
          helperText={fieldError("code") ?? "تجده في الرسالة التي أرسلناها. افحص مجلد الرسائل غير المرغوب فيها."}
          slotProps={{ htmlInput: { dir: "ltr" } }}
        />
        <PasswordField
          id="newPassword"
          name="newPassword"
          label="كلمة المرور الجديدة"
          autoComplete="new-password"
          required
          value={resetForm.values.newPassword}
          onChange={resetForm.handleChange}
          onBlur={resetForm.handleBlur}
          error={Boolean(fieldError("newPassword"))}
          helperText={
            <>
              <PasswordRules id="new-password-rules" value={resetForm.values.newPassword} />
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
          id="confirmNewPassword"
          name="confirmNewPassword"
          label="تأكيد كلمة المرور الجديدة"
          autoComplete="new-password"
          required
          value={resetForm.values.confirmNewPassword}
          onChange={resetForm.handleChange}
          onBlur={resetForm.handleBlur}
          error={Boolean(fieldError("confirmNewPassword"))}
          helperText={fieldError("confirmNewPassword")}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={resetForm.isSubmitting}
          aria-busy={resetForm.isSubmitting || undefined}
          startIcon={resetForm.isSubmitting ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
          sx={{ height: 44 }}
        >
          {resetForm.isSubmitting ? "جارٍ الحفظ…" : "حفظ كلمة المرور"}
        </Button>
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 1 }}>
          <Button size="small" onClick={resend} disabled={resent === "sending"} sx={{ px: 0 }}>
            {resent === "sending" ? "جارٍ الإرسال…" : "أعد إرسال الرمز"}
          </Button>
          <Button
            size="small"
            color="inherit"
            onClick={() => {
              setEmail(null);
              setError(null);
              setResent("idle");
            }}
            sx={{ px: 0 }}
          >
            تغيير البريد الإلكتروني
          </Button>
        </Box>
      </AuthForm>
    </AuthLayout>
  );
}
