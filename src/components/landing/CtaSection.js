'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SectionContainer } from './Section';
import { MASKOT_BLUR } from './blur';
import { IconArrow, IconCheck } from './icons';

const POINTS = ['Gratis daftar & pasang overlay', 'Tanpa biaya untuk pendukung', 'Bisa pencairan mingguan'];

/** Delay animasi entrance di section ini. */
const DELAY = { subcopy: 90, points: 180, cta: 270 };

export default function CtaSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/5 bg-ink-900">
      <div className="nb-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />

      <SectionContainer className="relative">
        <div className="nb-panel relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
          {/* Glow dekoratif */}
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sand-400/12 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-violet-400/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="text-center lg:text-left">
              <h2 className="nb-anim-up font-sans text-2xl font-extrabold leading-tight tracking-tight text-sand-100 sm:text-3xl">
                Siap mulai perjalanan <span className="nb-gradient-text">nyumbang</span> kamu?
              </h2>
              <p
                className="nb-anim-up mx-auto mt-3 max-w-lg font-sans text-[15px] leading-relaxed text-sand-300/80 lg:mx-0"
                style={{ animationDelay: `${DELAY.subcopy}ms` }}
              >
                Buat halaman donasi pribadi, pasang widget di stream, dan mulai terima dukungan hari ini
                juga.
              </p>

              <ul
                className="nb-anim-up mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 lg:justify-start"
                style={{ animationDelay: `${DELAY.points}ms` }}
              >
                {POINTS.map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-1.5 font-sans text-[12.5px] text-sand-300/80"
                  >
                    <IconCheck className="h-3.5 w-3.5 text-teal-400" />
                    {p}
                  </li>
                ))}
              </ul>

              <div
                className="nb-anim-up mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
                style={{ animationDelay: `${DELAY.cta}ms` }}
              >
                <Link
                  href="/creator/register"
                  className="nb-gradient-btn nb-sweep group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-sans text-[15px] font-bold transition-all hover:shadow-[0_16px_40px_-16px_rgba(184,164,146,0.85)]"
                >
                  Mulai Sekarang — Gratis
                  <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.04] px-7 py-3.5 font-sans text-[15px] font-semibold text-sand-200 transition-colors hover:border-sand-400/40 hover:bg-white/[0.08]"
                >
                  Baca FAQ
                </Link>
              </div>
            </div>

            {/* Maskot */}
            <div className="nb-anim-scale relative flex justify-center lg:justify-end">
              <div
                className="absolute inset-0 -z-10 rounded-full bg-sand-400/12 blur-3xl"
                aria-hidden="true"
              />
              {/* Animasi float dipindah ke wrapper agar <img> sendiri
                  tidak punya transform + filter sekaligus (lebih stabil). */}
              <div className="nb-float relative w-32 sm:w-40 lg:w-48">
                <Image
                  src="/maskot.png"
                  alt="Maskot Nyumbangin"
                  width={384}
                  height={384}
                  sizes="(max-width: 640px) 8rem, (max-width: 1024px) 10rem, 12rem"
                  placeholder="blur"
                  blurDataURL={MASKOT_BLUR}
                  className="h-auto w-full drop-shadow-2xl"
                  priority={false}
                />
              </div>
            </div>
          </div>
        </div>
      </SectionContainer>
    </section>
  );
}
