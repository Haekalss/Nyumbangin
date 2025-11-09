'use client'

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function OverlayIndexPage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username;
  const [copiedField, setCopiedField] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);
  const [isHover, setIsHover] = useState(false);

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

  const handleCopyWithFeedback = (text, field) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000); // Reset after 2 seconds
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-[#2d2d2d] font-mono flex items-center justify-center overflow-y-auto py-8">
      <div className="bg-[#b8a492] text-[#2d2d2d] p-8 rounded-xl border-4 border-[#2d2d2d] max-w-2xl w-full mx-4 my-auto">
        <button
      type="button"
      className="bg-[#2d2d2d] text-[#b8a492] p-2 rounded-full border border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d] hover:border-[#2d2d2d] transition cursor-pointer mb-6"
      onClick={() => router.push('/dashboard')}
      title="Kembali ke Dashboard"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <img
        src={isHover ? '/arrow (2).png' : '/arrow.png'}
        alt="Back"
        className="w-6 h-6 transition-transform duration-300 hover:scale-110 hover:rotate-180"
      />
    </button>
        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/logo.png" alt="Nyumbangin Logo" className="w-12 h-12" />
          <h1 className="text-4xl font-bold text-center">Live Widget</h1>
        </div>
        
        <div className="space-y-4">
          {/* Link Donasi */}
          <div>
            <h3 className="text-xl font-bold mb-2">💰 Link Donasi</h3>
            <p className="text-base mb-2">Link untuk menerima donasi:</p>
            <div
              className="relative group"
              onMouseEnter={() => setHoveredField('donate')}
              onMouseLeave={() => setHoveredField(null)}
            >
              <a
                href={`${baseUrl}/donate/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#2d2d2d] text-[#b8a492] px-2 py-2 rounded text-sm w-full cursor-pointer hover:bg-[#3d3d3d] transition"
              >
                {`${baseUrl}/donate/${username}`}
              </a>
              <div
                className={`absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer transition-opacity duration-500 ${hoveredField === 'donate' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                onClick={() => handleCopyWithFeedback(`${baseUrl}/donate/${username}`, 'donate')}
              >
                {copiedField === 'donate' ? (
                  <img src="/check.png" alt="Copied" className="w-5 h-5 transition-transform duration-500" />
                ) : (
                  <img src="/copy.png" alt="Copy" className="w-5 h-5 transition-transform duration-500" />
                )}
              </div>
            </div>
          </div>

          {/* QR Code Donasi - BARU */}
          <div>
            <h3 className="text-xl font-bold mb-2">📱 QR Code Donasi</h3>
            <p className="text-base mb-2">Tampilkan QR code untuk memudahkan viewer scan & donate:</p>
            <div
              className="relative group"
              onMouseEnter={() => setHoveredField('qr-donate')}
              onMouseLeave={() => setHoveredField(null)}
            >
              <input
                readOnly
                value={`${baseUrl}/overlay/${username}/qr-donate`}
                className="bg-[#2d2d2d] text-[#b8a492] px-2 py-2 rounded text-sm w-full cursor-pointer"
                onClick={e => e.target.select()}
              />
              <div
                className={`absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer transition-opacity duration-500 ${hoveredField === 'qr-donate' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                onClick={() => handleCopyWithFeedback(`${baseUrl}/overlay/${username}/qr-donate`, 'qr-donate')}
              >
                {copiedField === 'qr-donate' ? (
                  <img src="/check.png" alt="Copied" className="w-5 h-5 transition-transform duration-500" />
                ) : (
                  <img src="/copy.png" alt="Copy" className="w-5 h-5 transition-transform duration-500" />
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">🔔 Notifikasi Donasi</h3>
            <p className="text-base mb-2">Untuk menampilkan notifikasi donasi real-time</p>
            <div
              className="relative group"
              onMouseEnter={() => setHoveredField('notifications')}
              onMouseLeave={() => setHoveredField(null)}
            >
              <input
                readOnly
                value={`${baseUrl}/overlay/${username}/notifications`}
                className="bg-[#2d2d2d] text-[#b8a492] px-2 py-2 rounded text-sm w-full cursor-pointer"
                onClick={e => e.target.select()}
              />
              <div
                className={`absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer transition-opacity duration-500 ${hoveredField === 'notifications' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                onClick={() => handleCopyWithFeedback(`${baseUrl}/overlay/${username}/notifications`, 'notifications')}
              >
                {copiedField === 'notifications' ? (
                  <img src="/check.png" alt="Copied" className="w-5 h-5 transition-transform duration-500" />
                ) : (
                  <img src="/copy.png" alt="Copy" className="w-5 h-5 transition-transform duration-500" />
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">🏆 Leaderboard</h3>
            <p className="text-base mb-2">Untuk menampilkan leaderboard donatur bulanan:</p>
            <div
              className="relative group"
              onMouseEnter={() => setHoveredField('leaderboard')}
              onMouseLeave={() => setHoveredField(null)}
            >
              <input
                readOnly
                value={`${baseUrl}/overlay/${username}/leaderboard`}
                className="bg-[#2d2d2d] text-[#b8a492] px-2 py-2 rounded text-sm w-full"
                onClick={e => e.target.select()}
              />
              <div
                className={`absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer transition-opacity duration-500 ${hoveredField === 'leaderboard' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                onClick={() => handleCopyWithFeedback(`${baseUrl}/overlay/${username}/leaderboard`, 'leaderboard')}
              >
                {copiedField === 'leaderboard' ? (
                  <img src="/check.png" alt="Copied" className="w-5 h-5 transition-transform duration-500" />
                ) : (
                  <img src="/copy.png" alt="Copy" className="w-5 h-5 transition-transform duration-500" />
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">🎥 Media Share</h3>
            <p className="text-base mb-2">Untuk menampilkan video YouTube dari donatur:</p>
            <div
              className="relative group"
              onMouseEnter={() => setHoveredField('mediashare')}
              onMouseLeave={() => setHoveredField(null)}
            >
              <input
                readOnly
                value={`${baseUrl}/overlay/${username}/mediashare`}
                className="bg-[#2d2d2d] text-[#b8a492] px-2 py-2 rounded text-sm w-full"
                onClick={e => e.target.select()}
              />
              <div
                className={`absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer transition-opacity duration-500 ${hoveredField === 'mediashare' ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}
                onClick={() => handleCopyWithFeedback(`${baseUrl}/overlay/${username}/mediashare`, 'mediashare')}
              >
                {copiedField === 'mediashare' ? (
                  <img src="/check.png" alt="Copied" className="w-5 h-5 transition-transform duration-500" />
                ) : (
                  <img src="/copy.png" alt="Copy" className="w-5 h-5 transition-transform duration-500" />
                )}
              </div>
            </div>
            <p className="text-xs mt-2 opacity-80">
              💡 OBS: Width 1920, Height 1080, Control audio via OBS
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-2">🛠️ Tes Notifikasi</h3>
            <p className="text-base mb-2">Klik tombol di bawah untuk mengirim notifikasi tes ke overlay:</p>
            <button
              type="button"
              className="bg-[#2d2d2d] text-[#b8a492] px-4 py-2 rounded text-base border border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d] hover:border-1 hover:border-[#2d2d2d] transition cursor-pointer"
              onClick={() => {
                const testNotification = {
                  message: 'Tes Notifikasi Donasi',
                  detail: 'Ini adalah pesan tes.',
                  time: new Date().toLocaleTimeString('id-ID'),
                  timestamp: Date.now()
                };
                localStorage.setItem('overlay-notification-trigger', JSON.stringify(testNotification));
                window.dispatchEvent(new StorageEvent('storage', {
                  key: 'overlay-notification-trigger',
                  newValue: JSON.stringify(testNotification)
                }));
                toast.success('Notifikasi tes berhasil dikirim ke overlay!');
              }}
            >
              Kirim Notifikasi Tes
            </button>
          </div>

          {/* Media Share Info */}
          <div className="border-2 border-[#2d2d2d] rounded-lg p-4 bg-[#2d2d2d]/10">
            <h3 className="text-lg font-bold mb-2 text-[#2d2d2d]">ℹ️ Info Media Share</h3>
            <div className="text-sm space-y-1">
              <p><strong>• Durasi berdasarkan donasi:</strong></p>
              <p className="ml-4">Rp 10.000 = 30 detik</p>
              <p className="ml-4">Rp 20.000 = 1 menit</p>
              <p className="ml-4">Rp 50.000 = 2 menit</p>
              <p className="ml-4">Rp 100.000+ = 5 menit</p>
              <p className="mt-2"><strong>• Format:</strong> YouTube videos only</p>
              <p><strong>• Auto-play:</strong> Videos play from queue automatically</p>
              <p><strong>• Audio:</strong> Control volume via OBS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
