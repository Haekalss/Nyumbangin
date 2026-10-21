'use client';

import Link from 'next/link';
import { LogoMark } from './icons';

const COLUMNS = [
  {
    title: 'Produk',
    links: [
      { label: 'Fitur', href: '#untuk-siapa' },
      { label: 'Integrasi', href: '#integrasi' },
      { label: 'Cara Kerja', href: '#cara-kerja' },
    ],
  },
  {
    title: 'Kreator',
    links: [
      { label: 'Daftar Creator', href: '/creator/register' },
      { label: 'Masuk Dashboard', href: '/login' },
      { label: 'Panduan Overlay', href: '/faq' },
    ],
  },
  {
    title: 'Bantuan',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Hubungi Kami', href: '/contact' },
      { label: 'Kebijakan Privasi', href: '/privacy' },
      { label: 'Syarat & Ketentuan', href: '/terms' },
    ],
  },
];

export default function LandingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-ink-950">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">        <div className="grid gap-8 lg:grid-cols-[1.2fr_2fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <LogoMark className="h-9 w-9" />
              <span className="font-sans text-lg font-bold tracking-tight text-sand-100">Nyumbangin</span>
            </Link>
            <p className="mt-3 max-w-xs font-sans text-[13.5px] leading-relaxed text-sand-300/70">
              Platform donasi digital dengan notifikasi real-time untuk streamer dan content creator.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-7 sm:grid-cols-3">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.14em] text-sand-400">
                  {col.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-sans text-[13.5px] text-sand-300/75 transition-colors hover:text-sand-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Wordmark besar */}
        <div className="pointer-events-none mt-7 select-none overflow-hidden" aria-hidden="true">
          <p className="nb-gradient-text whitespace-nowrap text-center font-sans text-[8.5vw] font-black leading-none tracking-tighter opacity-[0.14]">
            Nyumbangin
          </p>
        </div>

        <div className="mt-5 flex flex-col items-center justify-between gap-2 border-t border-white/8 pt-4 sm:flex-row">
          <p className="font-sans text-[12.5px] text-sand-400">
            &copy; {new Date().getFullYear()} Nyumbangin. Semua hak dilindungi.
          </p>
          <p className="font-sans text-[12.5px] text-sand-400">Dibuat untuk kreator Indonesia.</p>
        </div>
      </div>
    </footer>
  );
}
