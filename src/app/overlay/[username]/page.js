'use client'

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import MessageFilterSettings from '@/components/organisms/MessageFilterSettings';
import Card from '@/components/atoms/Card';

export default function OverlayIndexPage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username;
  const [copiedField, setCopiedField] = useState(null);
  const [hoveredField, setHoveredField] = useState(null);
  const [isHover, setIsHover] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Silakan login terlebih dahulu', { id: 'auth-required' });
      router.replace('/login');
      return;
    }

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.', { id: 'session-expired' });
        router.replace('/login');
        return;
      }

      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.error('Token tidak valid. Silakan login kembali.', { id: 'invalid-token' });
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (!username || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b8a492]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyWithFeedback = (text, field) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(field);
        toast.success('Link berhasil disalin!');
        setTimeout(() => setCopiedField(null), 2000);
      });
    }
  };

  // Using LinkBox molecule for consistent layout

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono overflow-y-auto">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Kembali ke Dashboard"
                title="Kembali ke Dashboard"
                onClick={() => router.push('/dashboard')}
                className="w-10 h-10 flex items-center justify-center bg-[#b8a492] text-[#2d2d2d] rounded-full border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition-transform transform hover:-translate-x-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b8a492]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center gap-3">
              <img src="/logo.png" alt="Nyumbangin Logo" className="w-12 h-12" />
              <div className="text-center sm:text-left">
                <h1 className="text-2xl sm:text-4xl font-bold text-[#b8a492]">Pengaturan Overlay</h1>
                <p className="text-sm text-[#b8a492]/70 mt-1">Pengaturan overlay untuk streaming dan filter pesan donasi</p>
              </div>
            </div>

            <div className="w-10" />
          </div>
        </Card>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Overlay Links */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-[#b8a492] mb-2 flex items-center gap-2">
                <span>🎥</span> Tautan Widget Overlay
              </h2>
              <p className="text-sm text-[#b8a492]/70">Kelola tautan dan widget overlay yang dapat digunakan untuk streaming.</p>
            </Card>

            <Card className="p-4">
              <div className="flex flex-col divide-y divide-[#b8a492]/10">
                {[
                  { key: 'donate', title: 'Link Donasi', icon: '💰', url: `${baseUrl}/donate/${username}`, description: 'Link untuk menerima donasi' },
                  { key: 'qr-donate', title: 'QR Code Donasi', icon: '📱', url: `${baseUrl}/overlay/${username}/qr-donate`, description: 'Tampilkan QR code untuk scan & donate' },
                  { key: 'notifications', title: 'Notifikasi Donasi', icon: '🔔', url: `${baseUrl}/overlay/${username}/notifications`, description: 'Notifikasi donasi real-time' },
                  { key: 'leaderboard', title: 'Papan Peringkat', icon: '🏆', url: `${baseUrl}/overlay/${username}/leaderboard`, description: 'Papan peringkat donatur bulanan' },
                  { key: 'mediashare', title: 'Bagikan Media', icon: '🎥', url: `${baseUrl}/overlay/${username}/mediashare`, description: 'Video YouTube dari donatur (1920x1080)' }
                ].map(link => (
                  <div key={link.key} className="py-3 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#b8a492] text-[#2d2d2d] flex items-center justify-center font-bold shrink-0">{link.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="truncate">
                          <div className="text-sm font-bold text-[#b8a492]">{link.title}</div>
                          <div className="text-xs text-[#b8a492]/70 truncate">{link.description}</div>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <a href={link.url} target="_blank" rel="noreferrer" className="text-sm text-[#b8a492] hover:underline">Buka</a>
                          <button
                            onClick={() => handleCopyWithFeedback(link.url, link.key)}
                            className="text-sm px-3 py-1 bg-[#2d2d2d] border-2 border-[#b8a492] rounded text-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d]"
                          >
                            Salin
                          </button>
                        </div>
                      </div>
                      <input readOnly value={link.url} className="w-full bg-transparent text-xs text-[#b8a492] truncate mt-2" onClick={e => e.target.select()} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <div className="space-y-4">
                <button
                  type="button"
                  className="w-full bg-[#b8a492] text-[#2d2d2d] px-4 py-2 rounded text-sm font-bold hover:bg-[#d6c6b9] transition"
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
                    toast.success('Notifikasi tes dikirim ke overlay!');
                  }}
                >
                  🛠️ Kirim Notifikasi Tes
                </button>

                <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="text-xs font-bold text-[#b8a492] mb-1">ℹ️ Info Media Share</h4>
                  <div className="text-xs text-[#b8a492]/70 space-y-0.5">
                    <p>• Rp 10.000 = 30 detik</p>
                    <p>• Rp 20.000 = 1 menit</p>
                    <p>• Rp 50.000 = 2 menit</p>
                    <p>• Rp 100.000+ = 5 menit</p>
                    <p>• Format: YouTube videos only</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Message Filter */}
          <div>
            <MessageFilterSettings />
          </div>
        </div>
      </main>
    </div>
  );
}
