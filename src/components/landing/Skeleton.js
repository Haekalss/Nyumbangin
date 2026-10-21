'use client';

/**
 * Skeleton primitive dengan shimmer.
 *
 * Shimmer memakai `transform: translateX()` pada pseudo-element
 * (GPU composite) — bukan `background-position` yang memicu repaint.
 */

export function SkeletonChip() {
  return (
    <div
      className="nb-skeleton flex shrink-0 items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4"
      aria-hidden="true"
    >
      <div className="nb-skeleton-block h-[30px] w-[30px] shrink-0 rounded-full" />
      <div className="space-y-1.5">
        <div className="nb-skeleton-block h-2 w-20 rounded-full" />
        <div className="nb-skeleton-block h-1.5 w-14 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="text-center" aria-hidden="true">
      <div className="nb-skeleton-block mx-auto h-6 w-20 rounded-lg" />
      <div className="nb-skeleton-block mx-auto mt-2 h-2 w-16 rounded-full" />
    </div>
  );
}

/** Baris skeleton untuk strip kreator. */
export function SkeletonChipRow({ count = 6 }) {
  return (
    <div className="flex gap-2.5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonChip key={i} />
      ))}
    </div>
  );
}
