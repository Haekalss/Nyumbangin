/**
 * Kumpulan ikon SVG ringkas (inline, tanpa dependency eksternal).
 * Semua ikon memakai `currentColor` agar mudah dipakai pada tema gelap.
 */

import { useId } from 'react';

export function IconHeart({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20Z" />
    </svg>
  );
}

export function IconUsers({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6S13.9 16 14.5 19" />
      <path d="M16 5.4a3.2 3.2 0 0 1 0 5.2M17.6 14.8c1.6.6 2.7 2 3 4.2" />
    </svg>
  );
}

export function IconBolt({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />
    </svg>
  );
}

export function IconBell({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 15.5V10a6 6 0 1 0-12 0v5.5L4.5 18h15L18 15.5Z" />
      <path d="M10 21h4" />
    </svg>
  );
}

export function IconTrophy({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5v1A3.5 3.5 0 0 0 8 10.5M17 6h2.5v1A3.5 3.5 0 0 1 16 10.5" />
      <path d="M12 14v3M9 20h6M10 17h4v3h-4z" />
    </svg>
  );
}

export function IconQr({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.5" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.5" />
      <path d="M14 14h3v3h-3zM19.5 14v3M14 20.5h3M20.5 17.5v3" />
    </svg>
  );
}

export function IconPlay({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5Z" />
    </svg>
  );
}

export function IconCheck({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function IconArrow({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconMenu({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconClose({ className = 'w-5 h-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Logo simple (SVG inline) — dipakai di nav & footer tanpa request gambar. */
export function LogoMark({ className = 'w-9 h-9' }) {
  // id unik supaya tidak bentrok ketika logo dipakai > 1x di halaman
  const gradientId = useId();

  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5e9da" />
          <stop offset="55%" stopColor="#d6c6b9" />
          <stop offset="100%" stopColor="#b8a492" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${gradientId})`} />
      <path
        d="M15 30.5c0-6 5.4-9.6 9-9.6 2.6 0 4.2 1.2 4.2 3.2 0 2.9-3.6 3.6-3.6 6.2 0 1.4 1 2.2 2.4 2.2"
        stroke="#1a1a1a"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="33" cy="30.5" r="2.3" fill="#1a1a1a" />
    </svg>
  );
}
