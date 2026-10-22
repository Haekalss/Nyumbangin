'use client'

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import MessageFilterSettings from '@/components/organisms/MessageFilterSettings';
import CreatorAppLayout from '@/components/dashboard/CreatorAppLayout';
import Link from 'next/link';

export default function OverlayIndexPage() {
  const router = useRouter();
  const params = useParams();
  const username = params?.username;
  const [copiedKey, setCopiedKey] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      toast.error('Silakan login terlebih dahulu');
      router.replace('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (payload.exp && payload.exp < currentTime) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.');
        router.replace('/login');
        return;
      }

      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (!username || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f4f0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2d2d2d] border-t-transparent mx-auto mb-3"></div>
          <p className="text-xs font-medium text-[#8c8276]">Memuat overlay...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nyumbangin.web.id';

  const handleCopy = (text, key) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedKey(key);
        toast.success('Tautan disalin!');
        setTimeout(() => setCopiedKey(null), 2000);
      });
    }
  };

  const overlayLinks = [
    {
      key: 'notifications',
      title: 'Notifikasi Saweran',
      description: 'Popup animasi & bunyi saat ada saweran masuk.',
      size: '800 x 600 px',
      url: `${baseUrl}/overlay/${username}/notifications`
    },
    {
      key: 'mediashare',
      title: 'Media Share (YouTube)',
      description: 'Tampilkan video kiriman donatur secara otomatis.',
      size: '1920 x 1080 px',
      url: `${baseUrl}/overlay/${username}/mediashare`
    },
    {
      key: 'leaderboard',
      title: 'Leaderboard',
      description: 'Daftar donatur tertinggi bulan ini.',
      size: '400 x 600 px',
      url: `${baseUrl}/overlay/${username}/leaderboard`
    },
    {
      key: 'qr-donate',
      title: 'QR Code Donasi',
      description: 'QR agar penonton bisa scan dari layar.',
      size: '400 x 400 px',
      url: `${baseUrl}/overlay/${username}/qr-donate`
    }
  ];

  const mediaDurations = [
    { amount: 'Rp 10.000', duration: '30 detik' },
    { amount: 'Rp 20.000', duration: '1 menit' },
    { amount: 'Rp 50.000', duration: '2 menit' },
    { amount: 'Rp 100.000+', duration: 'Maks. 5 menit' }
  ];

  return (
    <CreatorAppLayout user={user}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#8f857b] mb-1">
            <Link href="/dashboard" className="hover:text-[#2d2d2d] transition">Dashboard</Link>
            <span>/</span>
            <span className="text-[#2d2d2d] font-extrabold">Overlay & OBS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2d2d2d] tracking-tight">Widget & Sensor Pesan</h1>
          <p className="text-sm font-medium text-[#696057] mt-0.5">Salin tautan browser source untuk OBS dan kelola sensor kata.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            const testNotification = {
              message: 'Tes Notifikasi Nyumbangin',
              detail: 'Semangat terus live-nya!',
              time: new Date().toLocaleTimeString('id-ID'),
              timestamp: Date.now()
            };
            localStorage.setItem('overlay-notification-trigger', JSON.stringify(testNotification));
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'overlay-notification-trigger',
              newValue: JSON.stringify(testNotification)
            }));
            toast.success('Notifikasi tes dikirim!');
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] text-white text-xs font-extrabold shadow-[2px_2px_0px_#b8a492] hover:bg-black transition cursor-pointer shrink-0 active:translate-y-0.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          Uji Overlay
        </button>
      </div>

      {/* How-to Tip */}
      <div className="rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] px-4 py-3 text-xs font-medium text-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d]">
        <span className="font-black text-[#2d2d2d]">Cara pasang:</span> OBS Studio &rarr; Sources &rarr; tambah Browser &rarr; paste URL widget di bawah.
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Widget Links */}
        <div className="lg:col-span-7 space-y-4">
          {overlayLinks.map((link) => (
            <div key={link.key} className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-[#2d2d2d]">{link.title}</h3>
                    {link.size && (
                      <span className="text-[10px] font-extrabold text-[#2d2d2d] bg-[#fbf8f3] border border-[#2d2d2d] px-2 py-0.5 rounded-md shadow-[1px_1px_0px_#2d2d2d]">
                        {link.size}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-[#696057] mt-1">{link.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 text-xs font-extrabold rounded-xl border-2 border-[#2d2d2d] bg-[#fffdf9] text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] hover:bg-[#f2e4d4] transition active:translate-y-0.5"
                  >
                    Buka
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(link.url, link.key)}
                    className="px-4 py-1.5 text-xs font-extrabold rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] text-white shadow-[2px_2px_0px_#b8a492] hover:bg-black transition cursor-pointer active:translate-y-0.5"
                  >
                    {copiedKey === link.key ? 'Tersalin' : 'Salin'}
                  </button>
                </div>
              </div>

              {/* URL Display */}
              <div className="mt-3 px-3.5 py-2 rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] font-mono text-xs font-bold text-[#2d2d2d] select-all truncate">
                {link.url}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 space-y-5">
          {/* Message Filter */}
          <MessageFilterSettings />

          {/* Media Share Durations */}
          <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-5 sm:p-6">
            <h4 className="font-black text-sm text-[#2d2d2d] mb-3 border-b-2 border-[#2d2d2d]/10 pb-2">Durasi Media Share</h4>
            <div className="space-y-0">
              {mediaDurations.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b-2 border-[#2d2d2d]/10 last:border-0 text-xs">
                  <span className="font-bold text-[#696057]">{item.amount}</span>
                  <span className="font-black text-[#2d2d2d]">{item.duration}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] font-bold text-[#8f857b] mt-3">
              Hanya video YouTube publik. Video privat otomatis dilewati.
            </p>
          </div>
        </div>
      </div>
    </CreatorAppLayout>
  );
}
