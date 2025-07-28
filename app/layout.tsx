/** @format */

import type { Metadata } from "next";
import { Inter, Cairo, Sanchez } from "next/font/google";
import "./globals.css";
import RootStyleRegistry from "./providers";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { DarkModeProvider } from "./context/DarkModeContext";
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
import BackToTop from "../shared/components/BackToTop";
import ErrorBoundary from "@/shared/components/ErrorBoundary";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

const sanchez = Sanchez({
  subsets: ["latin"],
  variable: "--font-sanchez",
  weight: ["400"],
});

// Performance monitoring
const reportWebVitals = (metric: any) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics service in production
    // console.log('Web Vitals:', metric);
  }
};

// Service Worker registration
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        // console.log('SW registration failed: ', registrationError);
      });
  });
}

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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://saknly-client.vercel.app"
  ),
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
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "سكنلي - منصة العقارات",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: ["/images/twitter-image.jpg"],
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
    <html
      lang={ARABIC_CONFIG.code}
      dir={ARABIC_CONFIG.direction}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="language" content={ARABIC_CONFIG.code} />
        <meta name="locale" content={ARABIC_CONFIG.locale} />
      </head>
      <body className="bg-white dark:bg-dark-900 text-gray-900 dark:text-gray-100 transition-colors duration-300" suppressHydrationWarning>
        <HydrationCleanup />
        <RootStyleRegistry>
          <ErrorBoundary>
            <DarkModeProvider>
              <ToastProvider>
                <AuthProvider>
                  <AuthGuard>
                    <WishlistProvider>
                      <Navbar />
                      <div id="root" className="relative">
                        {children}
                        <ChatbotButton />
                        <BackToTop />
                      </div>
                      <Footer />
                      <div id="modal-root" />
                      <div id="toast-root" />
                    </WishlistProvider>
                  </AuthGuard>
                </AuthProvider>
              </ToastProvider>
            </DarkModeProvider>
          </ErrorBoundary>
        </RootStyleRegistry>
      </body>
    </html>
  );
}
