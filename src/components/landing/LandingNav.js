'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconMenu, IconClose, LogoMark } from './icons';

const NAV_LINKS = [
  { label: 'Untuk Siapa', href: '#untuk-siapa' },
  { label: 'Integrasi', href: '#integrasi' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'FAQ', href: '/faq' },
];

export default function LandingNav({ user = null }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isLoggedIn = Boolean(user);
  const isAdmin = user?.userType === 'admin' || user?.role === 'admin';

  const goToPanel = () => {
    setOpen(false);
    router.push(isAdmin ? '/admin' : '/dashboard');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Tutup menu mobile saat halaman di-scroll
  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [open]);

  return (
    <header className="nb-anim-down fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:pt-5">
      <nav
        className={`mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border px-3 py-2 transition-all duration-300 sm:px-4 ${
          scrolled
            ? 'nb-glass border-white/10 shadow-[0_10px_40px_-18px_rgba(0,0,0,0.9)]'
            : 'border-transparent bg-transparent'
        }`}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Nyumbangin">
          <LogoMark className="h-9 w-9" />
          <span className="font-sans text-lg font-bold tracking-tight text-sand-200">Nyumbangin</span>
        </Link>

        {/* Link desktop */}
        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="nb-underline rounded-full px-3.5 py-2 font-sans text-sm font-medium text-sand-300/80 transition-colors hover:bg-white/5 hover:text-sand-100"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <button
              type="button"
              onClick={goToPanel}
              className="hidden rounded-full bg-sand-300 px-4 py-2 font-sans text-sm font-bold text-ink-900 transition-colors hover:bg-sand-200 sm:block"
            >
              {isAdmin ? 'Panel Admin' : 'Dashboard'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="hidden rounded-full border border-sand-400/40 px-4 py-2 font-sans text-sm font-semibold text-sand-200 transition-colors hover:bg-white/5 sm:block"
              >
                Masuk
              </button>
              <Link
                href="/creator/register"
                className="nb-gradient-btn hidden rounded-full px-4 py-2 font-sans text-sm font-bold transition-all hover:shadow-[0_8px_28px_-10px_rgba(184,164,146,0.7)] sm:block"
              >
                Mulai Gratis
              </Link>
            </>
          )}

          {/* Tombol hamburger (mobile) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sand-200 lg:hidden"
          >
            {open ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Panel menu mobile */}
      {open && (
        <div className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-ink-850/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-2xl px-4 py-3 font-sans text-[15px] font-medium text-sand-200 transition-colors hover:bg-white/5"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/10 pt-3">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={goToPanel}
                className="col-span-2 rounded-2xl bg-sand-300 px-4 py-3 font-sans text-sm font-bold text-ink-900"
              >
                {isAdmin ? 'Panel Admin' : 'Buka Dashboard'}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    router.push('/login');
                  }}
                  className="rounded-2xl border border-sand-400/40 px-4 py-3 font-sans text-sm font-semibold text-sand-200"
                >
                  Masuk
                </button>
                <Link
                  href="/creator/register"
                  onClick={() => setOpen(false)}
                  className="nb-gradient-btn rounded-2xl px-4 py-3 text-center font-sans text-sm font-bold"
                >
                  Mulai Gratis
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
