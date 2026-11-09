'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function TermsPage() {
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
              Ketentuan Layanan & Pembayaran QRISGate
            </span>
            <h1 className="mt-2.5 text-2xl font-black tracking-tight text-[#2d2d2d] sm:text-3xl">
              Syarat &amp; Ketentuan Nyumbangin
            </h1>
            <p className="mt-1 text-xs font-semibold text-[#696057]">
              Berlaku untuk seluruh Donatur (Pendukung) dan Kreator di platform Nyumbangin.
            </p>
          </div>

          <div className="mt-6 space-y-6 text-sm leading-relaxed text-[#2d2d2d]">
            {/* 1. Ketentuan Pembayaran QRISGate */}
            <section className="rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] p-4 shadow-[3px_3px_0px_#2d2d2d]">
              <h2 className="text-base font-black text-[#2d2d2d]">
                1. Ketentuan Pembayaran QRIS (Regulasi QRISGate)
              </h2>
              <ul className="mt-2.5 list-disc space-y-2 pl-5 text-xs sm:text-sm font-medium text-[#4a433d]">
                <li>
                  <strong>Pemrosesan via QRISGate:</strong> Seluruh pembayaran donasi di Nyumbangin diproses melalui sistem <strong>QRISGate</strong> menggunakan metode <strong>QRIS Dinamis</strong> yang mendukung seluruh aplikasi e-wallet (GoPay, DANA, OVO, ShopeePay, LinkAja) dan Mobile Banking di Indonesia.
                </li>
                <li>
                  <strong>Kewajiban Membayar Nominal Tepat + Kode Unik (Rp 1–99):</strong> Setiap pesanan donasi secara otomatis ditambahkan <strong>kode unik sebesar Rp 1 hingga Rp 10</strong> (dapat melebar hingga <strong>Rp 99</strong> apabila antrean kode kecil sedang terpakai). Donatur <strong>WAJIB membayar sesuai total nominal tepat termasuk kode unik</strong> yang tertera pada halaman pembayaran QRISGate.
                </li>
                <li>
                  <strong>Larangan Pembulatan Nominal:</strong> Jangan membulatkan atau mengubah nominal pembayaran. Pembayaran dengan nominal yang berbeda dari tagihan (tidak menyertakan kode unik yang sesuai) <strong>tidak dapat dicocokkan dan tidak akan terdeteksi secara otomatis</strong> oleh sistem.
                </li>
                <li>
                  <strong>Masa Berlaku Instruksi Pembayaran (15 Menit):</strong> Setiap kode QRIS dan instruksi pembayaran hanya berlaku selama <strong>15 menit</strong> sejak dibuat. Apabila melewati batas waktu 15 menit belum dibayar, transaksi otomatis berstatus kedaluwarsa (<code>CANCELLED</code>/<code>EXPIRED</code>) dan donatur wajib membuat pesanan baru.
                </li>
                <li>
                  <strong>Nominal Rupiah Bulat:</strong> Seluruh nilai transaksi menggunakan mata uang Rupiah (IDR) dalam bilangan bulat penuh (tanpa desimal/sen), dengan batas minimum <strong>Rp 1</strong> dan maksimum <strong>Rp 10.000.000</strong> per transaksi.
                </li>
              </ul>
            </section>

            {/* 2. Ketentuan Umum Donatur */}
            <section>
              <h2 className="text-base font-black text-[#2d2d2d]">
                2. Ketentuan Bagi Donatur (Pendukung)
              </h2>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs sm:text-sm font-medium text-[#4a433d]">
                <li>
                  Donasi yang diberikan bersifat <strong>sukarela</strong> sebagai bentuk apresiasi kepada kreator dan <strong>tidak dapat dibatalkan atau dikembalikan (non-refundable)</strong>.
                </li>
                <li>
                  Hanya transaksi yang telah berhasil terverifikasi lunas (berstatus <strong>PAID</strong>) yang akan memicu notifikasi pada layar <em>stream overlay</em> kreator, antrean <em>Media Share</em>, papan peringkat (<em>leaderboard</em>), serta masuk ke dalam daftar saweran di dashboard kreator.
                </li>
                <li>
                  Donatur dilarang mengirimkan pesan dukungan atau tautan video <em>Media Share</em> yang mengandung unsur SARA, ujaran kebencian, pornografi, perjudian, penipuan, maupun pelanggaran hak cipta. Sistem penyaring kata otomatis dan kreator berhak menyensor atau melewati pesan/video yang melanggar.
                </li>
              </ol>
            </section>

            {/* 3. Ketentuan Bagi Kreator & Pencairan Dana */}
            <section>
              <h2 className="text-base font-black text-[#2d2d2d]">
                3. Ketentuan Bagi Kreator &amp; Pencairan Dana (Payout)
              </h2>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs sm:text-sm font-medium text-[#4a433d]">
                <li>
                  Kreator wajib memberikan informasi identitas, akun, serta data rekening bank atau e-wallet yang benar, aktif, dan sesuai dengan nama pemilik sah saat mendaftar.
                </li>
                <li>
                  Setiap donasi berstatus <strong>PAID</strong> yang masuk akan dikenakan <strong>biaya platform sebesar 5%</strong> untuk kebutuhan operasional server, pemeliharaan layanan, dan biaya transaksi gateway. Sisa saldo bersih akan diteruskan ke rekening/e-wallet kreator saat pencairan (<em>payout</em>).
                </li>
                <li>
                  Transaksi yang masih berstatus <strong>PENDING</strong>, <strong>CANCELLED</strong> (kedaluwarsa), atau <strong>FAILED</strong> tidak masuk ke saldo kreator dan tidak dapat dicairkan.
                </li>
                <li>
                  Proses pencairan dana (<em>payout</em>) diproses dalam estimasi waktu <strong>2–3 hari kerja (maksimal 3x24 jam hari kerja)</strong> sejak pengajuan dibuat, dengan minimal penarikan sebesar <strong>Rp 10.000</strong>. Nyumbangin berhak melakukan verifikasi keamanan tambahan apabila ditemukan aktivitas transaksi yang mencurigakan.
                </li>
              </ol>
            </section>

            {/* 4. Keamanan & Larangan Penyalahgunaan */}
            <section>
              <h2 className="text-base font-black text-[#2d2d2d]">
                4. Keamanan &amp; Larangan Penyalahgunaan
              </h2>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs sm:text-sm font-medium text-[#4a433d]">
                <li>
                  Dilarang keras menggunakan platform Nyumbangin dan layanan pembayaran QRISGate untuk transaksi pencucian uang, pendanaan aktivitas ilegal, perjudian online, penipuan (<em>fraud</em>), atau manipulasi webhook pembayaran.
                </li>
                <li>
                  Nyumbangin berhak menangguhkan atau menonaktifkan akun kreator secara permanen apabila terbukti melanggar syarat &amp; ketentuan ini serta regulasi hukum yang berlaku di Republik Indonesia.
                </li>
                <li>
                  Syarat dan ketentuan ini dapat diperbarui sewaktu-waktu guna menyesuaikan peningkatan layanan dan kebijakan regulasi sistem pembayaran.
                </li>
              </ol>
            </section>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t-2 border-[#2d2d2d]/15 pt-5 text-xs font-semibold text-[#696057]">
            <p>
              Jika ada pertanyaan atau kendala pembayaran, silakan{' '}
              <Link
                href="/contact"
                className="font-extrabold text-[#2d2d2d] underline decoration-[#b8a492] decoration-2 hover:text-[#8f857b]"
              >
                hubungi tim kami
              </Link>
              .
            </p>
            <Link
              href="/privacy"
              className="font-extrabold text-[#2d2d2d] hover:underline"
            >
              Baca Kebijakan Privasi &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
