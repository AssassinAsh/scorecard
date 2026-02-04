import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Footer from "@/components/Footer";
import AppHeader from "../components/AppHeader";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Prevent invisible text during font load
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false, // Don't preload mono font
});

export const metadata: Metadata = {
  title: "CrickSnap - Live Cricket Scoring",
  description:
    "Real-time cricket scoring made simple. Create tournaments, score matches live, and share scorecards instantly.",
  keywords: [
    "cricket",
    "scoring",
    "live score",
    "cricket scorecard",
    "tournament",
  ],
  authors: [{ name: "Ashvin Rokade" }],
  openGraph: {
    title: "CrickSnap - Live Cricket Scoring",
    description: "Real-time cricket scoring made simple",
    type: "website",
    url: "https://www.cricksnap.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Analytics - Deferred to reduce FCP/LCP impact */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            <Script id="google-analytics" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure'
                });
              `}
            </Script>
          </>
        )}

        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <GoogleAnalytics />
          <AppHeader />
          <div style={{ flex: 1 }}>{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
