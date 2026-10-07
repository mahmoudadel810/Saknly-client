"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import ChatbotButton from "@/components/ChatbotButton";

export const isAdminPath = (pathname: string | null) =>
  pathname === "/admin" || Boolean(pathname?.startsWith("/admin/"));

/**
 * The public header, footer and chatbot around every non-admin page. /admin/* renders only its children:
 * app/admin/layout.tsx wraps them in AdminShell.
 *
 * Chosen over an app/(public) route group: no route moves, and the root not-found page and loading boundary
 * keep the public header as before.
 */
export default function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (isAdminPath(pathname)) return <>{children}</>;
  return (
    <>
      <Navbar />
      <div id="root" className="relative">
        {children}
      </div>
      <ChatbotButton />
      <Footer />
    </>
  );
}
