export default function TermsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4 py-12">
      <div className="w-full max-w-2xl bg-white/80 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#b8a492]">Syarat & Ketentuan</h1>
        <ol className="list-decimal ml-6 text-[#2d2d2d] space-y-2">
          <li>Pengguna wajib memberikan data yang benar saat mendaftar.</li>
          <li>Donasi yang sudah masuk tidak dapat dikembalikan kecuali ada kesalahan sistem.</li>
          <li>Penyalahgunaan platform akan dikenakan sanksi sesuai kebijakan admin.</li>
          <li>Platform dapat berubah sewaktu-waktu untuk peningkatan layanan.</li>
          <li>Dengan menggunakan Nyumbangin, Anda setuju dengan kebijakan privasi dan syarat ini.</li>
            <li>Setiap donasi yang masuk akan dikenakan <span className="font-bold">biaya platform 5%</span> dari total donasi. Sisanya akan diteruskan ke creator sesuai data rekening/e-wallet yang terdaftar. Biaya ini digunakan untuk operasional, pengembangan, dan layanan Nyumbangin.</li>
            <li>Donasi yang belum berstatus <span className="font-bold">PAID</span> belum bisa dicairkan.</li>
            <li>Data rekening/e-wallet harus valid dan sesuai identitas.</li>
            <li>Proses payout mengikuti jam operasional dan hari kerja. Nyumbangin berhak melakukan verifikasi tambahan jika diperlukan.</li>
        </ol>
  <p className="mt-8 text-[#2d2d2d]">Jika ada pertanyaan, silakan <a href="/contact" className="underline text-[#b8a492] hover:text-[#2d2d2d]">hubungi tim kami</a>.</p>
      </div>
    </div>
  );
}
