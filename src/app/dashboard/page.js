"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { useSessionManager } from '@/utils/sessionManager';
import ProfileModal from '@/components/organisms/ProfileModal';
import { formatRupiah } from '@/utils/format';
import { useProfileForm } from '@/hooks/useProfileForm';
import Header from '@/components/organisms/Header';
import { SOCKET_SERVER_URL } from '@/constants/realtime';
import DonationTable from '@/components/organisms/DonationTable';
import StatsSection from '@/components/organisms/StatsSection';
import LeaderboardModal from '@/components/organisms/LeaderboardModal';
import HistoryModal from '@/components/organisms/HistoryModal';

export default function Dashboard() {
  const router = useRouter();
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
  const [profileInitUser, setProfileInitUser] = useState(null);
  const { formData: profileFormData, setFormData: setProfileFormData, submit: submitProfile, loading: profileLoading, payoutLocked } = useProfileForm(profileInitUser, (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setShowProfile(false);
  });
  const socketRef = useRef(null);

  useEffect(() => {
    checkAuth();
    fetchData();

    // Set up interval to refresh data every hour to remove old donations
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 60 * 60 * 1000); // Refresh every hour

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // Start session monitoring when user is authenticated
  useEffect(() => {
    if (user) {
      startMonitoring();
    }

    return () => {
      stopMonitoring();
    };
  }, [user, startMonitoring, stopMonitoring]);

  // WebSocket connection for auto-refresh when new donations come in
  useEffect(() => {
    if (!user?.username) return;

    // Connect to socket.io server for realtime data refresh
    if (!socketRef.current) {
  const socketUrl = SOCKET_SERVER_URL;
  socketRef.current = io(socketUrl);
      
      socketRef.current.on('connect', () => {
        console.log('Dashboard connected to socket server for auto-refresh');
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.error('Dashboard socket connection error:', error);
      });
      
      socketRef.current.on('new-donation', (data) => {
        console.log('🔄 New donation received, refreshing dashboard data:', data);
        
        // Only refresh if donation is for this user
        if (data.createdByUsername && data.createdByUsername === user.username) {
          console.log('Refreshing dashboard data for new donation');
          // Refresh data automatically when new donation comes in
          fetchData();
        }
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.username]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    // Fetch fresh profile to include payout fields (in case older localStorage missing them)
    fetchFreshProfile(token, parsedUser);
  };

  const fetchFreshProfile = async (token, fallbackUser) => {
    try {
      const res = await axios.get('/api/user/profile', { headers: { Authorization: `Bearer ${token}` } });
      if (res.data?.user) {
        const merged = { ...fallbackUser, ...res.data.user };
        setUser(merged);
        localStorage.setItem('user', JSON.stringify(merged));
      }
    } catch (e) {
      console.warn('Gagal mengambil profil terbaru:', e?.response?.data || e.message);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const [donationsRes, statsRes] = await Promise.all([
        axios.get('/api/dashboard/donations?limit=20', config),
        axios.get('/api/stats', config)
      ]);

      // Filter donations to show only TODAY's donations (last 24 hours) for the main table
      // This is for the "Donasi Terbaru" table only, NOT for history or leaderboard
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
      
      const todayDonations = (donationsRes.data.data || []).filter(donation => {
        const donationDate = new Date(donation.createdAt);
        return donationDate >= twentyFourHoursAgo;
      });

      setDonations(todayDonations);
      setStats(statsRes.data.stats || {});
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Gagal memuat data');
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
      
      // Group donations by date
      const grouped = allDonations.reduce((acc, donation) => {
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
            onClick={() => {
              toast.dismiss(t.id);
              toast.promise(
                new Promise((resolve) => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  setTimeout(() => {
                    resolve();
                    router.push('/');
                  }, 500);
                }),
                {
                  loading: 'Keluar dari akun...',
                  success: 'Berhasil logout!',
                  error: 'Gagal logout'
                }
              );
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

  const openProfile = () => {
    setProfileInitUser(user);
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
        onClose={() => setShowProfile(false)}
        profileFormData={profileFormData}
        onFormDataChange={setProfileFormData}
        onSubmit={handleProfileSubmit}
        loading={profileLoading}
        payoutLocked={payoutLocked}
        onLogout={handleLogout}
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
