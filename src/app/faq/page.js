'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

export default function FaqPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        if (userData.role === 'admin' || userData.isAdmin) {
          setUserType('admin');
        } else {
          setUserType('creator');
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleBack = () => {
    if (!isLoggedIn) {
      router.push('/');
    } else if (userType === 'admin') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const faqItems = [
    {
      q: 'Bagaimana cara mengaktifkan halaman donasi saya?',
      a: 'Lengkapi username serta data rekening bank atau e-wallet di menu Pengaturan Akun, lalu simpan. Setelah tersimpan, tautan donasi (/username) otomatis aktif dan siap dibagikan ke pendukung Anda.'
    },
    {
      q: 'Metode pembayaran apa saja yang didukung?',
      a: 'Seluruh donasi diproses melalui QRISGate menggunakan QRIS Dinamis. Pendukung dapat memindai (scan) kode QR menggunakan GoPay, DANA, OVO, ShopeePay, LinkAja, maupun semua aplikasi Mobile Banking di Indonesia.'
    },
    {
      q: 'Mengapa nominal pembayaran QRIS memiliki tambahan kode unik Rp 1–99?',
      a: 'Kode unik otomatis (Rp 1 hingga Rp 99) digunakan oleh sistem QRISGate untuk mengenali dan memverifikasi pembayaran secara instan (real-time). Donatur wajib membayar sesuai total tagihan termasuk kode unik tanpa dibulatkan.'
    },
    {
      q: 'Kapan dana donasi bisa dicairkan (payout)?',
      a: 'Saldo dari transaksi yang berstatus PAID dapat diajukan pencairannya kapan saja dengan minimal penarikan Rp 10.000. Estimasi proses pencairan membutuhkan waktu 2–3 hari kerja (maksimal 3x24 jam hari kerja) setelah pengajuan dibuat.'
    },
    {
      q: 'Mengapa donasi berstatus Pending atau Expired tidak muncul di tabel Dashboard?',
      a: 'Dashboard kreator, papan peringkat (leaderboard), dan notifikasi stream overlay hanya menampilkan transaksi yang sudah lunas terverifikasi (PAID) agar rekap saldo dan antrean alert tetap akurat.'
    },
    {
      q: 'Apakah pendukung bisa mengirim saweran secara anonim?',
      a: 'Ya, pendukung cukup mencentang opsi "Sembunyikan nama (Anonim)" pada halaman donasi sebelum melanjutkan ke pembayaran QRIS.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#fbf8f3] text-[#2d2d2d] font-sans antialiased selection:bg-[#b8a492] selection:text-[#2d2d2d]">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Top bar */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <img src="/logo.png" alt="Nyumbangin" className="h-8 w-8 object-contain" />
            <span className="text-lg font-black tracking-tight text-[#2d2d2d]">nyumbangin</span>
          </Link>
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] px-4 py-2 text-xs font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] transition hover:bg-[#e7d6c2] cursor-pointer active:translate-y-0.5"
          >
            ← Kembali
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-6 shadow-[6px_6px_0px_#2d2d2d] sm:p-8">
          <div className="border-b-2 border-[#2d2d2d]/15 pb-4">
            <span className="inline-block rounded-lg border-2 border-[#2d2d2d] bg-[#f2e4d4] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#2d2d2d] shadow-[1px_1px_0px_#2d2d2d]">
              Pusat Bantuan
            </span>
            <h1 className="mt-2.5 text-2xl font-black tracking-tight text-[#2d2d2d] sm:text-3xl">
              FAQ &amp; Bantuan Kreator
            </h1>
            <p className="mt-1 text-xs font-semibold text-[#696057]">
              Pertanyaan yang sering diajukan seputar donasi QRISGate, overlay, dan pencairan saldo.
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] p-4 shadow-[3px_3px_0px_#2d2d2d]"
              >
                <h2 className="text-sm sm:text-base font-black text-[#2d2d2d]">
                  {idx + 1}. {item.q}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm font-medium leading-relaxed text-[#4a433d]">
                  {item.a}
                </p>
              </div>
            ))}
          </div>

          {/* Tips Box */}
          <div className="mt-6 rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] p-4 shadow-[3px_3px_0px_#2d2d2d]">
            <h3 className="text-sm font-black text-[#2d2d2d]">
              Tips Memaksimalkan Dukungan Komunitas
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs sm:text-sm font-medium text-[#4a433d]">
              <li>Pasang widget <strong>Notifikasi</strong>, <strong>Media Share</strong>, dan <strong>QR Donate</strong> di OBS saat live streaming.</li>
              <li>Sematkan tautan <code>nyumbangin.web.id/username</code> di bio sosial media dan deskripsi YouTube/TikTok.</li>
              <li>Sapa dan ucapkan terima kasih secara langsung ketika notifikasi saweran muncul di layar.</li>
            </ul>
          </div>

          {/* Footer Navigation inside Card */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-2 border-[#2d2d2d]/15 pt-5 text-xs font-semibold text-[#696057]">
            <span>© {new Date().getFullYear()} Nyumbangin</span>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-extrabold text-[#2d2d2d]">
              <Link href="/privacy" className="hover:underline">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="hover:underline">
                Syarat &amp; Ketentuan
              </Link>
              <Link href="/faq" className="underline decoration-[#b8a492] decoration-2">
                FAQ &amp; Bantuan
              </Link>
              <Link href="/contact" className="hover:underline">
                Hubungi Kami
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
