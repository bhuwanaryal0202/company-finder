import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import './globals.css'
import { Providers } from '@/lib/providers'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'Company Finder - Find and explore companies',
  description: 'Search for companies by name, industry, and location',
  metadataBase: new URL('https://companyfinderaus.netlify.app/'),
  openGraph: {
    title: 'Company Finder',
    description: 'Search for companies by name, industry, and location',
    url: 'https://companyfinderaus.netlify.app/',
    siteName: 'Company Finder',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Company Finder',
    description: 'Search for companies by name, industry, and location',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50 text-gray-900`}
        suppressHydrationWarning={true}
      >
        <Providers>
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-blue-600 focus:text-white focus:z-50"
          >
            Skip to main content
          </a>
          <div id="main-content">
            {children}
          </div>
          
        </Providers>
      </body>
    </html>
  )
}
