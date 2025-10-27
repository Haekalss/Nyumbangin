export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4 py-12">
      <div className="w-full max-w-2xl bg-white/80 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#b8a492]">Kebijakan Privasi</h1>
        <p className="mb-4 text-[#2d2d2d]">Kami menghargai privasi Anda. Data yang Anda berikan hanya digunakan untuk keperluan donasi dan tidak akan dibagikan ke pihak ketiga tanpa izin Anda.</p>
        <h2 className="text-xl font-bold mt-8 mb-2 text-[#b8a492]">Data yang Dikumpulkan</h2>
        <ul className="list-disc ml-6 text-[#2d2d2d]">
          <li>Nama, email, dan username saat mendaftar</li>
          <li>Data donasi (jumlah, pesan, waktu)</li>
          <li>Data pembayaran (hanya untuk proses donasi, tidak disimpan permanen)</li>
        </ul>
        <h2 className="text-xl font-bold mt-8 mb-2 text-[#b8a492]">Hak Anda</h2>
        <ul className="list-disc ml-6 text-[#2d2d2d]">
          <li>Anda dapat meminta penghapusan akun dan data kapan saja</li>
          <li>Data Anda dilindungi dan tidak dijual ke pihak lain</li>
        </ul>
  <p className="mt-8 text-[#2d2d2d]">Untuk pertanyaan lebih lanjut, <a href="/contact" className="underline text-[#b8a492] hover:text-[#2d2d2d]">hubungi tim kami</a>.</p>
      </div>
    </div>
  );
}
