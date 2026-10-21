'use client';

import Link from 'next/link';
import HeroOrbit from './HeroOrbit';
import SplitText from './SplitText';
import useParallax from '@/hooks/useParallax';
import { HERO_DELAY, SPLIT_STEP } from './motion';
import { IconArrow, IconCheck } from './icons';

const TRUST = ['Tanpa biaya pendaftaran', 'Pembayaran lokal', 'Pencairan transparan'];

export default function HeroSection() {
  const parallaxRef = useParallax({ speed: 0.12, max: 40 });

  return (
    <section className="nb-bg relative overflow-hidden">
      <div className="nb-grid pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Glow orb ambient */}
      <div
        className="nb-drift-a pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-sand-400/[0.07] blur-3xl"
        aria-hidden="true"
      />
      <div
        className="nb-drift-b pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-violet-400/[0.07] blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pb-16 lg:pt-32">
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <div
              className="nb-anim-up inline-flex items-center gap-2 rounded-full border border-sand-400/25 bg-sand-400/10 px-3 py-1.5"
              style={{ animationDelay: `${HERO_DELAY.eyebrow}ms` }}
            >
              <span className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-sand-300">
                Donasi + Overlay Real-Time
              </span>
            </div>

            <h1 className="mt-5 font-sans text-[2.1rem] font-extrabold leading-[1.08] tracking-tight text-sand-100 sm:text-5xl lg:text-[3.2rem]">
              <SplitText text="Terima donasi" delay={HERO_DELAY.titleLine1} step={SPLIT_STEP} className="block" />
              <SplitText
                text="langsung di stream"
                mode="line"
                delay={HERO_DELAY.titleLine2}
                className="nb-gradient-text"
              />
              <SplitText text="kamu." delay={HERO_DELAY.titleLine3} step={SPLIT_STEP} className="block" />
            </h1>

            <p
              className="nb-anim-up mx-auto mt-4 max-w-xl font-sans text-[15px] leading-relaxed text-sand-300/85 sm:text-base lg:mx-0"
              style={{ animationDelay: `${HERO_DELAY.subcopy}ms` }}
            >
              Satu platform untuk menerima donasi lokal dan menampilkannya real-time di OBS,
              Streamlabs, atau vMix.
            </p>

            <div
              className="nb-anim-up mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
              style={{ animationDelay: `${HERO_DELAY.cta}ms` }}
            >
              <Link
                href="/creator/register"
                className="nb-gradient-btn nb-sweep group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-sans text-[15px] font-bold transition-all hover:shadow-[0_16px_40px_-16px_rgba(184,164,146,0.85)]"
              >
                Mulai Terima Donasi
                <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#cara-kerja"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 font-sans text-[15px] font-semibold text-sand-200 transition-colors hover:border-sand-400/40 hover:bg-white/[0.08]"
              >
                Lihat Cara Kerjanya
              </Link>
            </div>

            <ul
              className="nb-anim-up mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start"
              style={{ animationDelay: `${HERO_DELAY.trust}ms` }}
            >
              {TRUST.map((item) => (
                <li key={item} className="flex items-center gap-1.5 font-sans text-[12.5px] text-sand-400">
                  <IconCheck className="h-3.5 w-3.5 text-teal-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Ilustrasi (parallax) */}
          <div ref={parallaxRef} className="nb-parallax">
            <HeroOrbit />
          </div>
        </div>
      </div>
    </section>
  );
}
