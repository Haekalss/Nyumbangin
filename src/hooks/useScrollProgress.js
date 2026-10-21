'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Progress bar scroll (0 → 1).
 * Pakai 1 scroll listener + requestAnimationFrame throttle supaya tidak
 * menutupi layout (tidak ada reads/writes berulang di luar frame).
 */
export default function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      setProgress(value);
      ticking.current = false;
    };

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return progress;
}
