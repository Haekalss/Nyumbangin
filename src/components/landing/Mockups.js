'use client';

/**
 * Mockup UI digambar 100% dengan CSS/SVG (tanpa file gambar).
 * Placeholder sampai ada screenshot produk asli.
 * Versi ringkas untuk landing page (kartu 3-kolom).
 */

/** Mockup halaman donasi (frame ponsel). */
export function DonatePageMockup() {
  return (
    <div className="mx-auto w-full max-w-[168px] rounded-[22px] border border-white/10 bg-ink-900 p-2">
      <div className="overflow-hidden rounded-[17px] bg-gradient-to-b from-ink-800 to-ink-950 p-2.5">
        <div className="mx-auto mb-2 h-1 w-8 rounded-full bg-white/15" />
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-sand-300 to-sand-500" />
          <div className="leading-tight">
            <p className="font-sans text-[8px] font-bold text-sand-100">Dewi A.</p>
            <p className="font-sans text-[7px] text-sand-400">@dewistream</p>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1">
          {['5k', '10k', '25k'].map((v, i) => (
            <div
              key={v}
              className={`rounded-md border py-0.5 text-center font-sans text-[8px] font-bold ${
                i === 1 ? 'border-sand-300 bg-sand-300 text-ink-900' : 'border-white/10 text-sand-300/70'
              }`}
            >
              {v}
            </div>
          ))}
        </div>
        <div className="mt-1 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-1 font-sans text-[7px] text-sand-400/70">
          Tulis pesan...
        </div>
        <div className="mt-1.5 rounded-full bg-sand-300 py-1 text-center font-sans text-[8px] font-black text-ink-900">
          Donasi Rp10.000
        </div>
        <div className="mt-1 flex justify-center gap-1">
          {['QRIS', 'GOPAY', 'VA'].map((p) => (
            <span key={p} className="rounded bg-white/5 px-1 py-0.5 font-sans text-[6px] font-bold text-sand-400">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Mockup overlay notifikasi di dalam stream. */
export function OverlayMockup() {
  return (
    <div className="relative mx-auto w-full max-w-[250px] overflow-hidden rounded-xl border border-white/10 bg-ink-950">
      <div className="aspect-[16/9] bg-gradient-to-br from-[#1b2b2a] via-[#26221c] to-[#141414]" />
      <div className="absolute left-2 top-2 flex items-center gap-1.5 rounded-lg border border-sand-300/40 bg-ink-900/90 px-2 py-1.5 shadow-lg backdrop-blur">
        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-sand-300 to-sand-500" />
        <div className="leading-tight">
          <p className="font-sans text-[8px] font-bold text-sand-100">Rafi menyumbang</p>
          <p className="font-sans text-[8px] font-bold text-sand-300">Rp50.000</p>
        </div>
      </div>
      <div className="absolute bottom-2 left-2 right-2">
        <div className="h-0.5 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-3/4 rounded-full bg-sand-300" />
        </div>
      </div>
      <div className="absolute right-2 top-2 rounded bg-sand-300 px-1.5 py-0.5 font-sans text-[7px] font-black text-ink-900">
        LIVE
      </div>
    </div>
  );
}

/** Mockup dashboard analytics. */
export function DashboardMockup() {
  const bars = [42, 68, 34, 88, 56, 74, 96];
  return (
    <div className="mx-auto w-full max-w-[260px] rounded-xl border border-white/10 bg-ink-900 p-2.5">
      <div className="flex items-center justify-between">
        <p className="font-sans text-[9px] font-bold text-sand-200">Pendapatan 7 hari</p>
        <span className="rounded-full bg-teal-400/15 px-1.5 py-0.5 font-sans text-[8px] font-bold text-teal-400">
          +24%
        </span>
      </div>
      <div className="mt-2 flex h-14 items-end gap-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-sand-500/50 to-sand-300"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-white/10 pt-2">
        {[
          ['Saldo', 'Rp2,4jt'],
          ['Donasi', '312'],
          ['Payout', 'Rp1,8jt'],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="font-sans text-[7px] uppercase tracking-wide text-sand-400">{k}</p>
            <p className="font-sans text-[9px] font-bold text-sand-100">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
