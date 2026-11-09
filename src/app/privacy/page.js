'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function PrivacyPolicy() {
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
              Perlindungan Data &amp; Privasi
            </span>
            <h1 className="mt-2.5 text-2xl font-black tracking-tight text-[#2d2d2d] sm:text-3xl">
              Kebijakan Privasi
            </h1>
            <p className="mt-1 text-xs font-semibold text-[#696057]">
              Kami menghargai privasi Anda. Data yang Anda berikan hanya digunakan untuk keperluan layanan donasi dan tidak pernah diperjualbelikan.
            </p>
          </div>

          <div className="mt-6 space-y-6 text-sm leading-relaxed text-[#2d2d2d]">
            {/* Login dengan Google OAuth */}
            <section className="rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] p-4 shadow-[3px_3px_0px_#2d2d2d]">
              <h2 className="text-base font-black text-[#2d2d2d]">
                1. Login dengan Google OAuth 2.0
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-[#4a433d]">
                Nyumbangin menggunakan <strong>Google OAuth 2.0</strong> sebagai opsi masuk yang cepat dan aman.
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-lg border border-[#2d2d2d]/20 bg-[#fffdf9] p-3">
                  <p className="text-xs font-extrabold text-[#2d2d2d] mb-1.5">Data yang Kami Akses:</p>
                  <ul className="list-disc pl-4 text-xs font-medium text-[#4a433d] space-y-1">
                    <li><strong>Alamat Email</strong> — identifikasi akun &amp; notifikasi layanan</li>
                    <li><strong>Nama Lengkap</strong> — ditampilkan pada profil kreator</li>
                    <li><strong>Foto Profil</strong> (opsional) — digunakan sebagai avatar</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-[#2d2d2d]/20 bg-[#fffdf9] p-3">
                  <p className="text-xs font-extrabold text-[#2d2d2d] mb-1.5">Data yang TIDAK Diakses:</p>
                  <ul className="list-disc pl-4 text-xs font-medium text-[#4a433d] space-y-1">
                    <li>Isi pesan Gmail atau kontak pribadi Anda</li>
                    <li>Google Drive, Calendar, atau layanan lain</li>
                    <li>Password akun Google Anda</li>
                  </ul>
                </div>
              </div>

              <p className="mt-3 text-xs font-medium text-[#696057]">
                Anda dapat mencabut akses kapan saja melalui halaman{' '}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold text-[#2d2d2d] underline decoration-[#b8a492] decoration-2 hover:text-[#696057]"
                >
                  Google Account Permissions
                </a>
                .
              </p>
            </section>

            {/* Data yang Dikumpulkan */}
            <section>
              <h2 className="text-base font-black text-[#2d2d2d]">
                2. Data yang Dikumpulkan
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs sm:text-sm font-medium text-[#4a433d]">
                <li>Nama tampilan, alamat email, dan username saat mendaftar sebagai kreator.</li>
                <li>Data transaksi dukungan (nama donatur/anonim, nominal, pesan dukungan, tautan media share, dan waktu transaksi).</li>
                <li>Data pembayaran diproses secara aman melalui sistem <strong>QRISGate (QRIS Dinamis)</strong> dan kredensial pembayaran donatur tidak disimpan di server kami.</li>
                <li>Informasi profil kreator (bio, foto profil, tautan sosial media, serta rekening/e-wallet tujuan pencairan).</li>
              </ul>
            </section>

            {/* Bagaimana Kami Menggunakan Data Anda */}
            <section>
              <h2 className="text-base font-black text-[#2d2d2d]">
                3. Penggunaan Data
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs sm:text-sm font-medium text-[#4a433d]">
                <li>Membuat, mengamankan, dan mengelola akun kreator Anda.</li>
                <li>Memproses transaksi donasi QRIS Dinamis serta menyalurkan notifikasi ke <em>stream overlay</em> secara <em>real-time</em>.</li>
                <li>Memproses pencairan saldo (<em>payout</em>) ke rekening atau e-wallet kreator yang terdaftar.</li>
                <li>Mencegah penyalahgunaan, aktivitas penipuan (<em>fraud</em>), dan menjaga keamanan platform.</li>
              </ul>
            </section>

            {/* Keamanan & Hak Pengguna */}
            <section>
              <h2 className="text-base font-black text-[#2d2d2d]">
                4. Keamanan Data &amp; Hak Pengguna
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-xs sm:text-sm font-medium text-[#4a433d]">
                <li>Seluruh koneksi dilindungi dengan enkripsi HTTPS/SSL, password akun di-hash menggunakan <code>bcrypt</code>, dan verifikasi webhook pembayaran divalidasi dengan tanda tangan kriptografi <code>HMAC-SHA256</code>.</li>
                <li>Anda berhak mengakses, memperbarui informasi profil, atau mengajukan penghapusan akun kapan saja melalui tim dukungan kami.</li>
                <li>Kami hanya berbagi informasi transaksi yang diperlukan dengan mitra infrastruktur resmi (<strong>QRISGate</strong> untuk pemrosesan QRIS Dinamis dan <strong>Google OAuth</strong> untuk autentikasi) serta <strong>tidak pernah menjual data Anda</strong> kepada pihak ketiga.</li>
              </ul>
            </section>
          </div>

          {/* Footer Navigation inside Card */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-2 border-[#2d2d2d]/15 pt-5 text-xs font-semibold text-[#696057]">
            <span>© {new Date().getFullYear()} Nyumbangin</span>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-extrabold text-[#2d2d2d]">
              <Link href="/privacy" className="underline decoration-[#b8a492] decoration-2">
                Kebijakan Privasi
              </Link>
              <Link href="/terms" className="hover:underline">
                Syarat &amp; Ketentuan
              </Link>
              <Link href="/faq" className="hover:underline">
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
