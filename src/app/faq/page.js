
export default function FaqPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono px-4 py-12">
      <div className="w-full max-w-2xl bg-white/80 rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-[#b8a492]">FAQ & Bantuan Creator</h1>
        <div className="space-y-6 text-[#2d2d2d]">
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Bagaimana cara mengaktifkan donasi?</h2>
            <p>Isi data rekening/e-wallet di menu profil, lalu simpan. Setelah itu, link donasi akan aktif dan bisa dibagikan ke pendukung Anda.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Kapan dana donasi bisa dicairkan?</h2>
            <p>Dana bisa dicairkan setelah status donasi <span className="font-bold">PAID</span>. Proses payout biasanya 1-2 hari kerja setelah permintaan pencairan.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Bagaimana cara promosi link donasi?</h2>
            <p>Bagikan link donasi di media sosial, bio Instagram, deskripsi YouTube, atau saat live streaming. Semakin aktif promosi, semakin besar peluang mendapat dukungan.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Bagaimana jika ada masalah payout?</h2>
            <p>Pastikan data rekening/e-wallet sudah benar dan sesuai. Jika ada kendala, hubungi support melalui email <a href="mailto:admin@nyumbangin.com" className="underline text-[#b8a492] hover:text-[#2d2d2d]">admin@nyumbangin.com</a>.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Apakah donasi bisa anonim?</h2>
            <p>Ya, donatur bisa memilih nama anonim saat melakukan donasi.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#b8a492] mb-2">Tips agar donasi lebih banyak?</h2>
            <ul className="list-disc ml-6">
              <li>Aktif berinteraksi dengan pendukung.</li>
              <li>Berikan ucapan terima kasih di konten/live.</li>
              <li>Update konten secara rutin.</li>
              <li>Promosikan link donasi di berbagai platform.</li>
            </ul>
          </div>
        </div>
        <p className="mt-8 text-[#2d2d2d]">Jika ada pertanyaan lain, silakan hubungi admin di <a href="mailto:admin@nyumbangin.com" className="underline text-[#b8a492] hover:text-[#2d2d2d]">admin@nyumbangin.com</a>.</p>
      </div>
    </div>
  );
}
