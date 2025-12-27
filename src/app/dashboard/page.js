"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSessionManager } from '@/utils/sessionManager';
import ProfileModal from '@/components/organisms/ProfileModal';
import { formatRupiah } from '@/utils/format';
import { useProfileForm } from '@/hooks/useProfileForm';
import Header from '@/components/organisms/Header';
import DonationTable from '@/components/organisms/DonationTable';
import StatsSection from '@/components/organisms/StatsSection';
import LeaderboardModal from '@/components/organisms/LeaderboardModal';
import HistoryModal from '@/components/organisms/HistoryModal';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { startMonitoring, stopMonitoring, logout } = useSessionManager();
  const [user, setUser] = useState(null);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredHistoryData, setFilteredHistoryData] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [profileScrollTo, setProfileScrollTo] = useState(null); // 'payout' | 'basic' | null
  const [profileInitUser, setProfileInitUser] = useState(null);
  const { formData: profileFormData, setFormData: setProfileFormData, submit: submitProfile, loading: profileLoading, payoutLocked } = useProfileForm(profileInitUser, (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setProfileInitUser(updatedUser); // Update profileInitUser dengan data terbaru
    setShowProfile(false);
    
    // Refresh dashboard data setelah update profile/payout
    fetchData();
  });

  // Sync profileInitUser with user when user changes (e.g., after profile update)
  useEffect(() => {
    if (user && showProfile) {
      setProfileInitUser(user);
    }
  }, [user, showProfile]);

  // Handle OAuth callback - Generate JWT if needed
  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (typeof window === 'undefined') return;
      
      // Check if OAuth authenticated but no localStorage token
      if (status === 'authenticated' && session?.user) {
        const existingToken = localStorage.getItem('token');
        
        if (!existingToken) {
          try {
            // Generate custom JWT for OAuth user
            const tokenRes = await axios.post('/api/auth/oauth-token', {
              userId: session.user.id,
              email: session.user.email
            });
            
            localStorage.setItem('token', tokenRes.data.token);
            localStorage.setItem('user', JSON.stringify(tokenRes.data.user));
            
            // Set user and continue to dashboard
            setUser(tokenRes.data.user);
            toast.success('Login berhasil!');
            
            // Load dashboard data
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
    // Skip initialization if still loading session
    if (status === 'loading') return;

    // Skip if OAuth authenticated but token not yet generated
    if (status === 'authenticated' && !localStorage.getItem('token')) {
      // OAuth callback in progress, wait for it
      return;
    }

    let isActive = true; // Prevent state updates after unmount

    const initialize = async () => {
      await checkAuth();
      if (isActive) {
        await fetchData();
      }
    };

    initialize();

    // Polling untuk check donasi baru setiap 30 detik (hanya jika tab active)
    let donationPolling;

    const startPolling = () => {
      donationPolling = setInterval(() => {
        if (isActive && document.visibilityState === 'visible') {
          fetchData(true);
        }
      }, 30 * 1000);
    };

    // Start polling setelah initial load
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
      // Check if token exists when user tries to go back
      const token = localStorage.getItem('token');
      if (!token) {
        // No token = logged out, prevent access
        router.replace('/login');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  // Start session monitoring when user is authenticated
  useEffect(() => {
    if (user) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
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

      const [donationsRes, statsRes] = await Promise.all([
        axios.get('/api/dashboard/donations?limit=20', config),
        axios.get('/api/stats', config)
      ]);

      // Filter donations untuk hari ini (24 jam terakhir)
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      
      const todayDonations = (donationsRes.data.data || []).filter(donation => {
        const donationDate = new Date(donation.createdAt);
        return donationDate >= twentyFourHoursAgo;
      });

      // Notifikasi donasi baru
      if (showNewDonationNotif && donations.length > 0 && todayDonations.length > donations.length) {
        const newCount = todayDonations.length - donations.length;
        toast.success(`${newCount} donasi baru masuk! 🎉`, {
          duration: 4000,
          icon: '💰'
        });
      }

      setDonations(todayDonations);
      setStats(statsRes.data.stats || {});
    } catch (error) {
      console.error('Error fetching data:', error);
      
      if (error.response?.status === 401) {
        console.log('Token expired');
      } else {
        setError('Gagal memuat data');
      }
    } finally {
      setLoading(false);
    }
  };


  
  const deleteDonation = async (donationId) => {
    // Use toast for confirmation instead of confirm
    const confirmDelete = () => {
      return new Promise((resolve) => {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <div className="font-bold">Yakin ingin menghapus donasi ini?</div>
            <div className="flex gap-2">
              <button
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
              >
                Hapus
              </button>
              <button
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
              >
                Batal
              </button>
            </div>
          </div>
        ), { duration: Infinity });
      });
    };

    const confirmed = await confirmDelete();
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/dashboard/donations/${donationId}`, config);
      
      // Refresh semua data setelah delete
      fetchData();
      fetchHistoryData();
      fetchLeaderboardData();
      
      toast.success('Donasi berhasil dihapus');
    } catch (error) {
      console.error('Error deleting donation:', error);
      toast.error('Gagal menghapus donasi');
    }
  };

  const fetchHistoryData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch ALL donations for history (no 24-hour filter)
      const response = await axios.get('/api/dashboard/donations?limit=1000', config);
      const allDonations = response.data.data || [];
      
      // Filter only PAID donations for history modal
      const paidDonations = allDonations.filter(d => d.status === 'PAID');
      
      // Group donations by date
      const grouped = paidDonations.reduce((acc, donation) => {
        const date = new Date(donation.createdAt).toLocaleDateString('id-ID');
        if (!acc[date]) {
          acc[date] = {
            date,
            total: 0,
            count: 0,
            donations: []
          };
        }
        acc[date].total += donation.amount;
        acc[date].count += 1;
        acc[date].donations.push(donation);
        return acc;
      }, {});

      const historyArray = Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
      setHistoryData(historyArray);
      setFilteredHistoryData(historyArray);
    } catch (error) {
      console.error('Error fetching history data:', error);
    }
  };

  const fetchLeaderboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Leaderboard per user - menampilkan donatur terbaik untuk channel ini saja
      const response = await axios.get('/api/dashboard/donations?limit=1000', config);
      const allDonations = response.data.data || [];
      
      // Get current month and year for MONTHLY leaderboard (reset per bulan)
      const now = new Date();
      const currentMonth = now.getMonth(); // Juli = 6
      const currentYear = now.getFullYear(); // 2025
      
      // Filter donations for current month ONLY - leaderboard reset setiap bulan
      // Semua donasi di bulan Juli (termasuk tanggal 27, 28, dst) harus masuk
      // DAN hanya yang sudah PAID yang masuk leaderboard
      const thisMonthDonations = allDonations.filter(donation => {
        const donationDate = new Date(donation.createdAt);
        const donationMonth = donationDate.getMonth();
        const donationYear = donationDate.getFullYear();
        
        // Hanya donasi yang sudah PAID dan di bulan ini
        return donationMonth === currentMonth && 
               donationYear === currentYear && 
               donation.status === 'PAID';
      });
      
      // Group donations by donor name and sum amounts
      const grouped = thisMonthDonations.reduce((acc, donation) => {
        // Check both name and donorName fields
        const name = donation.name || donation.donorName || 'Anonymous';
        
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
        if (new Date(donation.createdAt) > new Date(acc[name].lastDonation)) {
          acc[name].lastDonation = donation.createdAt;
        }
        return acc;
      }, {});

      // Convert to array and sort by total amount
      const leaderboardArray = Object.values(grouped)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10); // Top 10 donors

      // Force state update
      setLeaderboardData([...leaderboardArray]);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    }
  };

  const handleDateFilter = (date) => {
    setSelectedDate(date);
    if (date === '') {
      setFilteredHistoryData(historyData);
    } else {
      const filtered = historyData.filter(day => day.date === date);
      setFilteredHistoryData(filtered);
    }
  };

  const handleLogout = () => {
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <span className="font-medium">Yakin ingin keluar?</span>
        <div className="flex space-x-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              
              try {
                // Stop monitoring FIRST to prevent interference
                stopMonitoring();
                
                // Set manual logout flag to prevent auto-logout messages
                const { sessionManager } = await import('@/utils/sessionManager');
                sessionManager.isManualLogout = true;
                
                // Clear localStorage
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Sign out from NextAuth if OAuth user (without redirect)
                if (session) {
                  await signOut({ redirect: false, callbackUrl: '/login' });
                }
                
                // Show success message
                toast.success('Berhasil logout!', { duration: 2000 });
              
                // Use replace to prevent back button
                setTimeout(() => {
                  router.replace('/');
                  sessionManager.isManualLogout = false; // Reset flag after redirect
                }, 500);
              } catch (error) {
                console.error('Logout error:', error);
                toast.error('Gagal logout.');
              }
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Ya, Keluar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium"
          >
            Batal
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
    });
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    submitProfile(user);
  };

  const openProfile = (scrollTo = null) => {
    setProfileInitUser(user);
    setProfileScrollTo(scrollTo);
    setShowProfile(true);
  };

  // Show notification preview when clicking on donation row
  const showNotificationPreview = (donation) => {
    // Send notification data to overlay via localStorage
    const notificationData = {
  message: `Donasi baru dari ${donation.name} sebesar ${formatRupiah(donation.amount)}`,
      detail: donation.message || '',
      time: new Date(donation.createdAt).toLocaleTimeString('id-ID'),
      timestamp: Date.now()
    };
    
    // Store in localStorage for overlay to pick up
    localStorage.setItem('overlay-notification-trigger', JSON.stringify(notificationData));
    
    // Trigger storage event for overlay pages
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'overlay-notification-trigger',
      newValue: JSON.stringify(notificationData)
    }));
    
    // Show toast for confirmation
    toast.success('Preview notifikasi dikirim ke halaman overlay');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono">
      {/* Header */}
      <Header user={user} openProfile={openProfile} />

      {/* Username Setup Warning Banner */}
      {(!user?.username || user?.username === '') && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 p-4 rounded-lg shadow-md flex items-start">
            <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">⚠️ Username Belum Diisi!</h3>
              <p className="text-sm mb-3">
                Anda perlu mengisi username dan rekening setting terlebih dahulu untuk mengaktifkan link donasi Anda. 
                Link donasi hanya akan berfungsi setelah username dan rekening setting diisi.
              </p>
              <button
                onClick={() => openProfile('basic')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                Setup Sekarang →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Setup Warning Banner */}
      {user?.username && !user?.isPayoutReady && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-orange-100 border-l-4 border-orange-500 text-orange-900 p-4 rounded-lg shadow-md flex items-start">
            <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">💰 Rekening Payout Belum Diisi!</h3>
              <p className="text-sm mb-3">
                Lengkapi informasi rekening (Bank/Channel, Nomor Rekening, dan Nama Pemilik) agar Anda bisa menerima pembayaran dari donasi. 
                Tanpa rekening yang lengkap, Anda tidak bisa melakukan withdrawal.
              </p>
              <button
                onClick={() => openProfile('payout')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm"
              >
                Lengkapi Rekening →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <HistoryModal 
          onClose={() => setShowHistory(false)} 
          historyData={filteredHistoryData} 
          selectedDate={selectedDate} 
          onDateFilterChange={handleDateFilter} 
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal 
          onClose={() => setShowLeaderboard(false)} 
          leaderboardData={leaderboardData} 
        />
      )}

      <ProfileModal 
        showProfile={showProfile}
        onClose={() => {
          setShowProfile(false);
          setProfileScrollTo(null); // Reset scroll target
        }}
        profileFormData={profileFormData}
        onFormDataChange={setProfileFormData}
        onSubmit={handleProfileSubmit}
        loading={profileLoading}
        payoutLocked={payoutLocked}
        onLogout={handleLogout}
        scrollToSection={profileScrollTo}
      />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">

        {/* Stats Section */}
        {stats && (
          <StatsSection 
            stats={stats} 
            onHistoryClick={() => { setShowHistory(true); fetchHistoryData(); }} 
            onLeaderboardClick={() => { setShowLeaderboard(true); fetchLeaderboardData(); }} 
          />
        )}

        {/* Donations Table */}
        <div className="bg-[#2d2d2d] border-4 border-[#b8a492] sm:rounded-xl overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-[#00fff7]/20">
            <h3 className="text-2xl leading-6 font-extrabold text-[#b8a492] tracking-wide font-mono">Donasi Hari Ini</h3>
            <p className="mt-1 max-w-2xl text-sm text-[#b8a492] font-mono">Donasi dalam 24 jam terakhir (otomatis reset setiap hari)</p>
          </div>
          {error && (
            <div className="bg-[#b8a492]/20 border-l-4 border-[#b8a492] p-4 mb-4">
              <div className="text-sm text-[#b8a492]">{error}</div>
            </div>
          )}

          <div className="overflow-x-auto">
            <DonationTable donations={donations} onDelete={deleteDonation} onPreviewNotification={showNotificationPreview} />
          </div>
          {donations.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-[#b8a492] font-mono">Belum ada donasi hari ini</p>
              <p className="text-[#b8a492] font-mono text-xs mt-1 opacity-70">Donasi akan muncul di sini untuk 24 jam, lalu pindah ke riwayat</p>
            </div>
          )}
        </div>
      </main>
      <footer className="w-full py-6 text-center text-[#b8a492] bg-[#2d2d2d] text-sm mt-8 flex flex-col items-center gap-2">
        <div>
          <a href="/privacy" className="underline hover:text-[#fff] transition-colors">Kebijakan Privasi</a>
          <span className="mx-2">|</span>
          <a href="/terms" className="underline hover:text-[#fff] transition-colors">Syarat & Ketentuan</a>
          <span className="mx-2">|</span>
          <a href="/faq" className="underline hover:text-[#fff] transition-colors">FAQ & Bantuan</a>
          <span className="mx-2">|</span>
          <a href="/contact" className="underline hover:text-[#fff] transition-colors">Hubungi Kami</a>
        </div>
        <div>
          &copy; {new Date().getFullYear()} Nyumbangin.
        </div>
      </footer>
      <style jsx global>{`
        body, .font-mono { font-family: 'IBM Plex Mono', 'Fira Mono', 'Roboto Mono', monospace; }
      `}</style>
    </div>
  );
}
