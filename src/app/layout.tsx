import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { LanguageProvider } from "@/lib/i18n";
import { JsonLd } from "@/components/JsonLd";
import { ConsoleBlocker } from "@/components/ConsoleBlocker";
import PwaRegister from "@/components/PwaRegister";
import InstallPwaBanner from "@/components/InstallPwaBanner";
import AuthListener from "@/components/AuthListener";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://www.menufid.site'),
  title: {
    default: "MenuFid - Menu Digital QR Code & Carte de Fidélité Restaurant",
    template: "%s | MenuFid"
  },
  description:
    "Digitalisez votre menu en ligne et fidélisez vos clients avec des QR Codes de table et des cartes de fidélité 10 tampons. Solution N°1 pour restaurants, cafés et salons de thé.",
  keywords: [
    "menu digital restaurant",
    "menu qr code",
    "carte de fidélité restaurant",
    "qr code restaurant algérie",
    "menu sans contact",
    "logiciel restaurant algérie",
    "menu qr code alger",
    "menu digital oran",
    "menu digital constantine",
    "fidélité 10 tampons",
    "saas restaurant"
  ],
  alternates: {
    canonical: "https://www.menufid.site",
    languages: {
      "fr-DZ": "https://www.menufid.site",
      "ar-DZ": "https://www.menufid.site",
      "en": "https://www.menufid.site",
    },
  },
  openGraph: {
    title: "MenuFid - Menu Digital QR Code & Carte de Fidélité pour Restaurants",
    description: "Digitalisez votre carte avec un QR code de table élégant et fidélisez vos clients avec des récompenses exclusives.",
    url: "https://www.menufid.site",
    siteName: "MenuFid",
    images: [
      {
        url: "/api/og/default",
        width: 1200,
        height: 630,
        alt: "MenuFid - Menu Digital QR Code & Fidélité",
      },
    ],
    locale: "fr_DZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MenuFid - Menu Digital & Fidélité Restaurant",
    description: "Digitalisez votre menu en ligne et fidélisez vos clients avec des QR codes de table interactifs.",
    images: ["/api/og/default"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MenuFid",
  },
  formatDetection: {
    telephone: false,
  },
  verification: {
    google: "G6vCTu2tcNzNQz8uOhe9Gytzq39n9I4IHHQgp8-QK3A",
  },
  other: {
    "geo.region": "DZ",
    "geo.placename": "Alger, Oran, Constantine, Sétif, Annaba, Boussada, Algérie",
    "geo.position": "36.7538;3.0588",
    "ICBM": "36.7538, 3.0588",
    "robots": "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFB800",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <JsonLd />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900`}
      >
        <ConsoleBlocker />
        <PwaRegister />
        <AuthListener />
        <LanguageProvider>
          <ToastProvider>
            {children}
            <InstallPwaBanner />
          </ToastProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
