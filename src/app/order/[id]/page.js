'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { formatRupiah } from '@/utils/format';

const POLL_INTERVAL_MS = 3000;
const MAX_POLL_DURATION_MS = 15 * 60 * 1000;

const STATUS_META = {
  PENDING: {
    label: 'Menunggu Pembayaran',
    description: 'Selesaikan pembayaran sebelum waktu habis.',
    badge: 'bg-[#f2e4d4] text-[#2d2d2d]',
    icon: 'clock',
  },
  PAID: {
    label: 'Pembayaran Berhasil',
    description: 'Donasi kamu sudah diterima. Terima kasih!',
    badge: 'bg-[#d9f2df] text-[#17633a]',
    icon: 'check',
  },
  CANCELLED: {
    label: 'Pesanan Kedaluwarsa',
    description: 'Batas waktu pembayaran sudah lewat atau pesanan dibatalkan.',
    badge: 'bg-[#f7dcd8] text-[#9b2c20]',
    icon: 'x',
  },
  FAILED: {
    label: 'Pembayaran Gagal',
    description: 'Pembayaran tidak berhasil diproses.',
    badge: 'bg-[#f7dcd8] text-[#9b2c20]',
    icon: 'x',
  },
};

function formatCountdown(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value) => String(value).padStart(2, '0');

  return hours > 0
    ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function StatusIcon({ type }) {
  if (type === 'check') {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    );
  }

  if (type === 'x') {
    return (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-[#fbf8f3] text-[#2d2d2d] font-sans antialiased selection:bg-[#b8a492] selection:text-[#2d2d2d]">
      <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <img src="/logo.png" alt="Nyumbangin" className="h-8 w-8 object-contain" />
            <span className="text-lg font-black tracking-tight text-[#2d2d2d]">nyumbangin</span>
          </Link>
          <span className="rounded-full border-2 border-[#2d2d2d] bg-[#f2e4d4] px-3 py-1 text-[11px] font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d]">
            Status Pesanan
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function OrderStatusPage() {
  const params = useParams();
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pollingEnded, setPollingEnded] = useState(false);
  const [now, setNow] = useState(Date.now());

  const pollStartedAtRef = useRef(0);

  useEffect(() => {
    if (!id) return undefined;

    let cancelled = false;
    let intervalId = null;
    let hardStopId = null;

    pollStartedAtRef.current = Date.now();
    setLoading(true);
    setError('');
    setPollingEnded(false);

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      if (!cancelled) setPollingEnded(true);
    };

    const tick = async () => {
      if (cancelled) return;

      try {
        const response = await axios.get(`/api/order/${id}`);
        if (cancelled) return;

        const nextOrder = response.data.order;
        setOrder(nextOrder);
        setError('');

        if (nextOrder.status !== 'PENDING') {
          stopPolling();
        } else if (Date.now() - pollStartedAtRef.current >= MAX_POLL_DURATION_MS) {
          stopPolling();
        }
      } catch (requestError) {
        if (cancelled) return;
        setError(
          requestError.response?.data?.error || 'Gagal memuat status pesanan. Coba lagi sebentar.'
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    tick();
    intervalId = setInterval(tick, POLL_INTERVAL_MS);
    hardStopId = setTimeout(stopPolling, MAX_POLL_DURATION_MS + 500);

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      if (hardStopId) clearTimeout(hardStopId);
    };
  }, [id]);

  useEffect(() => {
    if (order?.status !== 'PENDING') return undefined;

    setNow(Date.now());
    const intervalId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(intervalId);
  }, [order?.status]);

  if (loading && !order) {
    return (
      <Shell>
        <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-8 text-center shadow-[6px_6px_0px_#2d2d2d]">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#2d2d2d] border-t-transparent" />
          <p className="text-xs font-medium text-[#8c8276]">Memuat status pesanan...</p>
        </div>
      </Shell>
    );
  }

  if (!order) {
    return (
      <Shell>
        <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-6 text-center shadow-[6px_6px_0px_#2d2d2d]">
          <h1 className="text-xl font-black tracking-tight">Pesanan Tidak Ditemukan</h1>
          <p className="mt-2 text-sm font-medium text-[#696057]">
            {error || 'Periksa kembali tautan status pesanan kamu.'}
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center justify-center rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] px-4 py-2.5 text-xs font-extrabold text-[#fbf8f3] shadow-[2px_2px_0px_#b8a492] transition hover:bg-black active:translate-y-0.5"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </Shell>
    );
  }

  const meta = STATUS_META[order.status] || STATUS_META.PENDING;
  const expiresAt = order.expiresAt
    ? new Date(order.expiresAt).getTime()
    : new Date(order.createdAt).getTime() + MAX_POLL_DURATION_MS;
  const remainingMs = Math.max(0, expiresAt - now);
  const isPending = order.status === 'PENDING';
  const totalAmount = order.totalAmount ?? order.amount;
  const uniqueCode = order.uniqueCode ?? Math.max(0, totalAmount - order.amount);

  return (
    <Shell>
      <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-5 shadow-[6px_6px_0px_#2d2d2d] sm:p-7">
        <div className="flex items-start justify-between gap-3 border-b-2 border-[#2d2d2d]/10 pb-4">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8f857b]">
              Pesanan
            </p>
            <h1 className="mt-0.5 text-lg font-black tracking-tight text-[#2d2d2d] sm:text-xl">
              {order.creator?.displayName || order.creator?.username}
            </h1>
            <p className="mt-0.5 font-mono text-[11px] font-bold text-[#8f857b]">
              {order.merchantRef}
            </p>
          </div>
          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#2d2d2d] px-2.5 py-1.5 text-[10px] font-extrabold shadow-[2px_2px_0px_#2d2d2d] ${meta.badge}`}
          >
            <StatusIcon type={meta.icon} />
            {meta.label}
          </span>
        </div>

        <p className="mt-4 text-sm font-medium leading-relaxed text-[#696057]">{meta.description}</p>

        {error && (
          <div className="mt-4 rounded-xl border-2 border-red-600 bg-red-50 px-3.5 py-3">
            <p className="text-xs font-bold leading-relaxed text-red-700">{error}</p>
          </div>
        )}

        {isPending && (
          <div className="mt-5 rounded-2xl border-2 border-[#2d2d2d] bg-[#f2e4d4] p-4 shadow-[3px_3px_0px_#2d2d2d]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#696057]">
                  Sisa waktu
                </p>
                <p className="mt-0.5 font-mono text-2xl font-black text-[#2d2d2d]">
                  {formatCountdown(remainingMs)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#696057]">
                  Total bayar
                </p>
                <p className="mt-0.5 font-mono text-xl font-black text-[#2d2d2d]">
                  {formatRupiah(totalAmount)}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-1.5 rounded-xl border border-[#2d2d2d]/20 bg-[#fffdf9] p-3 text-xs font-semibold text-[#696057]">
              <div className="flex items-center justify-between gap-3">
                <span>Nominal donasi</span>
                <span className="font-mono font-black text-[#2d2d2d]">
                  {formatRupiah(order.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Kode unik</span>
                <span className="font-mono font-black text-[#2d2d2d]">
                  {uniqueCode > 0 ? `+ ${formatRupiah(uniqueCode)}` : '-'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[#2d2d2d]/10 pt-1.5">
                <span className="font-extrabold text-[#2d2d2d]">Bayar tepat</span>
                <span className="font-mono font-black text-[#2d2d2d]">
                  {formatRupiah(totalAmount)}
                </span>
              </div>
            </div>

            <p className="mt-3 text-[11px] font-medium leading-relaxed text-[#696057]">
              Bayar sesuai nominal tepat termasuk kode unik. Nominal yang berbeda tidak akan
              terdeteksi otomatis.
            </p>

            {order.checkoutUrl && (
              <a
                href={order.checkoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex w-full items-center justify-center rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] px-4 py-2.5 text-xs font-extrabold text-[#fbf8f3] shadow-[2px_2px_0px_#b8a492] transition hover:bg-black active:translate-y-0.5"
              >
                Buka Halaman Pembayaran
              </a>
            )}
          </div>
        )}

        {order.status === 'PAID' && (
          <div className="mt-5 rounded-2xl border-2 border-[#2d2d2d] bg-[#d9f2df] p-4 shadow-[3px_3px_0px_#2d2d2d]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#17633a]">
                  Total dibayar
                </p>
                <p className="mt-0.5 font-mono text-2xl font-black text-[#17633a]">
                  {formatRupiah(totalAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#17633a]">
                  Dibayar pada
                </p>
                <p className="mt-0.5 text-xs font-bold text-[#17633a]">
                  {formatDateTime(order.paidAt)}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isPending && order.status !== 'PAID' && (
          <div className="mt-5 rounded-2xl border-2 border-[#2d2d2d] bg-[#f7dcd8] p-4 text-center shadow-[3px_3px_0px_#2d2d2d]">
            <p className="text-sm font-bold text-[#9b2c20]">
              Pesanan ini tidak dapat dibayar lagi.
            </p>
            <Link
              href={`/${order.creator?.username}`}
              className="mt-3 inline-flex items-center justify-center rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] px-4 py-2.5 text-xs font-extrabold text-[#fbf8f3] shadow-[2px_2px_0px_#b8a492] transition hover:bg-black active:translate-y-0.5"
            >
              Buat Donasi Baru
            </Link>
          </div>
        )}

        {isPending && pollingEnded && (
          <p className="mt-4 rounded-xl border-2 border-[#2d2d2d]/20 bg-[#fbf8f3] px-3.5 py-2.5 text-center text-[11px] font-bold text-[#696057]">
            Pengecekan otomatis dihentikan setelah 15 menit. Muat ulang halaman untuk memeriksa
            status terbaru.
          </p>
        )}

        <div className="mt-5 space-y-2 border-t-2 border-[#2d2d2d]/10 pt-4 text-xs font-semibold text-[#696057]">
          <div className="flex items-center justify-between gap-3">
            <span>Donatur</span>
            <span className="text-right font-black text-[#2d2d2d]">{order.name}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Dibuat</span>
            <span className="text-right font-bold text-[#2d2d2d]">
              {formatDateTime(order.createdAt)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Metode</span>
            <span className="text-right font-bold text-[#2d2d2d]">
              {order.paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' : 'QRIS'}
            </span>
          </div>
        </div>

        {order.message && (
          <div className="mt-4 rounded-xl border-2 border-[#2d2d2d]/20 bg-[#fbf8f3] px-3.5 py-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#8f857b]">
              Pesan
            </p>
            <p className="mt-1 text-sm font-medium italic leading-relaxed text-[#696057]">
              “{order.message}”
            </p>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/${order.creator?.username}`}
            className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-[#2d2d2d] bg-[#fffdf9] px-4 py-2.5 text-xs font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] transition hover:bg-[#f2e4d4] active:translate-y-0.5"
          >
            Kembali ke Halaman Donasi
          </Link>
          {isPending && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex flex-1 items-center justify-center rounded-xl border-2 border-[#2d2d2d] bg-[#b8a492] px-4 py-2.5 text-xs font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] transition hover:bg-[#cabaa9] active:translate-y-0.5"
            >
              Muat Ulang Status
            </button>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-[11px] font-medium text-[#8f857b]">
        Status diperbarui otomatis setiap 3 detik selama menunggu pembayaran.
      </p>
    </Shell>
  );
}
