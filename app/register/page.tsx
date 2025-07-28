/** @format */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Player from "lottie-react";
import registerAnimation from "@/public/images/Reagister-Anmation.json";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useFormik } from "formik";
import * as yup from "yup";
import IconButton from "@mui/material/IconButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useToast } from "@/shared/provider/ToastProvider";
import GoogleButton from "@/components/googleButton";
import { textFieldStyles } from "@/shared/styles/textFieldStyle";
import { useDarkMode } from "@/app/context/DarkModeContext";

export default function Register() {
  // Define validation schema using Yup
  const validationSchema = yup.object({
    userName: yup
      .string()
      .required("اسم المستخدم مطلوب")
      .min(
        3,
        "اسم المستخدم يجب أن يبدأ بحرف (عربي أو إنجليزي) فقط وأن يتكون من 3 أحرف على الأقل"
      )
      .max(
        30,
        "اسم المستخدم يجب أن يبدأ بحرف (عربي أو إنجليزي) فقط وأن لا يزيد عن 30 حرف"
      )
      .matches(
        /^[a-zA-Z\u0600-\u06FF][a-zA-Z\u0600-\u06FF0-9 ]*$/,
        "غير مسموح بأي رموز غريبة"
      ),
    email: yup
      .string()
      .email("صيغة البريد الإلكتروني غير صحيحة")
      .required("البريد الإلكتروني مطلوب")
      .matches(
        // /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        // "يجب أن يكون البريد الإلكتروني من نطاق @gmail.com فقط"
        "ادخل بريد الكترونى صالح"
      ),
    password: yup
      .string()
      .min(6, "كلمة المرور يجب أن تتكون من 6 أحرف على الأقل")
      .matches(/[A-Z]/, "يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل")
      .matches(/[a-z]/, "يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل")
      .matches(/[0-9]/, "يجب أن تحتوي كلمة المرور على رقم واحد على الأقل")
      .required("كلمة المرور مطلوبة"),
    confirmPassword: yup
      .string()
      .required("تأكيد كلمة المرور مطلوب")
      .oneOf([yup.ref("password")], "كلمات المرور غير متطابقة"),
    phone: yup
      .string()
      .matches(/^[\+]?[1-9][\d]{0,15}$/, " ادخل كود الدولة ثم رقم الهاتف")
      .required("رقم الهاتف مطلوب"),
    address: yup.string().required("العنوان مطلوب"),
  });

  // Initialize Formik
  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: false,
    onSubmit: async (values) => {
      try {
        // مثال: استدعاء API للتسجيل
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'https://saknly-server-9air.vercel.app/api/saknly/v1'}/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          }
        );

        if (!res.ok) {
          throw new Error("خطأ فى تسجيل الدخول, هذا الايميل موجود بالفعل");
        }

        const data = await res.json();

        // ✅ عرض رسالة نجاح
        showToast("تم التسجيل بنجاح! افحص بريدك الالكترونى", "success");
        console.log(data);
        formik.resetForm();

        // ممكن تعملي redirect أو تفضي الفورم هنا
      } catch (error) {
        console.error("Registration error:", error);

        // ❌ عرض رسالة خطأ
        showToast("خطأ فى تسجيل الدخول, هذا الايميل موجود بالفعل", "error");
      }
    },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { showToast } = useToast();
  const { isDarkMode } = useDarkMode();

  // style of text feild
  const PRIMARY = "var(--primary-600)";
  const PRIMARY_HOVER = "var(--primary-700)";

  return (
    // Outer Container: Centers the registration card and provides background
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        fontFamily: "Inter, sans-serif",
        padding: { xs: "1rem", lg: "2rem" },
        boxSizing: "border-box",
        ...(isDarkMode && {
          backgroundColor: "var(--dark-800)",
          color: "var(--dark-text-900)",
        }),
      }}>
      {/* Registration Card: The main container for the form and image sections */}
      <Box
        sx={{
          my:"1rem",
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },

          width: { xs: "100%", sm: "90%", md: "700px", lg: "900px" },
          maxWidth: "900px",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
          minHeight: { xs: "unset", md: "500px" },
        }}>

        {/* RIGHT SIDE */}

        <Box
          sx={{
            flex: { xs: "none", lg: "1.5" },
            backgroundColor: "var(--primary-600)",
            color: "#fff",
            display: "flex",
            flexDirection: "column-reverse",
            justifyContent: "center",
            alignItems: "center",
            padding: { xs: "2rem", md: "2rem" },
            width: { xs: "100%", lg: "unset" },
            ...(isDarkMode && {
              backgroundColor: "var(--primary-700)",
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
            ! سجل الآن
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: "16px", md: "18px" },
              textAlign: "center",
              marginBottom: "2rem",
            }}>
            وفّر الوقت، وابحث عن بيتك المثالي بسهولة
          </Typography>
          <Player
            autoplay
            loop
            animationData={registerAnimation}
            style={{
              width: 350,
              height: 300,
              maxWidth: "100%",
              borderRadius: 8,
              marginTop: "20px",
            }}
          />
        </Box>

        <Box
          sx={{
            flex: { xs: "none", lg: "2" },
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: { xs: "2rem", md: "4rem" },
            textAlign: "right",
            width: { xs: "100%", lg: "unset" },
            ...(isDarkMode && {
              backgroundColor: "var(--dark-700)",
              color: "var(--dark-text-900)",
            }),
          }}>
          <Typography
            variant="h1"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "24px", md: "30px" },
              marginBottom: "2rem",
              textAlign: "center",
              direction: "rtl",
            }}>
            إنشاء حساب
          </Typography>

          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{
              display: "grid",
              gap: "1rem",
              direction: "rtl",
            }}>
            {/* userName Field */}
            <TextField
              label="اسم المستخدم"
              variant="outlined"
              fullWidth
              id="userName"
              name="userName"
              value={formik.values.userName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.errors.userName && formik.touched.userName)}
              helperText={formik.touched.userName && formik.errors.userName}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineOutlinedIcon sx={{ color: PRIMARY }} />
                  </InputAdornment>
                ),
              }}
              FormHelperTextProps={{
                sx: {
                  textAlign: "right",
                  direction: "rtl",
                },
              }}
              sx={textFieldStyles}
            />

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
              error={Boolean(formik.errors.email && formik.touched.email)} // Add formik.touched for error display
              helperText={formik.touched.email && formik.errors.email} // Add formik.touched
              InputProps={{
                sx: {
                  paddingRight: 0, // ✅ ده يلغى padding اليمين للكتابة نفسها
                },
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
              error={Boolean(formik.errors.password && formik.touched.password)} // Add formik.touched for error display
              helperText={formik.touched.password && formik.errors.password} // Add formik.touched
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
                },
              }}
              sx={textFieldStyles}
            />

            {/* Confirm Password Field */}
            <TextField
              label="تأكيد كلمة المرور"
              type={showConfirmPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              id="confirmPassword"
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.errors.confirmPassword && formik.touched.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
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
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end">
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              FormHelperTextProps={{
                sx: {
                  textAlign: "right",
                  direction: "rtl",
                },
              }}
              sx={textFieldStyles}
            />

            {/* phone */}
            <TextField
              label="رقم الهاتف"
              variant="outlined"
              fullWidth
              id="phone"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.errors.phone && formik.touched.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneOutlinedIcon sx={{ color: PRIMARY }} />
                  </InputAdornment>
                ),
              }}
              FormHelperTextProps={{
                sx: {
                  textAlign: "right",
                  direction: "rtl",
                },
              }}
              sx={textFieldStyles}
            />

            {/* address */}
            <TextField
              label="العنوان"
              variant="outlined"
              fullWidth
              id="address"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.errors.address && formik.touched.address)}
              helperText={formik.touched.address && formik.errors.address}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HomeOutlinedIcon sx={{ color: PRIMARY }} />
                  </InputAdornment>
                ),
              }}
              FormHelperTextProps={{
                sx: {
                  textAlign: "right",
                  direction: "rtl",
                },
              }}
              sx={textFieldStyles}
            />

            <Button
              type="submit"
              variant="contained"
              // onClick={handleRegister}
              sx={{
                padding: "12px",
                backgroundColor: PRIMARY,
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                textTransform: "none",
                fontWeight: 700,
                boxShadow: "0 2px 8px 0 var(--primary-100)",
                transition: "background 0.2s, box-shadow 0.2s, transform 0.15s",
                "&:hover, &:focus": {
                  backgroundColor: PRIMARY_HOVER,
                  boxShadow: "0 4px 16px 0 var(--primary-200)",
                  transform: "translateY(-2px) scale(1.03)",
                },
                "&:disabled": {
                  opacity: 0.7,
                  cursor: "not-allowed",
                },
              }}>
              إنشاء حساب
            </Button>
          </Box>

          <Typography
            sx={{
              marginTop: "1rem",
              textAlign: "center",
              direction: "rtl",
            }}>
            هل لديك حساب بالفعل ؟{" "}
            <a
              href="/login"
              style={{
                color: PRIMARY,
                textDecoration: "none",
                fontWeight: "700",
              }}>
              تسجيل الدخول
            </a>
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              textAlign: "center",
              margin: "1.5rem 0",
              ...(isDarkMode && {
                color: "var(--dark-text-500)",
              }),
            }}>
            <Box sx={{ flex: 1, height: "1px", backgroundColor: "#ccc" }} />
            <Typography
              sx={{
                padding: "0 1rem",
                whiteSpace: "nowrap",
                color: "#555",
                ...(isDarkMode && {
                  color: "var(--dark-text-500)",
                }),
              }}>
              أو
            </Typography>
            <Box sx={{ flex: 1, height: "1px", backgroundColor: "#ccc" }} />
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
            }}>
            <GoogleButton></GoogleButton>
          </Box>
        </Box>

      </Box>
    </Box>
  );
}
