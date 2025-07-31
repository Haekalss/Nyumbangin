'use client'

import { useParams } from 'next/navigation';

export default function OverlayIndexPage() {
  const params = useParams();
  const username = params?.username;

  if (!username) {
    return null;
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="fixed inset-0 bg-[#2d2d2d] font-mono flex items-center justify-center">
      <div className="bg-[#b8a492] text-[#2d2d2d] p-8 rounded-xl border-4 border-[#2d2d2d] max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Nyumbangin Overlay</h1>
        <h2 className="text-xl font-bold mb-4">Username: {username}</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold mb-2">🔔 Notifikasi Donasi</h3>
            <p className="text-sm mb-2">Untuk menampilkan notifikasi donasi real-time dengan suara:</p>
            <code className="bg-[#2d2d2d] text-[#b8a492] px-2 py-1 rounded text-xs block">
              {baseUrl}/overlay/{username}/notifications
            </code>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-2">🏆 Leaderboard</h3>
            <p className="text-sm mb-2">Untuk menampilkan leaderboard donatur bulanan:</p>
            <code className="bg-[#2d2d2d] text-[#b8a492] px-2 py-1 rounded text-xs block">
              {baseUrl}/overlay/{username}/leaderboard
            </code>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-2">📋 Cara Penggunaan</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Buka salah satu URL di atas di browser</li>
              <li>Tambahkan sebagai "Browser Source" di OBS/TikTok Live Studio</li>
              <li>Atur posisi dan ukuran sesuai kebutuhan</li>
              <li>Untuk notifikasi: klik sekali untuk mengaktifkan suara</li>
            </ul>
          </div>

          <div className="bg-[#2d2d2d] text-[#b8a492] p-4 rounded">
            <h4 className="font-bold mb-2">💡 Tips:</h4>
            <ul className="text-xs space-y-1">
              <li>• Gunakan kedua overlay secara terpisah untuk kontrol yang lebih baik</li>
              <li>• Notifikasi akan muncul selama 5 detik dengan progress bar</li>
              <li>• Leaderboard otomatis update setiap menit dan saat ada donasi baru</li>
              <li>• Background transparan, cocok untuk streaming</li>
            </ul>
          </div>
        </div>
      </div>

      <style jsx global>{`
        body, .font-mono { font-family: 'IBM Plex Mono', 'Fira Mono', 'Roboto Mono', monospace; }
      `}</style>
    </div>
  );
}
