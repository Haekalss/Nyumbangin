'use client';

import useScrollProgress from '@/hooks/useScrollProgress';

/**
 * Progress bar scroll — indikator posisi baca user.
 * 1 elemen, hanya `transform: scaleX()` → sangat murah.
 */
export default function ScrollProgress() {
  const progress = useScrollProgress();

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
      aria-hidden="true"
    >
      <div
        className="nb-progress h-full w-full"
        style={{ '--nb-progress': progress }}
      >
        <div className="h-full w-full bg-gradient-to-r from-sand-300 via-sand-400 to-sand-200" />
      </div>
    </div>
  );
}
