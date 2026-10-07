import { API_URL } from "@/shared/utils/auth";

/** Where the Google sign-in started from, so /login/success can return there (sessionStorage). */
export const GOOGLE_REDIRECT_KEY = "saknly:auth-redirect";

/** Only same-site relative paths, so `?redirect=` cannot send the user to another site. */
export function safeRedirect(value: string | null | undefined): string | null {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

/**
 * POST /auth/resend-confirmation. The server answers the same whether or not the account exists, so the caller
 * shows one neutral message on success.
 */
export async function resendConfirmation(email: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/resend-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const RESEND_SENT_MESSAGE =
  "إن كان الحساب غير مؤكد، فقد أرسلنا رابط تأكيد جديدًا إلى بريدك. افحص أيضًا مجلد الرسائل غير المرغوب فيها.";
export const RESEND_FAILED_MESSAGE = "لم نتمكن من إرسال رابط التأكيد. حاول مرة أخرى بعد قليل.";

/** Maps the reset endpoint's English errors (authController.resetPassword) to Arabic. */
export function resetErrorMessage(status: number, serverMessage: string): string {
  if (/expired/i.test(serverMessage)) return "انتهت صلاحية الرمز. اطلب رمزًا جديدًا.";
  if (status === 400) return "الرمز غير صحيح أو لا يخص هذا البريد. تأكد منه وحاول مرة أخرى.";
  return "تعذّر تغيير كلمة المرور الآن. حاول مرة أخرى بعد قليل.";
}
