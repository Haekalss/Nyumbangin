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
  title: "Nyumbangin - Platform Apresiasi Kreator Indonesia",
  description: "Platform apresiasi kreator Indonesia. Dukung kreator favoritmu, langsung dan mudah.",
  keywords: "apresiasi kreator, dukung kreator, donasi, saweran, creator, nyumbangin",
  authors: [{ name: "Nyumbangin Team" }],
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
