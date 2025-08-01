'use client'

import { useParams } from 'next/navigation';

export default function OverlayIndexPage() {
  const params = useParams();
  const username = params?.username;

  if (!username) {
    return null;
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  // Helper to copy text to clipboard
  const handleCopy = (text) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2d2d2d] font-mono flex items-center justify-center">
      <div className="bg-[#b8a492] text-[#2d2d2d] p-8 rounded-xl border-4 border-[#2d2d2d] max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Nyumbangin Overlay</h1>
        <h2 className="text-xl font-bold mb-4">Username: {username}</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold mb-2">🔔 Notifikasi Donasi</h3>
            <p className="text-sm mb-2">Untuk menampilkan notifikasi donasi real-time</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`${baseUrl}/overlay/${username}/notifications`}
                className="bg-[#2d2d2d] text-[#b8a492] px-2 py-1 rounded text-xs w-full"
                onClick={e => e.target.select()}
              />
              <button
                type="button"
                className="bg-[#2d2d2d] text-[#b8a492] px-2 py-1 rounded text-xs border border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d] transition"
                onClick={() => handleCopy(`${baseUrl}/overlay/${username}/notifications`)}
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-2">🏆 Leaderboard</h3>
            <p className="text-sm mb-2">Untuk menampilkan leaderboard donatur bulanan:</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={`${baseUrl}/overlay/${username}/leaderboard`}
                className="bg-[#2d2d2d] text-[#b8a492] px-2 py-1 rounded text-xs w-full"
                onClick={e => e.target.select()}
              />
              <button
                type="button"
                className="bg-[#2d2d2d] text-[#b8a492] px-2 py-1 rounded text-xs border border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d] transition"
                onClick={() => handleCopy(`${baseUrl}/overlay/${username}/leaderboard`)}
              >
                Copy
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-2">📋 Cara Penggunaan</h3>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li>Buka salah satu URL di atas di browser</li>
              <li>Tambahkan sebagai "Browser Source" di OBS/TikTok Live Studio</li>
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
