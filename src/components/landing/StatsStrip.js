'use client';

import useCountUp from '@/hooks/useCountUp';
import useFetchJson from '@/hooks/useFetchJson';
import { formatCompact, formatCompactIDR, formatNumber } from './format';
import { SkeletonStat } from './Skeleton';

function StatItem({ label, value, format }) {
  const { ref, value: current } = useCountUp(value);

  return (
    <div className="text-center">
      <p
        ref={ref}
        className="nb-gradient-text font-sans text-2xl font-extrabold tracking-tight sm:text-[28px]"
      >
        {format ? format(current) : formatNumber(current)}
      </p>
      <p className="mt-1 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-sand-400">
        {label}
      </p>
    </div>
  );
}

/**
 * Baris statistik publik dengan angka count-up.
 * Section disembunyikan otomatis bila API gagal / data kosong.
 */
export default function StatsStrip() {
  const { data, loading } = useFetchJson('/api/public/stats');

  const stats = data?.success ? data.stats : null;
  const hasData = stats && (stats.creators || stats.donations || stats.totalAmount);

  // Jangan render apa-apa kalau tidak ada data
  if (!loading && !hasData) return null;

  return (
    <div className="border-y border-white/5 bg-ink-900/50">
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          {loading || !hasData ? (
            <>
              <SkeletonStat />
              <SkeletonStat />
              <SkeletonStat />
            </>
          ) : (
            <>
              <StatItem label="Kreator" value={stats.creators} />
              <StatItem label="Donasi" value={stats.donations} format={formatCompact} />
              <StatItem label="Terkumpul" value={stats.totalAmount} format={formatCompactIDR} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
