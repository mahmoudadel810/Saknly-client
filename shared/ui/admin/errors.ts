import axios from "axios";

const ARABIC = /[؀-ۿ]/;

/**
 * Server messages this API sends in English, in the admin's words. Matched exactly
 * (server/modules/User/userController.js and friends).
 */
const KNOWN: Record<string, string> = {
  "This is the last active admin. Promote another admin first":
    "هذا آخر مشرف نشط. امنح صلاحية الإشراف لمستخدم آخر أولًا.",
  "You cannot delete your own account": "لا يمكنك حذف حسابك من لوحة الإدارة.",
  "User not found": "المستخدم غير موجود. ربما حُذف بالفعل.",
  "Property not found": "العقار غير موجود. ربما عولج بالفعل.",
  "Property inquiry not found": "الاستفسار غير موجود. ربما حُذف بالفعل.",
  "Message not found": "الرسالة غير موجودة. ربما حُذفت بالفعل.",
};

/**
 * A message that is safe and readable for the admin: a known server message in Arabic, the server's own
 * message when it is already Arabic (4xx only), otherwise the caller's Arabic fallback. English validation
 * text, 5xx bodies and network errors never reach the screen.
 */
export function adminErrorMessage(err: unknown, fallbackArabic: string): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const message = (err.response?.data as { message?: unknown } | undefined)?.message;
    if (status !== undefined && status < 500 && typeof message === "string") {
      const text = message.trim();
      if (KNOWN[text]) return KNOWN[text];
      if (text && ARABIC.test(text)) return text;
    }
    if (status === 429) return "طلبات كثيرة في وقت قصير. انتظر قليلًا ثم أعد المحاولة.";
  }
  return fallbackArabic;
}

/** The HTTP status of a failed request, if any. */
export const errorStatus = (err: unknown): number | undefined =>
  axios.isAxiosError(err) ? err.response?.status : undefined;
