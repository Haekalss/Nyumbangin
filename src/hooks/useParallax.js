'use client';

import { useEffect, useRef } from 'react';

/**
 * Parallax ringan: elemen bergerak lebih lambat dari scroll.
 *
 * - 1 listener scroll (passive) + requestAnimationFrame throttle
 * - memakai CSS variable `--parallax-y` (hanya transform, tanpa layout)
 * - otomatis nonaktif kalau user minta reduced motion
 * - berhenti kalau elemen keluar viewport (hemat CPU)
 */
export default function useParallax({ speed = 0.18, max = 60 } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let raf = null;
    let visible = true;
    let ticking = false;

    const apply = () => {
      ticking = false;
      if (!visible) return;
      const rect = node.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const distance = elementCenter - viewportCenter;
      const offset = Math.max(-max, Math.min(max, distance * speed));
      node.style.setProperty('--parallax-y', `${offset.toFixed(2)}px`);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(apply);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) onScroll();
      },
      { rootMargin: '100px 0px' }
    );
    observer.observe(node);

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, max]);

  return ref;
}
