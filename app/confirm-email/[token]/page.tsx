"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlined from "@mui/icons-material/ErrorOutlineOutlined";
import { API_URL } from "@/shared/utils/auth";
import AuthLayout, { AuthForm } from "@/shared/ui/auth/AuthLayout";
import LoadingState from "@/shared/ui/LoadingState";
import { RESEND_FAILED_MESSAGE, RESEND_SENT_MESSAGE, resendConfirmation } from "@/shared/ui/auth/authApi";

type Status = "loading" | "confirmed" | "invalid" | "offline";

/** Opens from the confirmation email: GET /auth/confirm-email/:token, then login or a new link. */
export default function ConfirmEmailPage() {
  const params = useParams();
  const token = typeof params.token === "string" ? params.token : "";
  const [status, setStatus] = useState<Status>("loading");
  const started = useRef(false);

  const verify = async () => {
    setStatus("loading");
    try {
      const res = await fetch(`${API_URL}/auth/confirm-email/${encodeURIComponent(token)}`);
      setStatus(res.ok ? "confirmed" : "invalid");
    } catch {
      setStatus("offline");
    }
  };

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === "loading") {
    return (
      <AuthLayout title="تأكيد البريد الإلكتروني">
        <LoadingState label="جارٍ تأكيد بريدك…" compact />
      </AuthLayout>
    );
  }

  if (status === "confirmed") {
    return (
      <AuthLayout title="تم تأكيد بريدك">
        <Box sx={{ textAlign: "center" }}>
          <CheckCircleOutlined aria-hidden sx={{ fontSize: 40, color: "success.main" }} />
          <Typography variant="body1" sx={{ mt: 1, mb: 3 }}>
            حسابك جاهز. سجّل الدخول لتبدأ.
          </Typography>
          <Button component={Link} href="/login" variant="contained" fullWidth sx={{ height: 44 }}>
            تسجيل الدخول
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  if (status === "offline") {
    return (
      <AuthLayout title="تأكيد البريد الإلكتروني">
        <Box sx={{ textAlign: "center" }}>
          <ErrorOutlineOutlined aria-hidden sx={{ fontSize: 40, color: "error.main" }} />
          <Typography variant="body1" sx={{ mt: 1, mb: 3 }}>
            تعذّر الاتصال بالخادم. تحقق من اتصالك ثم حاول مرة أخرى.
          </Typography>
          <Button onClick={verify} variant="contained" fullWidth sx={{ height: 44 }}>
            إعادة المحاولة
          </Button>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="الرابط غير صالح"
      description="ربما انتهت صلاحية رابط التأكيد أو استُخدم من قبل. إن كان بريدك مؤكدًا فسجّل الدخول، أو اطلب رابطًا جديدًا."
    >
      <ResendForm />
      <Button component={Link} href="/login" variant="text" fullWidth sx={{ mt: 1.5 }}>
        تسجيل الدخول
      </Button>
    </AuthLayout>
  );
}

function ResendForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("اكتب بريدًا إلكترونيًا صحيحًا.");
      return;
    }
    setError(null);
    setState("sending");
    setState((await resendConfirmation(email.trim())) ? "sent" : "failed");
  };

  return (
    <AuthForm onSubmit={onSubmit} label="طلب رابط تأكيد جديد">
      <div aria-live="polite">
        {state === "sent" && (
          <Alert severity="success" variant="outlined">
            {RESEND_SENT_MESSAGE}
          </Alert>
        )}
        {state === "failed" && (
          <Alert severity="error" variant="outlined">
            {RESEND_FAILED_MESSAGE}
          </Alert>
        )}
      </div>
      <TextField
        id="resend-email"
        label="البريد الإلكتروني"
        type="email"
        autoComplete="email"
        required
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={Boolean(error)}
        helperText={error}
        slotProps={{ htmlInput: { dir: "ltr" } }}
      />
      <Button
        type="submit"
        variant="contained"
        fullWidth
        disabled={state === "sending"}
        startIcon={state === "sending" ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
        sx={{ height: 44 }}
      >
        {state === "sending" ? "جارٍ الإرسال…" : "إرسال رابط جديد"}
      </Button>
    </AuthForm>
  );
}
