"use client";

import { Suspense, useContext, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormik } from "formik";
import * as yup from "yup";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MuiLink from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import GoogleButton from "@/components/googleButton";
import { AuthContext } from "@/app/context/AuthContext";
import { useToast } from "@/shared/provider/ToastProvider";
import { API_URL } from "@/shared/utils/auth";
import { emailSchema } from "@/shared/utils/authValidation";
import AuthLayout, { AuthDivider, AuthForm } from "@/shared/ui/auth/AuthLayout";
import LoadingState from "@/shared/ui/LoadingState";
import PasswordField from "@/shared/ui/auth/PasswordField";
import { RESEND_FAILED_MESSAGE, RESEND_SENT_MESSAGE, resendConfirmation, safeRedirect } from "@/shared/ui/auth/authApi";

// Errors the Google sign-in sends back as ?error= (server/modules/Auth/googleAuthRouter.js).
const GOOGLE_ERRORS: Record<string, string> = {
  email_already_registered: "هذا البريد مسجّل بكلمة مرور. سجّل الدخول بالبريد الإلكتروني وكلمة المرور بدلًا من Google.",
  google_failed: "تعذّر تسجيل الدخول بحساب Google. حاول مرة أخرى، وإن تكرر الخطأ فتواصل معنا.",
  server_error: "حدث خطأ أثناء تسجيل الدخول بحساب Google. حاول مرة أخرى بعد قليل.",
};

const validationSchema = yup.object({
  email: emailSchema,
  // Only "required" here: the length rules belong to choosing a password, not to typing an existing one.
  password: yup.string().required("اكتب كلمة المرور."),
});

type Problem = { kind: "message"; text: string } | { kind: "unconfirmed"; email: string } | { kind: "inactive" };

/** Maps the login endpoint's English errors (authController.login) to what the user should do next. */
function problemFor(status: number, serverMessage: string, email: string): Problem {
  if (/not confirmed|confirm/i.test(serverMessage)) return { kind: "unconfirmed", email };
  if (/inactive/i.test(serverMessage)) return { kind: "inactive" };
  if (/google/i.test(serverMessage)) {
    return { kind: "message", text: "هذا الحساب مسجّل عبر Google. استخدم زر «المتابعة باستخدام Google»." };
  }
  if (status === 400 || status === 401 || status === 404) {
    return { kind: "message", text: "البريد الإلكتروني أو كلمة المرور غير صحيحة." };
  }
  return { kind: "message", text: "تعذّر تسجيل الدخول الآن. تحقق من اتصالك ثم حاول مرة أخرى." };
}

function LoginPage() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const redirectTo = safeRedirect(searchParams.get("redirect"));
  const googleError = GOOGLE_ERRORS[searchParams.get("error") ?? ""];

  const [problem, setProblem] = useState<Problem | null>(null);
  const [resend, setResend] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [redirecting, setRedirecting] = useState(false);

  const formik = useFormik({
    initialValues: { email: searchParams.get("email") ?? "", password: "" },
    validationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      setProblem(null);
      setResend("idle");
      try {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(values),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setProblem(problemFor(res.status, typeof data?.message === "string" ? data.message : "", values.email));
          return;
        }

        setRedirecting(true);
        await auth?.setSession(data.token);
        showToast("تم تسجيل الدخول", "success");
        let role: string | undefined;
        try {
          role = JSON.parse(atob(data.token.split(".")[1]))?.role;
        } catch {
          role = undefined;
        }
        router.push(redirectTo ?? (role === "admin" ? "/admin/dashboard" : "/"));
      } catch {
        setRedirecting(false);
        setProblem({ kind: "message", text: "تعذّر الاتصال بالخادم. تحقق من اتصالك ثم حاول مرة أخرى." });
      }
    },
  });

  const onResend = async (email: string) => {
    setResend("sending");
    setResend((await resendConfirmation(email)) ? "sent" : "failed");
  };

  if (auth?.user && !redirecting) {
    return (
      <AuthLayout title="أنت مسجّل الدخول" description={`مسجّل الدخول باسم ${auth.user.userName || auth.user.email}.`}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Button component={Link} href={redirectTo ?? "/"} variant="contained" fullWidth>
            {redirectTo ? "متابعة" : "الذهاب إلى الصفحة الرئيسية"}
          </Button>
          <Button onClick={() => auth.logout()} variant="outlined" color="inherit" fullWidth>
            تسجيل الخروج للدخول بحساب آخر
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  const fieldError = (name: "email" | "password") =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined;

  return (
    <AuthLayout
      title="تسجيل الدخول"
      description={redirectTo ? "سجّل الدخول لتكمل ما بدأته." : "أهلًا بعودتك إلى سكنلي."}
      footer={
        <>
          ليس لديك حساب؟{" "}
          <MuiLink component={Link} href="/register" sx={{ fontWeight: 600 }}>
            إنشاء حساب
          </MuiLink>
        </>
      }
    >
      <div aria-live="polite">
        {googleError && !problem && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
            {googleError}
          </Alert>
        )}
        {problem?.kind === "message" && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
            {problem.text}
          </Alert>
        )}
        {problem?.kind === "inactive" && (
          <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
            هذا الحساب موقوف.{" "}
            <MuiLink component={Link} href="/contact">
              تواصل معنا
            </MuiLink>{" "}
            لإعادة تفعيله.
          </Alert>
        )}
        {problem?.kind === "unconfirmed" && (
          <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              لم تؤكد بريدك الإلكتروني بعد.
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              افتح رابط التأكيد الذي أرسلناه إلى بريدك ثم سجّل الدخول.
            </Typography>
            {resend === "sent" ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                {RESEND_SENT_MESSAGE}
              </Typography>
            ) : (
              <Button
                size="small"
                onClick={() => onResend(problem.email)}
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

      <AuthForm onSubmit={formik.handleSubmit}>
        <TextField
          id="email"
          name="email"
          label="البريد الإلكتروني"
          type="email"
          autoComplete="email"
          required
          fullWidth
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(fieldError("email"))}
          helperText={fieldError("email")}
          slotProps={{ htmlInput: { dir: "ltr" } }}
        />
        <Box>
          <PasswordField
            id="password"
            name="password"
            label="كلمة المرور"
            autoComplete="current-password"
            required
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(fieldError("password"))}
            helperText={fieldError("password")}
          />
          <MuiLink
            component={Link}
            href="/resetPassword"
            variant="body2"
            sx={{ display: "inline-block", mt: 1, fontWeight: 500 }}
          >
            نسيت كلمة المرور؟
          </MuiLink>
        </Box>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={formik.isSubmitting || redirecting}
          aria-busy={formik.isSubmitting || undefined}
          startIcon={formik.isSubmitting ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
        >
          {formik.isSubmitting ? "جارٍ تسجيل الدخول…" : "تسجيل الدخول"}
        </Button>
      </AuthForm>

      <AuthDivider />
      <GoogleButton redirect={redirectTo} />
    </AuthLayout>
  );
}

export default function LoginPageWithSuspense() {
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginPage />
    </Suspense>
  );
}
