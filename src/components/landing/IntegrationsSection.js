'use client';

import useReveal from '@/hooks/useReveal';
import { STAGGER } from './motion';

/**
 * Strip integrasi — 1 baris logo, tanpa heading block.
 * `mark` = inisial 2 huruf sebagai placeholder logo resmi.
 */
const INTEGRATIONS = [
  { name: 'OBS Studio', mark: 'OBS', tone: 'from-sky-400/25 to-sky-400/5 text-sky-300' },
  { name: 'Streamlabs', mark: 'SL', tone: 'from-rose-400/25 to-rose-400/5 text-rose-300' },
  { name: 'vMix', mark: 'vM', tone: 'from-violet-400/25 to-violet-400/5 text-violet-300' },
  { name: 'TikTok Studio', mark: 'TT', tone: 'from-white/20 to-white/5 text-sand-100' },
  { name: 'YouTube Live', mark: 'YT', tone: 'from-gold-400/25 to-gold-400/5 text-gold-300' },
  { name: 'Xsplit', mark: 'XS', tone: 'from-teal-400/25 to-teal-400/5 text-teal-300' },
];

const WIDGETS = ['Notifikasi', 'Leaderboard', 'QR Donasi', 'Media Share'];

export default function IntegrationsSection() {
  const { ref, visible } = useReveal({ threshold: 0.1 });

  return (
    <section
      id="integrasi"
      className="relative overflow-hidden border-y border-white/5 bg-ink-900"
    >
      <div className="nb-grid pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />

      <div
        ref={ref}
        className={`nb-reveal relative mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8 ${
          visible ? 'is-visible' : ''
        }`}
      >
        <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
          {/* Label + daftar widget */}
          <div className="shrink-0 text-center lg:text-left">
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-sand-400">
              Integrasi
            </p>
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 lg:justify-start">
              {WIDGETS.map((w) => (
                <span
                  key={w}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-sans text-[11px] font-semibold text-sand-300"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>

          {/* Logo aplikasi streaming */}
          <ul className="flex flex-wrap items-center justify-center gap-2 lg:justify-end">
            {INTEGRATIONS.map((item, i) => (
              <li
                key={item.name}
                title={item.name}
                className="nb-anim-pop nb-panel nb-panel-hover flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  animationDelay: `${STAGGER.integrationBase + i * STAGGER.integration}ms`,
                }}
              >
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br font-sans text-[10px] font-black ${item.tone}`}
                >
                  {item.mark}
                </span>
                <span className="font-sans text-[12px] font-semibold text-sand-200">{item.name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
