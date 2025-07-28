/** @format */

"use client";

import React, { useEffect, useState, useContext } from "react"; // Add useState for password
import Link from "next/link";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton, // Import IconButton
  useTheme,
} from "@mui/material";

import { useFormik } from "formik"; // Import useFormik
import * as yup from "yup"; // Import yup
import { useToast } from "@/shared/provider/ToastProvider";
import GoogleButton from "@/components/googleButton";
import { useRouter } from "next/navigation";
import Player from "lottie-react";
import homeLoginAnimation from "@/public/images/Homelogin-anmation.json";
import { useSearchParams } from 'next/navigation';
import { AuthContext } from "../context/AuthContext";
import { textFieldStyles } from "@/shared/styles/textFieldStyle";
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useDarkMode } from "@/app/context/DarkModeContext";


// Add color and font constants (move above component for scope)
const PRIMARY = "var(--primary-600)";
const PRIMARY_HOVER = "var(--primary-700)";
const ERROR = "var(--error-500)";
const BG = "var(--bg-secondary)";
const WHITE = "var(--text-white)";
const CARD_BG = "var(--card-bg)";
const FONT_AR = "Cairo, Tajawal, Inter, sans-serif";

type LoginFormData = {
  email: string;
  password: string;
};

const LoginPage = () => {
  const router = useRouter();
  const context = useContext(AuthContext) as any || {};
  const { user, logout } = context;
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [loading, setLoading] = useState(false); // Add loading state
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const theme = useTheme();
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    if (errorParam === 'email_already_registered') {
      showToast('هذا البريد مسجل مسبقًا. يُرجى تسجيل الدخول باستخدام البريد وكلمة المرور.', 'error');
    } else if (errorParam === 'google_failed') {
      showToast('البريد الالكترونى موجود بالفعل , سجل عن طريق الفورم', 'error');
    } else if (errorParam === 'server_error') {
      showToast('حدث خطأ في السيرفر أثناء محاولة تسجيل الدخول', 'error');
    }
  }, [errorParam]);
  // Define validation schema using Yup
  const validationSchema = yup.object({
    email: yup
      .string()
      .email("صيغة البريد الإلكتروني غير صحيحة")
      .required("البريد الإلكتروني مطلوب")
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "ادخل بريد الكترونى صالح"
      ),
    password: yup
      .string()
      .min(6, "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل")
      .matches(/[A-Z]/, "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل")
      .matches(/[a-z]/, "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل")
      .matches(/[0-9]/, "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل")
      .required("كلمة المرور مطلوبة"),
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    validateOnChange: true, // Validate on change
    validateOnBlur: false, // You can set this to true if you want validation on blur
    onSubmit: async (values) => {
      setLoading(true); // Start loading
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(values),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          if (res.status === 400) {
            showToast("خطأ في البريد الإلكتروني أو كلمة المرور", "error");
          } else if (res.status === 401 || res.status === 404) {
            showToast("الحساب غير موجود أو لم يتم تأكيد البريد الإلكتروني", "error");
          } else {
            showToast("حدث خطأ غير متوقع أثناء تسجيل الدخول", "error");
          }
          return;
        }


        localStorage.setItem("token", data.token);

        try {
          const decoded = JSON.parse(atob(data.token.split('.')[1]));
          const role = decoded?.role;

          showToast("تم التسجيل بنجاح", "success");

          setTimeout(() => {
            if (role === "admin") {
              router.push("/admin/dashboard");
            } else {
              router.push("/");
            }
          }, 1000);
        } catch (error) {
          console.error("فشل في قراءة بيانات الدور:", error);
          router.push("/");
        }

        // ممكن تعملي redirect أو تفضي الفورم هنا
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("Login error:", errorMsg);
        showToast(errorMsg || "لم يتم العثور على المستخدم، أو لم تقوم بتأكيد ايميلك بعد");
      } finally {
        setLoading(false); // Stop loading
      }
    },
  });

  const handleForgotPassword = () => {
    router.push('/resetPassword');
  };

  if (user) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
        <Typography variant="h5" color="primary" sx={{ mb: 2, fontWeight: 700 }}>
          أنت مسجل الدخول بالفعل. يجب تسجيل الخروج أولاً لتسجيل الدخول بحساب آخر.
        </Typography>
        <Button variant="contained" color="error" onClick={() => { logout(); }}>
          تسجيل الخروج
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: isDarkMode ? "var(--dark-800)" : BG,
        color: isDarkMode ? "var(--dark-text-900)" : undefined,
        fontFamily: FONT_AR,
        padding: { xs: "1rem", md: "2rem" },
        boxSizing: "border-box",
      }}>
      <Box
        sx={{
          my: "1rem",
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          width: { xs: "100%", sm: "95%", md: "95%", lg: "900px" },
          maxWidth: "900px",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
          minHeight: { xs: "unset", md: "500px" },
          backgroundColor: isDarkMode ? "var(--primary-700)" : WHITE,
        }}>
        {/* Right Side */}
        <Box
          sx={{
            flex: { xs: "none", lg: "1.5" },
            background: PRIMARY,
            color: WHITE,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: { xs: "2rem", md: "2rem" },
            width: { xs: "100%", lg: "unset" },
            ...(isDarkMode && {
              background: "var(--primary-800)",
              color: "#fff",
            }),
          }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: "20px", md: "24px" },
              textAlign: "center",
              marginBottom: "1rem",
            }}>
            تخطى المتاعب وأعثر على قلعتك
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "16px", md: "18px" },
              textAlign: "center",
              marginBottom: "0.5rem",
            }}>
            سجل دخولك الآن!
          </Typography>
          <Player
            autoplay
            loop
            animationData={homeLoginAnimation}
            style={{
              width: 350,
              height: 300,
              maxWidth: "100%",
              borderRadius: 8,
              marginTop: "20px",
            }}
          />
        </Box>

        {/* left Side */}
        <Box
          sx={{
            flex: { xs: "none", md: "2" },
            backgroundColor: isDarkMode ? "var(--dark-700)" : CARD_BG,
            color: isDarkMode ? "var(--dark-text-900)" : undefined,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: { xs: "2rem", md: "4rem" },
            textAlign: "right",
            width: { xs: "100%", md: "unset" },
            fontFamily: FONT_AR,
          }}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "24px", md: "30px" },
              marginBottom: "2rem",
              textAlign: "center",
              direction: "rtl",
              fontFamily: FONT_AR,
            }}>
            تسجيل الدخول
          </Typography>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{
              display: "grid",
              gap: "1rem",
              direction: "rtl",
              fontFamily: FONT_AR,
            }}>
            {/* Email Field */}
            <TextField
              label="البريد الإلكتروني"
              type="email"
              variant="outlined"
              fullWidth
              id="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.errors.email && formik.touched.email)}
              helperText={formik.touched.email && formik.errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: PRIMARY }} />
                  </InputAdornment>
                ),
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
            {/* Password Field */}
            <TextField
              label="كلمة المرور"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              id="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.errors.password && formik.touched.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                sx: {
                  padding: 0,
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: PRIMARY }} />
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
                ),
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
            <Typography
              variant="body1"
              onClick={handleForgotPassword}
              sx={{
                color: PRIMARY,
                fontWeight: 500,
                cursor: "pointer",
                "&:hover": {
                  color: PRIMARY_HOVER,
                },
              }}>
              هل نسيت كلمة المرور؟
            </Typography>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              aria-label="تسجيل الدخول"
              sx={{
                padding: "12px",
                backgroundColor: PRIMARY,
                color: WHITE,
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                textTransform: "none",
                "&:hover": {
                  backgroundColor: PRIMARY_HOVER,
                },
              }}>
              {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                textAlign: "center",
                margin: "1.5rem 0",
              }}>
              <Box sx={{ flex: 1, height: "1px", backgroundColor: isDarkMode ? "var(--dark-500)" : "#ccc" }} />
              <Typography
                sx={{
                  padding: "0 1rem",
                  whiteSpace: "nowrap",
                  color: isDarkMode ? "var(--dark-text-500)" : "#555",
                }}>
                أو
              </Typography>
              <Box sx={{ flex: 1, height: "1px", backgroundColor: isDarkMode ? "var(--dark-500)" : "#ccc" }} />
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "1rem",
              }}>
              <GoogleButton />
            </Box>
            <Typography
              sx={{
                textAlign: "center",
                direction: "rtl",
                fontFamily: FONT_AR,
              }}>
              ليس لديك حساب؟{" "}
              <Link
                href="/register"
                style={{
                  color: PRIMARY,
                  textDecoration: "none",
                  fontWeight: "medium",
                }}>
                سجل الآن
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
//  try
export default LoginPage;
