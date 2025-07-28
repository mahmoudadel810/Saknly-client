// app/reset/page.tsx
'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useToast } from '@/shared/provider/ToastProvider';
import { useRouter } from 'next/navigation';

// Import non-MUI components directly
import { Visibility, VisibilityOff } from '@mui/icons-material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import { textFieldStyles } from '@/shared/styles/textFieldStyle';

// Dynamically import MUI components with SSR disabled
const Box = dynamic(() => import('@mui/material/Box'), { ssr: false });
const TextField = dynamic(() => import('@mui/material/TextField'), { ssr: false });
const Button = dynamic(() => import('@mui/material/Button'), { ssr: false });
const Typography = dynamic(() => import('@mui/material/Typography'), { ssr: false });
const InputAdornment = dynamic(() => import('@mui/material/InputAdornment'), { ssr: false });
const IconButton = dynamic(() => import('@mui/material/IconButton'), { ssr: false });
const Paper = dynamic(() => import('@mui/material/Paper'), { ssr: false });
const Container = dynamic(() => import('@mui/material/Container'), { ssr: false });
const CircularProgress = dynamic(() => import('@mui/material/CircularProgress'), { ssr: false });

// Step 1: Email validation schema
const emailValidationSchema = yup.object({
  email: yup
    .string()
    .email('البريد الإلكتروني غير صحيح')
    .required('البريد الإلكتروني مطلوب'),
});

// Step 2: Reset password validation schema
const resetPasswordValidationSchema = yup.object({
  code: yup
    .string()
    .required('كود التحقق مطلوب'),
  newPassword: yup
    .string()
    .min(6, "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل")
    .matches(/[A-Z]/, "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل")
    .matches(/[a-z]/, "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل")
    .matches(/[0-9]/, "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل")
    .required("كلمة المرور مطلوبة"),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'كلمة المرور غير متطابقة')
    .required('تأكيد كلمة المرور مطلوب'),
});

// Create a client-side only component
const ResetPasswordPage = () => {
  const [currentStep, setCurrentStep] = useState(1); // 1: Email step, 2: Reset password step
  const [userEmail, setUserEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  // Step 1: Email form
  const emailFormik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: emailValidationSchema,
    validateOnBlur: false,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: values.email }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || 'البريد الإلكتروني غير موجود');
        }

        setUserEmail(values.email);
        showToast('تم إرسال كود التحقق إلى بريدك الإلكتروني', 'success');
        setCurrentStep(2); // Move to reset password step
      } catch (err: any) {
        showToast(err.message || 'البريد الإلكتروني غير موجود', 'error');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Step 2: Reset password form
  const resetPasswordFormik = useFormik({
    initialValues: {
      code: '',
      newPassword: '',
      confirmNewPassword: '',
    },
    validationSchema: resetPasswordValidationSchema,
    validateOnBlur: false,
    validateOnChange: true,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: values.code,
            newPassword: values.newPassword,
            confirmNewPassword: values.confirmNewPassword,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error('حدث خطأ أثناء إعادة تعيين كلمة المرور');
        }

        showToast('تم إعادة تعيين كلمة المرور بنجاح', 'success');
        router.push('/login');
      } catch (err: any) {
        showToast('هناك خطأ في الكود أو كلمة المرور', 'error');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const PRIMARY = "var(--primary-600)";
  const ERROR = "var(--error-500)";
  const WHITE = "var(--text-white)";

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 5, direction: "rtl" }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3
          }}>
          <Box
            sx={{
              bgcolor: "primary.main",
              borderRadius: "50%",
              p: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mb: 2
            }}>
            {currentStep === 1 ? (
              <EmailOutlinedIcon sx={{ color: "white" }} />
            ) : (
              <LockOutlinedIcon sx={{ color: "white" }} />
            )}
          </Box>
          <Typography variant="h5" fontWeight="bold">
            {" "}
            {currentStep === 1
              ? "نسيت كلمة المرور"
              : "إعادة تعيين كلمة المرور"}
          </Typography>

          {currentStep === 2 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, textAlign: "center" }}>
              تم إرسال كود التحقق إلى {userEmail}
            </Typography>
          )}
        </Box>

        {/* Step 1: Email Form */}
        {currentStep === 1 && (
          <form onSubmit={emailFormik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="البريد الإلكتروني"
              value={emailFormik.values.email}
              onChange={emailFormik.handleChange}
              onBlur={emailFormik.handleBlur}
              error={Boolean(emailFormik.errors.email && emailFormik.touched.email)}
              helperText={emailFormik.touched.email && emailFormik.errors.email}

              margin="normal"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: PRIMARY, fontSize: 26 }} />
                  </InputAdornment>
                )
              }}
              FormHelperTextProps={{
                sx: {
                  textAlign: "right",
                  direction: "rtl",
                  color: ERROR,
                  fontWeight: 600,
                  fontSize: "1em",
                },
              }}
              sx={textFieldStyles}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              sx={{ mt: 3, mb: 2, py: 1.5 ,backgroundColor: PRIMARY,
                color: WHITE}}>
              {isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "إرسال كود التحقق"
              )}
            </Button>
          </form>
        )}

        {/* Step 2: Reset Password Form */}
        {currentStep === 2 && (
          <form onSubmit={resetPasswordFormik.handleSubmit}>
            <TextField
              fullWidth
              id="code"
              name="code"
              label="كود التحقق"
              value={resetPasswordFormik.values.code}
              onChange={resetPasswordFormik.handleChange}
              error={Boolean(resetPasswordFormik.errors.code && resetPasswordFormik.touched.code)}
              helperText={resetPasswordFormik.touched.code && resetPasswordFormik.errors.code}
              margin="normal"
              variant="outlined"
              // placeholder="أدخل كود التحقق المرسل إلى بريدك الإلكتروني"
              InputProps={{
                sx: {
                  paddingRight: 0,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <VpnKeyOutlinedIcon sx={{ color: PRIMARY, fontSize: 26 }} />
                  </InputAdornment>
                )
              }}
              FormHelperTextProps={{
                sx: {
                  textAlign: "right",
                  direction: "rtl",
                  color: ERROR,
                  fontWeight: 600,
                  fontSize: "1em",
                },
              }}
              sx={textFieldStyles}
            />

            <TextField
              fullWidth
              id="newPassword"
              name="newPassword"
              label="كلمة المرور الجديدة"
              type={showPassword ? "text" : "password"}
              value={resetPasswordFormik.values.newPassword}
              onChange={resetPasswordFormik.handleChange}
              error={
                Boolean(resetPasswordFormik.errors.newPassword && resetPasswordFormik.touched.newPassword)
              }
              helperText={
                resetPasswordFormik.touched.newPassword && resetPasswordFormik.errors.newPassword
              }
              margin="normal"
              variant="outlined"
              InputProps={{
                sx: {
                  padding: 0,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: PRIMARY, fontSize: 26 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              FormHelperTextProps={{
                sx: {
                  textAlign: "right",
                  direction: "rtl",
                  color: ERROR,
                  fontWeight: 600,
                  fontSize: "1em",
                },
              }}
              sx={textFieldStyles}
            />

            <TextField
              fullWidth
              id="confirmNewPassword"
              name="confirmNewPassword"
              label="تأكيد كلمة المرور الجديدة"
              type={showConfirmPassword ? "text" : "password"}
              value={resetPasswordFormik.values.confirmNewPassword}
              onChange={resetPasswordFormik.handleChange}
              error={
                Boolean(resetPasswordFormik.errors.confirmNewPassword && resetPasswordFormik.touched.confirmNewPassword)
              }
              helperText={resetPasswordFormik.touched.confirmNewPassword && resetPasswordFormik.errors.confirmNewPassword
              }
              margin="normal"
              variant="outlined"
              InputProps={{
                sx: {
                  padding: 0,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: PRIMARY, fontSize: 26 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end">
                      {showConfirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              FormHelperTextProps={{
                sx: {
                  textAlign: "right",
                  direction: "rtl",
                  color: ERROR,
                  fontWeight: 600,
                  fontSize: "1em",
                },
              }}
              sx={textFieldStyles}
            />

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setCurrentStep(1)}
                sx={{ flex: 1, py: 1.5 }}>
                رجوع
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={isSubmitting}
                sx={{ flex: 1, py: 1.5 , backgroundColor: PRIMARY,
                color: WHITE,}}>
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "إعادة تعيين كلمة المرور"
                )}
              </Button>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default ResetPasswordPage;
