'use client'

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import MessageFilterSettings from '@/components/organisms/MessageFilterSettings';

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

  const LinkBox = ({ title, icon, url, field, description }) => (
    <div className="mb-4">
      <h3 className="text-base font-bold mb-1 text-[#b8a492]">{icon} {title}</h3>
      <p className="text-xs mb-2 text-[#b8a492]/60">{description}</p>
      <div
        className="relative group"
        onMouseEnter={() => setHoveredField(field)}
        onMouseLeave={() => setHoveredField(null)}
      >
        <input
          readOnly
          value={url}
          className="bg-[#1a1a1a] text-[#b8a492] px-3 py-2 rounded text-xs w-full cursor-pointer border border-[#b8a492]/30 pr-10"
          onClick={e => e.target.select()}
        />
        <div
          className={`absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer transition-opacity ${hoveredField === field ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'}`}
          onClick={() => handleCopyWithFeedback(url, field)}
        >
          {copiedField === field ? (
            <img src="/check.png" alt="Copied" className="w-4 h-4" />
          ) : (
            <img src="/copy.png" alt="Copy" className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono overflow-y-auto py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6">
          <button
            type="button"
            className="bg-[#b8a492] text-[#2d2d2d] p-2 rounded-full border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition cursor-pointer mb-4"
            onClick={() => router.push('/dashboard')}
            title="Kembali ke Dashboard"
            onMouseEnter={() => setIsHover(true)}
            onMouseLeave={() => setIsHover(false)}
          >
            <img
              src={isHover ? '/arrow (2).png' : '/arrow.png'}
              alt="Back"
              className="w-6 h-6 transition-transform"
            />
          </button>
          <div className="flex items-center justify-center gap-3">
            <img src="/logo.png" alt="Nyumbangin Logo" className="w-12 h-12" />
            <h1 className="text-4xl font-bold text-[#b8a492]">Settings & Overlay</h1>
          </div>
          <p className="text-center text-[#b8a492]/70 mt-2">Pengaturan overlay untuk streaming & filter pesan donasi</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Overlay Links */}
          <div className="space-y-6">
            <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6">
              <h2 className="text-2xl font-bold text-[#b8a492] mb-4 flex items-center gap-2">
                <span>🎥</span> Overlay Widget Links
              </h2>
              
              <LinkBox 
                title="Link Donasi"
                icon="💰"
                url={`${baseUrl}/donate/${username}`}
                field="donate"
                description="Link untuk menerima donasi"
              />

              <LinkBox 
                title="QR Code Donasi"
                icon="📱"
                url={`${baseUrl}/overlay/${username}/qr-donate`}
                field="qr-donate"
                description="Tampilkan QR code untuk scan & donate"
              />

              <LinkBox 
                title="Notifikasi Donasi"
                icon="🔔"
                url={`${baseUrl}/overlay/${username}/notifications`}
                field="notifications"
                description="Notifikasi donasi real-time"
              />

              <LinkBox 
                title="Leaderboard"
                icon="🏆"
                url={`${baseUrl}/overlay/${username}/leaderboard`}
                field="leaderboard"
                description="Leaderboard donatur bulanan"
              />

              <LinkBox 
                title="Media Share"
                icon="🎥"
                url={`${baseUrl}/overlay/${username}/mediashare`}
                field="mediashare"
                description="Video YouTube dari donatur (1920x1080)"
              />

              {/* Test Button */}
              <div className="mt-6 pt-4 border-t border-[#b8a492]/30">
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
              </div>

              {/* Info Box */}
              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
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
          </div>

          {/* Right Column - Message Filter */}
          <div>
            <MessageFilterSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
