'use client';

import { ORBIT_DELAY } from './motion';
import { IconBell, IconQr, IconPlay, IconTrophy } from './icons';

/**
 * Ilustrasi hero: logo Nyumbangin di tengah dengan node-node
 * (metode pembayaran, notifikasi overlay, QR, leaderboard) yang
 * terhubung garis tipis. Murni SVG + CSS — tanpa aset gambar,
 * tanpa request network tambahan.
 */

/** Definisi node di orbit: posisi + delay pop-in. */
const NODES = [
  { id: 'qris', position: 'left-1/2 top-0 -translate-x-1/2', floatClass: 'nb-float' },
  { id: 'notif', position: 'right-[1%] top-[22%]', floatClass: 'nb-float nb-float-1' },
  { id: 'leaderboard', position: 'bottom-[16%] right-[2%]', floatClass: 'nb-float nb-float-2' },
  { id: 'media', position: 'bottom-0 left-1/2 -translate-x-1/2', floatClass: 'nb-float nb-float-3' },
  { id: 'ewallet', position: 'bottom-[16%] left-[2%]', floatClass: 'nb-float nb-float-4' },
  { id: 'qr', position: 'left-[1%] top-[22%]', floatClass: 'nb-float nb-float-5' },
];

/** Isi tiap node. */
const NODE_CONTENT = {
  qris: (
    <>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-400/15 text-[10px] font-black text-teal-400">
        QRIS
      </span>
      <span className="font-sans text-[11px] font-semibold text-sand-300">Scan &amp; bayar</span>
    </>
  ),
  notif: (
    <>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-sand-400/15 text-sand-300">
        <IconBell className="h-4 w-4" />
      </span>
      <div className="leading-tight">
        <p className="font-sans text-[10px] font-semibold text-sand-400">Notifikasi real-time</p>
        <p className="font-sans text-[11px] font-bold text-sand-100">Rafi · Rp50.000</p>
      </div>
    </>
  ),
  leaderboard: (
    <>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gold-400/15 text-gold-400">
        <IconTrophy className="h-4 w-4" />
      </span>
      <div className="leading-tight">
        <p className="font-sans text-[10px] font-semibold text-sand-400">Sultan bulan ini</p>
        <p className="font-sans text-[11px] font-bold text-sand-100">Nadia · Rp1,2jt</p>
      </div>
    </>
  ),
  media: (
    <>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-400/15 text-rose-400">
        <IconPlay className="h-3.5 w-3.5" />
      </span>
      <span className="font-sans text-[11px] font-semibold text-sand-300">Media share</span>
    </>
  ),
  ewallet: (
    <>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-sky-400/15 text-[9px] font-black text-sky-400">
        EWAL
      </span>
      <span className="font-sans text-[11px] font-semibold text-sand-300">E-Wallet</span>
    </>
  ),
  qr: (
    <>
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-400/15 text-violet-400">
        <IconQr className="h-4 w-4" />
      </span>
      <span className="font-sans text-[11px] font-semibold text-sand-300">QR di stream</span>
    </>
  ),
};

/** Node yang punya border aksen (node notifikasi). */
const HIGHLIGHTED = new Set(['notif']);

export default function HeroOrbit({ className = '' }) {
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[400px] lg:max-w-[440px] ${className}`}>
      {/* Cincin dekoratif (berputar lambat) */}
      <div
        className="nb-spin-slow absolute inset-[6%] rounded-full border border-dashed border-sand-400/20"
        aria-hidden="true"
      />
      <div className="absolute inset-[16%] rounded-full border border-white/5" aria-hidden="true" />

      {/* Garis penghubung */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="nb-orbit-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b8a492" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#b8a492" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#b8a492" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <g stroke="url(#nb-orbit-line)" strokeWidth="0.35" fill="none">
          <path d="M50 50 L50 9" />
          <path d="M50 50 L87 30" />
          <path d="M50 50 L86 74" />
          <path d="M50 50 L50 92" />
          <path d="M50 50 L14 74" />
          <path d="M50 50 L13 30" />
        </g>
        <g fill="#b8a492" opacity="0.55">
          <circle cx="50" cy="9" r="0.9" />
          <circle cx="87" cy="30" r="0.9" />
          <circle cx="86" cy="74" r="0.9" />
          <circle cx="50" cy="92" r="0.9" />
          <circle cx="14" cy="74" r="0.9" />
          <circle cx="13" cy="30" r="0.9" />
        </g>
      </svg>

      {/* Node utama (logo) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div
          className="nb-anim-scale nb-pulse-ring relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-sand-400/30 bg-gradient-to-br from-sand-300 to-sand-500 shadow-[0_20px_60px_-20px_rgba(184,164,146,0.8)] sm:h-36 sm:w-36"
          style={{ animationDelay: `${ORBIT_DELAY.logo}ms` }}
        >
          <img
            src="/logo.png"
            alt="Logo Nyumbangin"
            width={96}
            height={96}
            className="h-20 w-20 object-contain sm:h-24 sm:w-24"
          />
        </div>
        <div className="absolute -inset-6 -z-10 rounded-full bg-sand-400/10 blur-2xl" aria-hidden="true" />
      </div>

      {/* Node di sekeliling orbit */}
      {NODES.map((node, i) => (
        <div
          key={node.id}
          className={`nb-anim-pop absolute ${node.floatClass} ${node.position}`}
          style={{ animationDelay: `${ORBIT_DELAY.node + i * ORBIT_DELAY.step}ms` }}
        >
          <div
            className={`flex items-center gap-2 rounded-2xl border bg-ink-800/95 px-3 py-2 shadow-xl backdrop-blur ${
              HIGHLIGHTED.has(node.id)
                ? 'border-sand-400/25'
                : 'border-white/10'
            }`}
          >
            {NODE_CONTENT[node.id]}
          </div>
        </div>
      ))}
    </div>
  );
}
