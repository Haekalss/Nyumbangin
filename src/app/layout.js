import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import SessionWrapper from '@/components/SessionWrapper';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://nyumbangin.web.id"),
  title: {
    default: "Nyumbangin - Platform Apresiasi Kreator Indonesia",
    template: "%s | Nyumbangin",
  },
  description:
    "Nyumbangin: platform apresiasi kreator Indonesia. Buat link saweran & donasi untuk streamer, VTuber, dan content creator, lengkap dengan overlay OBS. Gratis daftar.",
  keywords: [
    "nyumbangin",
    "apresiasi kreator",
    "saweran online",
    "donasi streamer",
    "link donasi kreator",
    "overlay donasi OBS",
    "dukung kreator",
  ],
  authors: [{ name: "Nyumbangin Team" }],
  robots: { index: true, follow: true },
  verification: { google: "Fq51gFydPSmh6bwfm2qMj6CqT4xD90RnYnowMHY6KZ0" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Nyumbangin",
    url: "/",
    title: "Nyumbangin - Platform Apresiasi Kreator Indonesia",
    description:
      "Dukung kreator favoritmu, langsung dan mudah. Buat link saweran & donasi untuk kreator dalam 1 menit.",
    images: [{ url: "/Logo2.png", alt: "Nyumbangin" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nyumbangin - Platform Apresiasi Kreator Indonesia",
    description: "Dukung kreator favoritmu, langsung dan mudah.",
    images: ["/Logo2.png"],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionWrapper>
          {children}
          <Toaster
            position="top-right"
            gutter={12}
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fffdf9',
                color: '#2d2d2d',
                border: '2px solid #2d2d2d',
                borderRadius: '14px',
                boxShadow: '4px 4px 0px #2d2d2d',
                fontFamily:
                  'var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 16px',
                maxWidth: '420px',
              },
              success: {
                iconTheme: {
                  primary: '#15803d',
                  secondary: '#fffdf9',
                },
              },
              error: {
                iconTheme: {
                  primary: '#dc2626',
                  secondary: '#fffdf9',
                },
              },
              loading: {
                iconTheme: {
                  primary: '#b8a492',
                  secondary: '#2d2d2d',
                },
              },
            }}
          />
        </SessionWrapper>
      </body>
    </html>
  );
}
