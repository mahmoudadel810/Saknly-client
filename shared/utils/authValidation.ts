import * as yup from "yup";

// Mirrors server/modules/Auth/authValidation.js (Joi): 5-30 chars with at least one
// uppercase letter, one digit and one symbol; Egyptian mobile `01` + 9 digits.
export const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
export const PHONE_PATTERN = /^01\d{9}$/;

export const passwordSchema = yup
  .string()
  .min(5, "كلمة المرور من 5 إلى 30 حرفًا.")
  .max(30, "كلمة المرور من 5 إلى 30 حرفًا.")
  .matches(
    PASSWORD_PATTERN,
    "أضف حرفًا إنجليزيًا كبيرًا ورقمًا ورمزًا (مثل ! أو @) على الأقل."
  )
  .required("اكتب كلمة المرور.");

export const phoneSchema = yup
  .string()
  .matches(PHONE_PATTERN, "اكتب رقم هاتف من 11 رقمًا يبدأ بـ 01.")
  .required("اكتب رقم الهاتف.");

export const emailSchema = yup
  .string()
  .email("البريد الإلكتروني غير صحيح. مثال: name@example.com")
  .required("اكتب بريدك الإلكتروني.");

export const RESET_EMAIL_KEY = "resetPasswordEmail";
