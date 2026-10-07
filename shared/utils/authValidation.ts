import * as yup from "yup";

// Mirrors server/modules/Auth/authValidation.js (Joi): 5-30 chars with at least one
// uppercase letter, one digit and one symbol; Egyptian mobile `01` + 9 digits.
export const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).*$/;
export const PHONE_PATTERN = /^01\d{9}$/;

export const passwordSchema = yup
  .string()
  .min(5, "كلمة المرور يجب أن تتكون من 5 أحرف على الأقل")
  .max(30, "كلمة المرور يجب ألا تزيد عن 30 حرفًا")
  .matches(
    PASSWORD_PATTERN,
    "يجب أن تحتوي كلمة المرور على حرف كبير ورقم ورمز واحد على الأقل (مثل !@#$%)"
  )
  .required("كلمة المرور مطلوبة");

export const phoneSchema = yup
  .string()
  .matches(PHONE_PATTERN, "الرجاء إدخال رقم هاتف صحيح مكون من 11 رقم يبدأ بـ 01")
  .required("رقم الهاتف مطلوب");

export const emailSchema = yup
  .string()
  .email("صيغة البريد الإلكتروني غير صحيحة")
  .required("البريد الإلكتروني مطلوب");

export const RESET_EMAIL_KEY = "resetPasswordEmail";
