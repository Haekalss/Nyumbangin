'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Menambahkan class `is-visible` pada elemen saat masuk viewport.
 * Dipakai untuk animasi scroll-reveal yang ringan (tanpa library).
 *
 * Opsi:
 *  - threshold   : kapan dianggap terlihat (0..1)
 *  - rootMargin  : margin trigger
 *  - once        : animasi hanya sekali (default true)
 *  - disabled    : matikan trigger (mis. untuk entrance on-load)
 */
export default function useReveal({
  threshold = 0.15,
  rootMargin = '0px 0px -80px 0px',
  once = true,
} = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Fallback untuk browser tanpa IntersectionObserver
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, visible };
}
