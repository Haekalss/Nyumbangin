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
  title: "Nyumbangin - Platform Donasi Digital",
  description: "Platform donasi digital untuk mendukung creator favorit Anda",
  keywords: "donasi, digital, creator, support, nyumbangin",
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
            toastOptions={{
              duration: 4000,
              style: {
                background: '#2d2d2d',
                color: '#b8a492',
                border: '2px solid #b8a492',
                fontFamily: 'monospace',
                fontSize: '14px'
              },
              success: {
                style: {
                  background: '#2d2d2d',
                  color: '#b8a492',
                  border: '2px solid #b8a492',
                },
                iconTheme: {
                  primary: '#b8a492',
                  secondary: '#2d2d2d',
                },
              },
              error: {
                style: {
                  background: '#2d2d2d',
                  color: '#ff6b6b',
                  border: '2px solid #ff6b6b',
                },
                iconTheme: {
                  primary: '#ff6b6b',
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
