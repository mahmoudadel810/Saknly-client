/** @format */

import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import AppThemeProvider from "@/shared/ui/AppThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import {
  SEO_CONFIG,
  ARABIC_CONFIG,
  LANGUAGE_CONFIG,
} from "../shared/constants";
import React from "react";
import HydrationCleanup from "../shared/components/HydrationCleanup";
import Navbar from "../shared/components/Navbar";
import Footer from "../shared/components/Footer";
import { ToastProvider } from "@/shared/provider/ToastProvider";
import AuthGuard from "@/shared/components/AuthGuard";
import ChatbotButton from "@/components/ChatbotButton";
import ErrorBoundary from "@/shared/components/ErrorBoundary";

// One family for Arabic and Latin (DESIGN-SYSTEM.md, Typography); the theme and Tailwind read --font-sans.
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// The pre-redesign toggle stored 'true'/'false' under `darkMode`; MUI reads 'light'/'dark' from `mui-mode`.
const LEGACY_MODE_MIGRATION =
  "try{var o=localStorage.getItem('darkMode');if(o!==null){if(!localStorage.getItem('mui-mode'))localStorage.setItem('mui-mode',o==='true'?'dark':'light');localStorage.removeItem('darkMode');}}catch(e){}";

// Performance monitoring
const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service in production
    // console.log('Web Vitals:', metric);
  }
};

export const metadata: Metadata = {
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: `%s | سكنلي`,
  },
  description: SEO_CONFIG.defaultDescription,
  keywords: SEO_CONFIG.defaultKeywords,
  authors: [{ name: "فريق سكنلي" }],
  creator: "سكنلي",
  publisher: "سكنلي",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://saknly-ruddy.vercel.app"),
  alternates: {
    canonical: "/",
    languages: SEO_CONFIG.alternateLanguages,
  },
  openGraph: {
    type: "website",
    locale: ARABIC_CONFIG.locale,
    url: "/",
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    siteName: "سكنلي",
    images: [
      {
        url: "/images/skanly.jpeg",
        alt: "سكنلي - منصة العقارات",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: ["/images/skanly.jpeg"],
    creator: "@saknly",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={plexArabic.variable} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0E5E57" />
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="language" content={ARABIC_CONFIG.code} />
        <meta name="locale" content={ARABIC_CONFIG.locale} />
      </head>
      <body suppressHydrationWarning>
        {/* Before paint: carry the old `darkMode` preference over once, then set .dark/.light on <html>. */}
        <script dangerouslySetInnerHTML={{ __html: LEGACY_MODE_MIGRATION }} />
        <InitColorSchemeScript attribute=".%s" defaultMode="system" />
        <HydrationCleanup />
        <AppThemeProvider>
          <ErrorBoundary>
            <ToastProvider>
              <AuthProvider>
                <AuthGuard>
                  <WishlistProvider>
                    <Navbar />
                    <div id="root" className="relative">
                      {children}
                      <ChatbotButton />
                    </div>
                    <Footer />
                    <div id="modal-root" />
                    <div id="toast-root" />
                  </WishlistProvider>
                </AuthGuard>
              </AuthProvider>
            </ToastProvider>
          </ErrorBoundary>
        </AppThemeProvider>
      </body>
    </html>
  );
}
