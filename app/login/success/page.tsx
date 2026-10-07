"use client";

// The Google sign-in lands here with ?token=…: store the session, then go back to where the sign-in started.

import { useContext, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/AuthContext";
import AuthLayout from "@/shared/ui/auth/AuthLayout";
import { GOOGLE_REDIRECT_KEY, safeRedirect } from "@/shared/ui/auth/authApi";
import LoadingState from "@/shared/ui/LoadingState";

/** Reads (and forgets) the page saved by GoogleButton before the OAuth round trip. */
function takeSavedRedirect(): string | null {
  try {
    const saved = sessionStorage.getItem(GOOGLE_REDIRECT_KEY);
    sessionStorage.removeItem(GOOGLE_REDIRECT_KEY);
    return safeRedirect(saved);
  } catch {
    return null;
  }
}

export default function LoginSuccess() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const handled = useRef(false);

  useEffect(() => {
    if (!authContext || handled.current) return;
    handled.current = true;

    const url = new URL(window.location.href);
    const tokenFromUrl = url.searchParams.get("token");

    if (tokenFromUrl) {
      // Remove the token from the address bar and browser history once it has been read.
      url.searchParams.delete("token");
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
      const target = takeSavedRedirect() ?? "/";
      authContext.setSession(tokenFromUrl).then(() => {
        router.replace(target);
      });
    } else {
      router.replace("/login");
    }
  }, [router, authContext]);

  return (
    <AuthLayout title="جارٍ تسجيل الدخول" description="لحظة واحدة، نجهّز حسابك.">
      <LoadingState label="جارٍ تسجيل الدخول…" compact />
    </AuthLayout>
  );
}
