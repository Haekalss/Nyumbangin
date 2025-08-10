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
        </ol>
  <p className="mt-8 text-[#2d2d2d]">Jika ada pertanyaan, silakan hubungi admin di <a href="mailto:admin@nyumbangin.com" className="underline text-[#b8a492] hover:text-[#2d2d2d]">admin@nyumbangin.com</a>.</p>
      </div>
    </div>
  );
}
