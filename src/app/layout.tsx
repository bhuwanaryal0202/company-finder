import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Company Finder - Find and Export Company Information",
  description: "Search and discover companies across the United States. Filter by industry, state, and status. Export company data to CSV with ease.",
  keywords: "company finder, business search, company database, business directory, company export, CSV export",
  authors: [{ name: "Company Finder Team" }],
  creator: "Company Finder",
  publisher: "Company Finder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://companyfinderaus.netlify.app",
    title: "Company Finder - Find and Export Company Information",
    description: "Search and discover companies across the United States. Filter by industry, state, and status. Export company data to CSV with ease.",
    siteName: "Company Finder",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Company Finder - Business Search Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Company Finder - Find and Export Company Information",
    description: "Search and discover companies across the United States. Filter by industry, state, and status. Export company data to CSV with ease.",
    images: ["/og-image.png"],
    creator: "@companyfinder",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: "your-google-site-verification",
  },
  category: "business",
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
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
