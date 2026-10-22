"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSessionManager } from '@/utils/sessionManager';
import { formatRupiah } from '@/utils/format';
import LeaderboardModal from '@/components/organisms/LeaderboardModal';
import Avatar from '@/components/atoms/Avatar';
import { filterMessage } from '@/utils/messageFilter';
import { getTodayDonations } from '@/utils/dateUtils';
import CreatorAppLayout from '@/components/dashboard/CreatorAppLayout';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { startMonitoring, stopMonitoring } = useSessionManager();
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'DONATION' | 'MEDIASHARE'

  const [donationEnabled, setDonationEnabled] = useState(true);
  const [mediaShareEnabled, setMediaShareEnabled] = useState(true);
  const [togglingDonation, setTogglingDonation] = useState(false);
  const [togglingMediaShare, setTogglingMediaShare] = useState(false);
  
  const lastDonationCountRef = useRef(0);

  // Handle OAuth callback - Generate JWT if needed
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (typeof window === 'undefined') return;
      
      if (status === 'authenticated' && session?.user) {
        const existingToken = localStorage.getItem('token');
        
        if (!existingToken) {
          try {
            const tokenRes = await axios.post('/api/auth/oauth-token', {
              userId: session.user.id,
              email: session.user.email
            });
            
            localStorage.setItem('token', tokenRes.data.token);
            localStorage.setItem('user', JSON.stringify(tokenRes.data.user));
            
            if (tokenRes.data.user.userType === 'admin') {
              toast.success('Login admin berhasil!');
              router.push('/admin');
              return;
            }
            
            setUser(tokenRes.data.user);
            toast.success('Login berhasil!');
            fetchData();
          } catch (error) {
            console.error('OAuth token generation failed:', error);
            toast.error('Gagal membuat sesi. Silakan login kembali.');
            router.push('/login');
          }
        }
      }
    };

    handleOAuthCallback();
  }, [session, status]);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'authenticated' && !localStorage.getItem('token')) return;

    let isActive = true;

    const initialize = async () => {
      await checkAuth();
      if (isActive) {
        await fetchData();
      }
    };

    initialize();

    // Polling otomatis setiap 10 detik untuk data terbaru
    let donationPolling;
    const startPolling = () => {
      donationPolling = setInterval(() => {
        if (isActive && document.visibilityState === 'visible') {
          fetchData(true);
        }
      }, 10 * 1000);
    };

    const pollingTimeout = setTimeout(startPolling, 1000);

    return () => {
      isActive = false;
      clearTimeout(pollingTimeout);
      if (donationPolling) clearInterval(donationPolling);
    };
  }, [status]);

  // Prevent back button after logout
  useEffect(() => {
    const handlePopState = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);

  // Start session monitoring when user is authenticated
  useEffect(() => {
    if (user) {
      startMonitoring();
    }
    return () => stopMonitoring();
  }, [user, startMonitoring, stopMonitoring]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
  };

  const fetchData = async (showNewDonationNotif = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [donationsRes, statsRes, profileRes] = await Promise.all([
        axios.get('/api/dashboard/donations?limit=50', config),
        axios.get('/api/stats', config),
        axios.get('/api/user/profile', config)
      ]);

      if (profileRes.data.user) {
        const updatedUser = profileRes.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      if (profileRes.data.creator?.donationSettings?.isEnabled !== undefined) {
        setDonationEnabled(profileRes.data.creator.donationSettings.isEnabled);
      }
      if (profileRes.data.creator?.donationSettings?.mediaShareEnabled !== undefined) {
        setMediaShareEnabled(profileRes.data.creator.donationSettings.mediaShareEnabled);
      }

      const allDonations = donationsRes.data.data || [];
      const todayDonations = getTodayDonations(allDonations);

      if (showNewDonationNotif && donations.length > 0 && todayDonations.length > donations.length) {
        const newCount = todayDonations.length - donations.length;
        toast.success(`${newCount} saweran baru masuk!`, { duration: 4000 });
      }

      setDonations(todayDonations);
      setStats(statsRes.data.stats || {});
      lastDonationCountRef.current = todayDonations.length;

      // Juga fetch leaderboard mini
      fetchLeaderboardData();
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status !== 401) {
        setError('Gagal memuat data dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteDonation = async (donationId) => {
    const confirmDelete = () => {
      return new Promise((resolve) => {
        toast((t) => (
          <div className="flex flex-col gap-2 p-1">
            <span className="font-bold text-sm text-[#2d2d2d]">Hapus riwayat donasi ini?</span>
            <div className="flex gap-2 mt-1">
              <button
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Hapus
              </button>
              <button
                className="bg-gray-200 text-[#2d2d2d] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-300 cursor-pointer"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                Batal
              </button>
            </div>
          </div>
        ), { duration: 6000 });
      });
    };

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.delete(`/api/dashboard/donations/${donationId}`, config);
      fetchData();
      toast.success('Donasi berhasil dihapus');
    } catch (error) {
      console.error('Error deleting donation:', error);
      toast.error('Gagal menghapus donasi');
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.get('/api/dashboard/donations?limit=1000', config);
      const allDonations = response.data.data || [];
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const thisMonthDonations = allDonations.filter(donation => {
        const donationDate = new Date(donation.createdAt);
        return donationDate.getMonth() === currentMonth && 
               donationDate.getFullYear() === currentYear && 
               donation.status === 'PAID';
      });
      
      const grouped = thisMonthDonations.reduce((acc, donation) => {
        const name = donation.name || donation.donorName || 'Anonim';
        if (!acc[name]) {
          acc[name] = {
            name,
            totalAmount: 0,
            donationCount: 0,
            lastDonation: donation.createdAt
          };
        }
        acc[name].totalAmount += donation.amount;
        acc[name].donationCount += 1;
        return acc;
      }, {});

      const leaderboardArray = Object.values(grouped)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10);

      setLeaderboardData([...leaderboardArray]);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };

  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col gap-2 p-1">
        <span className="font-bold text-sm text-[#2d2d2d]">Yakin ingin keluar?</span>
        <div className="flex gap-2 mt-1">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                stopMonitoring();
                const { sessionManager } = await import('@/utils/sessionManager');
                sessionManager.isManualLogout = true;
                
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                if (session) {
                  await signOut({ redirect: false, callbackUrl: '/login' });
                }
                
                toast.success('Berhasil keluar!');
                setTimeout(() => {
                  router.replace('/');
                  sessionManager.isManualLogout = false;
                }, 500);
              } catch (error) {
                console.error('Logout error:', error);
                toast.error('Gagal keluar.');
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
          >
            Ya, Keluar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-200 hover:bg-gray-300 text-[#2d2d2d] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
          >
            Batal
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const toggleDonationStatus = async () => {
    try {
      setTogglingDonation(true);
      const token = localStorage.getItem('token');
      const newStatus = !donationEnabled;
      
      await axios.put(
        '/api/creator/toggle-donation',
        { isEnabled: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDonationEnabled(newStatus);
      toast.success(newStatus ? 'Halaman donasi dibuka' : 'Halaman donasi ditutup');
    } catch (error) {
      console.error('Error toggling donation:', error);
      toast.error('Gagal mengubah status donasi');
    } finally {
      setTogglingDonation(false);
    }
  };

  const toggleMediaShareStatus = async () => {
    try {
      setTogglingMediaShare(true);
      const token = localStorage.getItem('token');
      const newStatus = !mediaShareEnabled;
      
      await axios.put(
        '/api/creator/toggle-mediashare',
        { mediaShareEnabled: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMediaShareEnabled(newStatus);
      toast.success(newStatus ? 'Media Share aktif' : 'Media Share nonaktif');
    } catch (error) {
      console.error('Error toggling media share:', error);
      toast.error('Gagal mengubah status media share');
    } finally {
      setTogglingMediaShare(false);
    }
  };

  const showNotificationPreview = async (donation) => {
    try {
      if (donation.mediaShareRequest?.enabled && donation.mediaShareRequest?.youtubeUrl) {
        const mediaShareData = {
          donorName: donation.name,
          amount: donation.amount,
          youtubeUrl: donation.mediaShareRequest.youtubeUrl,
          duration: donation.mediaShareRequest.duration || 30,
          message: donation.message || '',
          timestamp: Date.now(),
          isReplay: true
        };
        
        await axios.post(`/api/overlay/replay-trigger?username=${user.username}&type=mediashare`, {
          data: mediaShareData
        });
        
        localStorage.setItem('mediashare-replay-trigger', JSON.stringify(mediaShareData));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'mediashare-replay-trigger',
          newValue: JSON.stringify(mediaShareData)
        }));
        
        toast.success('Preview media share dikirim ke overlay!');
        return;
      }
      
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get('/api/creator/filtered-words', config);
      
      const filteredWords = data.filteredWords || [];
      const filteredMessageText = filterMessage(donation.message || '', filteredWords);
      
      const notificationData = {
        message: `Donasi baru dari ${donation.name} sebesar ${formatRupiah(donation.amount)}`,
        detail: filteredMessageText,
        time: new Date(donation.createdAt).toLocaleTimeString('id-ID'),
        timestamp: Date.now()
      };
      
      await axios.post(`/api/overlay/replay-trigger?username=${user.username}&type=notification`, {
        data: notificationData
      });
      
      localStorage.setItem('overlay-notification-trigger', JSON.stringify(notificationData));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'overlay-notification-trigger',
        newValue: JSON.stringify(notificationData)
      }));
      
      toast.success('Preview notifikasi dikirim ke overlay!');
    } catch (error) {
      console.error('Error preview notification:', error);
      toast.error('Gagal mengirim ke overlay');
    }
  };

  const triggerTestSound = () => {
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
    toast.success('Notifikasi tes berhasil dikirim ke OBS overlay!');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f4f0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2d2d2d] border-t-transparent mx-auto mb-3"></div>
          <p className="text-xs font-medium text-[#8c8276]">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user && status !== 'authenticated') {
    return null;
  }

  // Filter donations according to selected tab
  const filteredDonations = donations.filter((d) => {
    if (filterType === 'MEDIASHARE') return d.mediaShareRequest?.enabled;
    if (filterType === 'DONATION') return !d.mediaShareRequest?.enabled;
    return true;
  });

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nyumbangin.web.id';

  return (
    <CreatorAppLayout user={user} onLogout={handleLogout}>
      {/* Warning Banners */}
      {(!user?.username || user?.username === '') && (
        <div className="rounded-2xl bg-amber-50 border-2 border-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h4 className="font-extrabold text-sm text-[#2d2d2d]">Username belum diatur</h4>
              <p className="text-xs font-medium text-[#696057] mt-0.5">Atur username agar tautan donasi bisa dibagikan.</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/profile')}
            className="px-4 py-2 rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] text-white text-xs font-extrabold shadow-[2px_2px_0px_#b8a492] hover:bg-black transition cursor-pointer shrink-0 active:translate-y-0.5"
          >
            Setup Sekarang
          </button>
        </div>
      )}

      {user?.username && !user?.isPayoutReady && (
        <div className="rounded-2xl bg-[#fff2e2] border-2 border-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-orange-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <div>
              <h4 className="font-extrabold text-sm text-[#2d2d2d]">Rekening pencairan belum diisi</h4>
              <p className="text-xs font-medium text-[#696057] mt-0.5">Lengkapi rekening agar kamu bisa mencairkan saldo.</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/profile?section=payout')}
            className="px-4 py-2 rounded-xl border-2 border-[#2d2d2d] bg-[#fffdf9] text-[#2d2d2d] text-xs font-extrabold shadow-[2px_2px_0px_#2d2d2d] hover:bg-[#f2e4d4] transition cursor-pointer shrink-0 active:translate-y-0.5"
          >
            Isi Rekening
          </button>
        </div>
      )}

      {/* Donation Link Bar */}
      <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex-1 w-full min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b] mb-2">Tautan Donasi</p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="flex-1 flex items-center px-4 py-2.5 rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] font-mono text-sm font-bold text-[#2d2d2d] select-all overflow-hidden">
                <span className="truncate">nyumbangin.web.id/donate/{user?.username || 'namamu'}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = `${baseUrl}/donate/${user?.username}`;
                    navigator.clipboard.writeText(url);
                    toast.success('Tautan disalin!');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] text-[#fbf8f3] text-xs font-extrabold shadow-[2px_2px_0px_#b8a492] hover:bg-black transition cursor-pointer shrink-0 active:translate-y-0.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Salin
                </button>
                {user?.username && (
                  <a
                    href={`/donate/${user.username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl border-2 border-[#2d2d2d] bg-[#b8a492] text-[#2d2d2d] text-xs font-extrabold shadow-[2px_2px_0px_#2d2d2d] hover:bg-[#cabaa9] transition text-center shrink-0 active:translate-y-0.5"
                  >
                    Buka
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Status Toggles */}
          {user?.username && (
            <div className="flex items-center gap-6 pt-4 lg:pt-0 border-t-2 lg:border-t-0 lg:border-l-2 border-[#2d2d2d] w-full lg:w-auto lg:pl-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-[#696057]">Donasi</span>
                  <span className={`text-xs font-black ${donationEnabled ? 'text-emerald-700' : 'text-[#8f857b]'}`}>
                    {donationEnabled ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleDonationStatus}
                  disabled={togglingDonation}
                  aria-label="Toggle Donasi"
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-[#2d2d2d] transition-colors cursor-pointer disabled:opacity-50 ${
                    donationEnabled ? 'bg-emerald-500' : 'bg-[#e5dcd3]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white border border-[#2d2d2d] shadow-sm transition-transform ${
                      donationEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold text-[#696057]">Media Share</span>
                  <span className={`text-xs font-black ${mediaShareEnabled ? 'text-purple-700' : 'text-[#8f857b]'}`}>
                    {mediaShareEnabled ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleMediaShareStatus}
                  disabled={togglingMediaShare}
                  aria-label="Toggle Media Share"
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-[#2d2d2d] transition-colors cursor-pointer disabled:opacity-50 ${
                    mediaShareEnabled ? 'bg-purple-500' : 'bg-[#e5dcd3]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white border border-[#2d2d2d] shadow-sm transition-transform ${
                      mediaShareEnabled ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Saldo Siap Tarik */}
        <div className="rounded-2xl bg-[#2d2d2d] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#b8a492] p-5 sm:p-6 text-[#fbf8f3] flex flex-col justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#b8a492] mb-1">Saldo Siap Cair</p>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {formatRupiah(stats?.paidAmount || stats?.totalAmount || 0)}
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard/payout')}
            className="mt-5 w-full py-2.5 rounded-xl border-2 border-[#2d2d2d] bg-[#b8a492] text-xs font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] hover:bg-[#cabaa9] transition text-center cursor-pointer active:translate-y-0.5"
          >
            Cairkan Dana
          </button>
        </div>

        {/* Saweran Hari Ini */}
        <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b] mb-1">Hari Ini</p>
            <div className="text-2xl sm:text-3xl font-black text-[#2d2d2d] tracking-tight">
              {formatRupiah(stats?.todayAmount || 0)}
            </div>
          </div>
          <p className="mt-4 text-xs font-bold text-[#696057]">
            {stats?.todayDonations || 0} donasi masuk
          </p>
        </div>

        {/* Total */}
        <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b] mb-1">Total All-Time</p>
            <div className="text-2xl sm:text-3xl font-black text-[#2d2d2d] tracking-tight">
              {formatRupiah(stats?.totalAmount || 0)}
            </div>
          </div>
          <Link
            href="/history"
            className="mt-4 text-xs font-extrabold text-[#2d2d2d] hover:text-[#8f857b] flex items-center gap-1 transition"
          >
            Lihat Riwayat
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Feed Saweran */}
      <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b-2 border-[#2d2d2d] bg-[#fbf8f3] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-black text-base text-[#2d2d2d]">Saweran Hari Ini</h3>
            <p className="text-xs font-medium text-[#696057] mt-0.5">Apresiasi 24 jam terakhir</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl border-2 border-[#2d2d2d] bg-[#fffdf9] shrink-0">
            {[
              { key: 'ALL', label: `Semua (${donations.length})` },
              { key: 'DONATION', label: 'Saweran' },
              { key: 'MEDIASHARE', label: 'Media Share' }
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterType(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer ${
                  filterType === tab.key
                    ? 'bg-[#2d2d2d] text-[#fbf8f3] shadow-[2px_2px_0px_#b8a492]'
                    : 'text-[#2d2d2d] hover:bg-[#f2e4d4]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Donation Items */}
        {filteredDonations.length > 0 ? (
          <div className="divide-y-2 divide-[#2d2d2d]/10">
            {filteredDonations.map((donation) => {
              const isPending = donation.status === 'PENDING';
              const isMediaShare = donation.mediaShareRequest?.enabled;

              return (
                <div
                  key={donation._id}
                  className={`px-5 sm:px-6 py-4 transition hover:bg-[#fbf8f3] ${isPending ? 'opacity-50' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <Avatar name={donation.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-sm text-[#2d2d2d]">{donation.name || 'Anonim'}</span>
                          <span className="text-xs font-mono font-bold text-[#8f857b]">
                            {new Date(donation.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMediaShare && (
                            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md border border-[#2d2d2d] bg-purple-100 text-purple-900 shadow-[1px_1px_0px_#2d2d2d]">
                              Media Share
                            </span>
                          )}
                          {isPending && (
                            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md border border-[#2d2d2d] bg-amber-100 text-amber-900 shadow-[1px_1px_0px_#2d2d2d]">
                              Pending
                            </span>
                          )}
                        </div>

                        {donation.message ? (
                          <p className="mt-2 text-sm font-medium text-[#2d2d2d] break-words bg-[#fbf8f3] p-2.5 rounded-xl border border-[#2d2d2d]/20">
                            {donation.message}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-[#8f857b] italic">Tanpa pesan</p>
                        )}

                        {isMediaShare && donation.mediaShareRequest?.youtubeUrl && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-purple-800 font-mono font-bold truncate">
                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate">{donation.mediaShareRequest.youtubeUrl}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="flex items-center gap-3 shrink-0 sm:ml-4">
                      <span className="text-base font-black text-[#2d2d2d]">
                        {formatRupiah(donation.amount)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {!isPending && (
                          <button
                            type="button"
                            onClick={() => showNotificationPreview(donation)}
                            className="p-1.5 rounded-lg border border-[#2d2d2d] bg-[#fbf8f3] text-[#2d2d2d] shadow-[1px_1px_0px_#2d2d2d] hover:bg-[#ede3d3] transition cursor-pointer active:translate-y-0.5"
                            title="Replay di overlay"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteDonation(donation._id)}
                          className="p-1.5 rounded-lg border border-red-500 bg-red-50 text-red-600 shadow-[1px_1px_0px_#dc2626] hover:bg-red-100 transition cursor-pointer active:translate-y-0.5"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <img
              src="/Logo2.png"
              alt="Maskot Nyumbangin"
              className="h-16 w-16 object-contain select-none opacity-60 mx-auto mb-3"
            />
            <h4 className="font-extrabold text-sm text-[#2d2d2d]">
              Belum ada saweran hari ini
            </h4>
            <p className="mt-1 text-xs font-medium text-[#696057] max-w-xs mx-auto">
              Bagikan tautan donasimu di bio sosmed atau deskripsi stream.
            </p>
            <button
              type="button"
              onClick={() => {
                const url = `${baseUrl}/donate/${user?.username}`;
                navigator.clipboard.writeText(url);
                toast.success('Tautan disalin!');
              }}
              className="mt-4 px-5 py-2.5 rounded-xl border-2 border-[#2d2d2d] bg-[#2d2d2d] text-white text-xs font-extrabold shadow-[2px_2px_0px_#b8a492] hover:bg-black transition cursor-pointer active:translate-y-0.5"
            >
              Salin Tautan
            </button>
          </div>
        )}
      </div>

      {/* Bottom Row: Overlay Quick Actions + Leaderboard + Rekening */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Overlay Quick Actions */}
        <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#2d2d2d]/10 pb-3">
            <h3 className="font-black text-sm text-[#2d2d2d]">Overlay Cepat</h3>
            <Link
              href={user?.username ? `/overlay/${user.username}` : '#'}
              className="text-xs font-extrabold text-[#2d2d2d] hover:text-[#8f857b] transition"
            >
              Semua Widget &rarr;
            </Link>
          </div>

          <button
            type="button"
            onClick={triggerTestSound}
            className="w-full py-2.5 rounded-xl border-2 border-[#2d2d2d] bg-[#f2e4d4] text-xs font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] hover:bg-[#ede3d3] transition cursor-pointer flex items-center justify-center gap-2 active:translate-y-0.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Uji Overlay
          </button>

          <div className="space-y-2">
            {[
              { label: 'Notifikasi', key: 'notifications' },
              { label: 'Media Share', key: 'mediashare' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2 border-b border-[#2d2d2d]/10">
                <span className="text-xs font-bold text-[#696057]">{item.label}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${baseUrl}/overlay/${user?.username}/${item.key}`);
                    toast.success('Link disalin!');
                  }}
                  className="text-xs font-extrabold text-[#2d2d2d] hover:underline cursor-pointer"
                >
                  Salin Link
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#2d2d2d]/10 pb-3">
            <h3 className="font-black text-sm text-[#2d2d2d]">Top Donatur Bulan Ini</h3>
            <button
              type="button"
              onClick={() => setShowLeaderboard(true)}
              className="text-xs font-extrabold text-[#2d2d2d] hover:text-[#8f857b] cursor-pointer"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          {leaderboardData.length > 0 ? (
            <div className="space-y-2">
              {leaderboardData.slice(0, 5).map((donor, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between py-1.5"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-md border border-[#2d2d2d] flex items-center justify-center text-[10px] font-black shrink-0 ${
                      idx === 0 ? 'bg-amber-300 text-[#2d2d2d]' : idx === 1 ? 'bg-gray-200 text-[#2d2d2d]' : idx === 2 ? 'bg-orange-200 text-[#2d2d2d]' : 'bg-[#fbf8f3] text-[#2d2d2d]'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="text-sm font-extrabold text-[#2d2d2d] truncate">{donor.name}</span>
                  </div>
                  <span className="text-xs font-black text-[#2d2d2d] shrink-0">{formatRupiah(donor.totalAmount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-bold text-[#8f857b] text-center py-4">Belum ada donatur bulan ini.</p>
          )}
        </div>

        {/* Status Rekening */}
        <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-5 sm:p-6">
          <div className="flex items-center justify-between mb-3 border-b-2 border-[#2d2d2d]/10 pb-3">
            <h3 className="font-black text-sm text-[#2d2d2d]">Rekening Penerima</h3>
            <button
              type="button"
              onClick={() => router.push('/dashboard/profile?section=payout')}
              className="text-xs font-extrabold text-[#2d2d2d] hover:text-[#8f857b] cursor-pointer"
            >
              Ubah &rarr;
            </button>
          </div>
          {user?.isPayoutReady ? (
            <div className="bg-[#fbf8f3] border-2 border-[#2d2d2d] rounded-xl p-3 shadow-[2px_2px_0px_#2d2d2d] space-y-1">
              <div className="font-extrabold text-sm text-[#2d2d2d]">{user.payoutBank}</div>
              <div className="font-mono font-bold text-sm text-[#2d2d2d]">{user.payoutAccountNumber}</div>
              <div className="text-xs font-medium text-[#696057]">a.n {user.payoutAccountName}</div>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-xs font-bold text-amber-900 bg-amber-100 border-2 border-[#2d2d2d] p-3 rounded-xl shadow-[2px_2px_0px_#2d2d2d]">
              <svg className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Belum ada rekening aktif. Lengkapi di pengaturan.</span>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showLeaderboard && (
        <LeaderboardModal 
          onClose={() => setShowLeaderboard(false)} 
          leaderboardData={leaderboardData} 
        />
      )}
    </CreatorAppLayout>
  );
}
