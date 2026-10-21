'use client';

import useReveal from '@/hooks/useReveal';

/**
 * Heading section yang konsisten: eyebrow + judul.
 *
 * `visible` opsional — kalau diberikan, komponen ini ikut memakai state
 * dari observer section (menghemat 1 IntersectionObserver per section).
 * Kalau tidak, komponen membuat observer sendiri.
 */
export function SectionHeading({ eyebrow, children, visible, className = '' }) {
  const own = useReveal({ threshold: 0.1 });
  const isVisible = visible ?? own.visible;
  const ref = visible ? undefined : own.ref;

  return (
    <div
      ref={ref}
      className={`nb-reveal mx-auto max-w-2xl text-center ${isVisible ? 'is-visible' : ''} ${className}`}
    >
      {eyebrow && (
        <p className="font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-sand-400">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-2.5 font-sans text-2xl font-extrabold tracking-tight text-sand-100 sm:text-3xl">
        {children}
      </h2>
    </div>
  );
}

/** Container standar untuk isi section. */
export function SectionContainer({ children, className = '' }) {
  return (
    <div className={`mx-auto max-w-7xl px-5 py-14 sm:px-6 lg:px-8 lg:py-20 ${className}`}>
      {children}
    </div>
  );
}
