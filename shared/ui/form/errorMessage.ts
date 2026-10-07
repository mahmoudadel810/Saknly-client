import axios from "axios";

const ARABIC = /[؀-ۿ]/;

/**
 * A message that is safe to show for a failed request, from its status and body. Many server messages are in
 * English (server/modules/*), so a server message is used only when it is a 4xx written in Arabic; everything
 * else gets the caller's Arabic fallback.
 */
export function arabicMessageFrom(status: number | undefined, data: unknown, fallback: string): string {
  const message = (data as { message?: unknown } | null | undefined)?.message;
  if (status !== undefined && status >= 400 && status < 500 && typeof message === "string" && ARABIC.test(message)) {
    return message.trim();
  }
  return fallback;
}

/** The same for an error thrown by the shared axios client. */
export function arabicErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) return arabicMessageFrom(err.response?.status, err.response?.data, fallback);
  return fallback;
}
