'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { useSessionManager } from '@/utils/sessionManager';

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
  const [profileFormData, setProfileFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
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
      const socketUrl = 'https://socket-server-production-03be.up.railway.app/';
        
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
        if (data.ownerUsername && data.ownerUsername === user.username) {
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

  const updateDonationStatus = async (donationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.patch(`/api/dashboard/donations/${donationId}`, 
        { status: newStatus }, 
        config
      );
      
      // Refresh data
      fetchData();
      toast.success('Status donasi berhasil diupdate');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Gagal mengupdate status donasi');
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
      fetchData();
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
      const thisMonthDonations = allDonations.filter(donation => {
        const donationDate = new Date(donation.createdAt);
        const donationMonth = donationDate.getMonth();
        const donationYear = donationDate.getFullYear();
        
        return donationMonth === currentMonth && donationYear === currentYear;
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);

    // Frontend validation
    if (!profileFormData.displayName || !profileFormData.username) {
      toast.error('Nama tampilan dan username wajib diisi!');
      setProfileLoading(false);
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(profileFormData.username)) {
      toast.error('Username hanya boleh berisi huruf, angka, underscore, dan dash!');
      setProfileLoading(false);
      return;
    }

    // Validate password if provided
    if (profileFormData.newPassword || profileFormData.currentPassword || profileFormData.confirmPassword) {
      if (!profileFormData.currentPassword) {
        toast.error('Password lama wajib diisi untuk mengubah password!');
        setProfileLoading(false);
        return;
      }
      
      if (!profileFormData.newPassword) {
        toast.error('Password baru wajib diisi!');
        setProfileLoading(false);
        return;
      }

      if (profileFormData.newPassword.length < 6) {
        toast.error('Password baru minimal 6 karakter!');
        setProfileLoading(false);
        return;
      }

      if (profileFormData.newPassword !== profileFormData.confirmPassword) {
        toast.error('Password baru dan konfirmasi password tidak sama!');
        setProfileLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Update profile info
      const profileUpdate = {
        displayName: profileFormData.displayName,
        username: profileFormData.username
      };

      const response = await axios.put('/api/user/profile', profileUpdate, config);
      
      // Update password if provided
      if (profileFormData.newPassword && profileFormData.currentPassword) {
        await axios.put('/api/user/password', {
          currentPassword: profileFormData.currentPassword,
          newPassword: profileFormData.newPassword
        }, config);
        
        toast.success('Profil dan password berhasil diupdate');
      } else {
        toast.success('Profil berhasil diupdate');
      }

      // Update local user data
      const updatedUser = { ...user, ...response.data.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setShowProfile(false);
      // Reset form
      setProfileFormData({
        ...profileFormData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Gagal mengupdate profil');
    } finally {
      setProfileLoading(false);
    }
  };

  const openProfile = () => {
    setProfileFormData({
      displayName: user?.displayName || '',
      username: user?.username || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowProfile(true);
  };

  // Show notification preview when clicking on donation row
  const showNotificationPreview = (donation) => {
    // Send notification data to overlay via localStorage
    const notificationData = {
      message: `Donasi baru dari ${donation.name} sebesar Rp ${donation.amount.toLocaleString('id-ID')}`,
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

      <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-extrabold text-[#b8a492] tracking-wide font-mono">Nyumbangin Dashboard</h1>
              <p className="text-[#b8a492] text-lg mt-2 font-mono">Selamat datang, <span className="font-bold">{user?.displayName || user?.email}</span></p>
              {user?.username && (
                <p className="text-sm text-[#b8a492] mt-1 font-mono flex items-center gap-2">
                  Link donasi Anda:
                  <Link
                    href={`/donate/${user.username}`}
                    className="ml-1 underline hover:text-[#d6c6b9]"
                  >
                    /donate/{user.username}
                  </Link>
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  const notifUrl = `${window.location.origin}/overlay/${user?.username}/notifications`;
                  navigator.clipboard.writeText(notifUrl);
                  toast.success('Link notifikasi berhasil disalin!');
                }}
                className="bg-transparent text-[#b8a492] border-[#b8a492] px-4 py-2 rounded-lg font-bold border-2 hover:bg-[#b8a492]/10 transition-all"
                title="Copy Link Notifikasi"
              >
                🔔 Copy Notif
              </button>
              <button
                onClick={() => {
                  const leaderboardUrl = `${window.location.origin}/overlay/${user?.username}/leaderboard`;
                  navigator.clipboard.writeText(leaderboardUrl);
                  toast.success('Link leaderboard berhasil disalin!');
                }}
                className="bg-transparent text-[#b8a492] border-[#b8a492] px-4 py-2 rounded-lg font-bold border-2 hover:bg-[#b8a492]/10 transition-all"
                title="Copy Link Leaderboard"
              >
                🏆 Copy Board
              </button>
              <button
                onClick={openProfile}
                className="bg-transparent text-[#b8a492] border-[#b8a492] px-4 py-2 rounded-lg font-bold border-2 hover:bg-[#b8a492]/10 transition-all"
                title="Edit Profil"
              >
                👤 Profil
              </button>
              <button
                onClick={handleLogout}
                className="bg-[#b8a492] text-[#2d2d2d] px-6 py-2 rounded-lg font-bold border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>


      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-1 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 max-w-5xl w-full max-h-full overflow-hidden shadow-xl relative">
            <h3 className="text-2xl font-extrabold text-[#b8a492] mb-4 font-mono text-center">Riwayat Donasi Harian</h3>
            <button
              className="absolute top-3 right-3 px-3 py-1 rounded border-2 border-[#b8a492] bg-[#b8a492] text-[#2d2d2d] font-bold font-mono hover:bg-[#d6c6b9] transition-all"
              onClick={() => setShowHistory(false)}
            >
              Tutup
            </button>
            
            {/* Date Filter */}
            <div className="mt-4 mb-6">
              <label className="block text-sm font-bold text-[#b8a492] font-mono mb-2">
                Filter berdasarkan tanggal:
              </label>
              <select
                value={selectedDate}
                onChange={(e) => handleDateFilter(e.target.value)}
                className="w-full px-3 py-2 border-2 border-[#b8a492] bg-[#2d2d2d] text-[#b8a492] font-mono rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
              >
                <option value="">Semua tanggal</option>
                {historyData.map((day, idx) => (
                  <option key={idx} value={day.date}>
                    {day.date} - Rp {day.total.toLocaleString('id-ID')} ({day.count} donasi)
                  </option>
                ))}
              </select>
            </div>

            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto flex flex-col gap-4 mt-4">
              {filteredHistoryData.length === 0 ? (
                <div className="text-[#b8a492] text-center font-mono">
                  {selectedDate ? 'Tidak ada donasi pada tanggal tersebut' : 'Memuat data...'}
                </div>
              ) : (
                filteredHistoryData.map((day, idx) => (
                  <div key={idx} className="bg-[#b8a492]/20 border-2 border-[#b8a492] rounded-md p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-bold text-[#b8a492] font-mono text-lg">{day.date}</div>
                      <div className="text-[#b8a492] font-mono">
                        <span className="font-bold">Rp {day.total.toLocaleString('id-ID')}</span> ({day.count} donasi)
                      </div>
                    </div>
                    <div className="space-y-1">
                      {day.donations.map((donation, i) => (
                        <div key={i} className="text-sm text-[#b8a492] font-mono flex justify-between">
                          <span>{donation.name}</span>
                          <span>Rp {donation.amount.toLocaleString('id-ID')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-1 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 max-w-5xl w-full max-h-full overflow-hidden shadow-xl relative">
            <h3 className="text-2xl font-extrabold text-[#b8a492] mb-4 font-mono text-center">Leaderboard</h3>
            <button
              className="absolute top-3 right-3 px-3 py-1 rounded border-2 border-[#b8a492] bg-[#b8a492] text-[#2d2d2d] font-bold font-mono hover:bg-[#d6c6b9] transition-all"
              onClick={() => setShowLeaderboard(false)}
            >
              Tutup
            </button>
            
            <div className="text-center text-[#b8a492] font-mono mb-6 text-sm">
              Sultan bulan ini
            </div>

            <div>
              {leaderboardData.length === 0 ? (
                <div className="text-[#b8a492] text-center font-mono py-8">
                  Belum ada donasi bulan ini
                </div>
              ) : (
                <div className="bg-[#b8a492]/20 border-2 border-[#b8a492] rounded-md p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="font-bold text-[#b8a492] font-mono text-lg">Top Donatur</div>
                    <div className="text-[#b8a492] font-mono text-sm">
                      Total: {leaderboardData.reduce((sum, donor) => sum + donor.totalAmount, 0).toLocaleString('id-ID')} • {leaderboardData.length} donatur
                    </div>
                  </div>
                  <div className="space-y-1">
                    {leaderboardData.map((donor, idx) => (
                      <div key={idx} className="text-sm text-[#b8a492] font-mono flex justify-between items-center py-1">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-[#b8a492] text-[#2d2d2d] rounded-full flex items-center justify-center font-bold text-xs">
                            {idx + 1}
                          </span>
                          <span>{donor.name}</span>
                        </div>
                        <span>Rp {donor.totalAmount.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-1 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 max-w-2xl w-full max-h-full overflow-hidden shadow-xl relative">
            <h3 className="text-2xl font-extrabold text-[#b8a492] mb-4 font-mono text-center">Edit Profil</h3>
            <button
              className="absolute top-3 right-3 px-3 py-1 rounded border-2 border-[#b8a492] bg-[#b8a492] text-[#2d2d2d] font-bold font-mono hover:bg-[#d6c6b9] transition-all"
              onClick={() => setShowProfile(false)}
            >
              Tutup
            </button>
            
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
              <form onSubmit={handleProfileSubmit} className="space-y-4 mt-6">
                {/* Basic Info */}
                <div className="bg-[#b8a492]/10 p-4 rounded-lg border border-[#b8a492]/30">
                  <h4 className="text-lg font-bold text-[#b8a492] mb-3 font-mono">Informasi Dasar</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                        Nama Tampilan
                      </label>
                      <input
                        type="text"
                        value={profileFormData.displayName}
                        onChange={(e) => setProfileFormData({...profileFormData, displayName: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#b8a492] bg-[#2d2d2d] text-[#b8a492] font-mono rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
                        placeholder="Nama yang akan ditampilkan"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                        Username
                      </label>
                  <input
                    type="text"
                    value={profileFormData.username}
                    disabled
                    className="w-full px-3 py-2 border-2 border-[#b8a492]/50 bg-[#2d2d2d]/50 text-[#b8a492]/70 font-mono rounded-md cursor-not-allowed"
                    placeholder="Username untuk link donasi"
                  />
                  <p className="text-xs text-[#b8a492]/70 mt-1 font-mono">
                    Link donasi: /donate/{profileFormData.username || 'username'}
                  </p>
                </div>

                    
                    <div>
                      <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileFormData.email}
                        disabled
                        className="w-full px-3 py-2 border-2 border-[#b8a492]/50 bg-[#2d2d2d]/50 text-[#b8a492]/70 font-mono rounded-md cursor-not-allowed"
                      />
                      <p className="text-xs text-[#b8a492]/70 mt-1 font-mono">
                        Email tidak dapat diubah
                      </p>
                    </div>
                  </div>
                </div>

                {/* Password Change */}
                <div className="bg-[#b8a492]/10 p-4 rounded-lg border border-[#b8a492]/30">
                  <h4 className="text-lg font-bold text-[#b8a492] mb-3 font-mono">Ubah Password</h4>
                  <p className="text-xs text-[#b8a492]/70 mb-3 font-mono">
                    Kosongkan jika tidak ingin mengubah password
                  </p>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                        Password Saat Ini
                      </label>
                      <input
                        type="password"
                        value={profileFormData.currentPassword}
                        onChange={(e) => setProfileFormData({...profileFormData, currentPassword: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#b8a492] bg-[#2d2d2d] text-[#b8a492] font-mono rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
                        placeholder="Masukkan password lama"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                        Password Baru
                      </label>
                      <input
                        type="password"
                        value={profileFormData.newPassword}
                        onChange={(e) => setProfileFormData({...profileFormData, newPassword: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#b8a492] bg-[#2d2d2d] text-[#b8a492] font-mono rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
                        placeholder="Masukkan password baru"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-[#b8a492] font-mono mb-1">
                        Konfirmasi Password Baru
                      </label>
                      <input
                        type="password"
                        value={profileFormData.confirmPassword}
                        onChange={(e) => setProfileFormData({...profileFormData, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border-2 border-[#b8a492] bg-[#2d2d2d] text-[#b8a492] font-mono rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
                        placeholder="Ulangi password baru"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 sticky bottom-0 bg-[#2d2d2d] pb-2">
                  <button
                    type="button"
                    onClick={() => setShowProfile(false)}
                    className="flex-1 bg-transparent text-[#b8a492] border-[#b8a492] px-4 py-3 rounded-lg font-bold border-2 hover:bg-[#b8a492]/10 transition-all font-mono"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 bg-[#b8a492] text-[#2d2d2d] px-4 py-3 rounded-lg font-bold border-2 border-[#2d2d2d] hover:bg-[#d6c6b9] transition-all font-mono disabled:opacity-50"
                  >
                    {profileLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#00fff7] to-[#333399] rounded-full flex items-center justify-center shadow-neon">
                      <span className="text-[#181818] text-xl font-extrabold">#</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[#b8a492] truncate font-mono">
                        Total Donasi
                      </dt>
                      <dd className="text-2xl font-bold text-[#b8a492] font-mono">
                        {stats.totalDonations || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ff00cc] to-[#00fff7] rounded-full flex items-center justify-center shadow-neon">
                      <span className="text-[#181818] text-xl font-extrabold">Rp</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[#b8a492] truncate font-mono">
                        Total Terkumpul
                      </dt>
                      <dd className="text-2xl font-bold text-[#b8a492] font-mono">
                        Rp {(stats.totalAmount || 0).toLocaleString('id-ID')}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl cursor-pointer hover:bg-[#b8a492]/10 transition-all" onClick={() => { setShowHistory(true); fetchHistoryData(); }}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#333399] to-[#00fff7] rounded-full flex items-center justify-center shadow-neon">
                      <span className="text-[#181818] text-xl font-extrabold">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[#b8a492] truncate font-mono">
                        Riwayat Harian
                      </dt>
                      <dd className="text-xl font-bold text-[#b8a492] font-mono">
                        Klik untuk lihat
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl cursor-pointer hover:bg-[#b8a492]/10 transition-all" onClick={() => { setShowLeaderboard(true); fetchLeaderboardData(); }}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ff00cc] to-[#333399] rounded-full flex items-center justify-center shadow-neon">
                      <span className="text-[#181818] text-xl font-extrabold">🏆</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-[#b8a492] truncate font-mono">
                        Leaderboard Bulanan
                      </dt>
                      <dd className="text-xl font-bold text-[#b8a492] font-mono">
                        Klik untuk lihat
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            <table className="min-w-full divide-y divide-[#b8a492]/20">
              <thead className="bg-[#2d2d2d]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Donatur</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Jumlah</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-[#2d2d2d] divide-y divide-[#b8a492]/10">
                {donations.map((donation) => (
                  <tr key={donation._id} className="hover:bg-[#d6c6b9]/20 transition-all cursor-pointer" onClick={() => showNotificationPreview(donation)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-[#b8a492] font-mono">{donation.name}</div>
                        <div className="text-sm text-[#b8a492] font-mono truncate">{donation.message || 'Tidak ada pesan'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-[#b8a492] font-mono">Rp {donation.amount.toLocaleString('id-ID')}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold rounded-full px-2 py-1 bg-[#b8a492]/20 text-[#2d2d2d] border-2 border-[#b8a492] font-mono">PAID</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#b8a492] font-mono">
                      {new Date(donation.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click when clicking delete
                          deleteDonation(donation._id);
                        }}
                        className="text-[#b8a492] hover:text-[#2d2d2d] transition-all font-mono"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {donations.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-[#b8a492] font-mono">Belum ada donasi hari ini</p>
              <p className="text-[#b8a492] font-mono text-xs mt-1 opacity-70">Donasi akan muncul di sini untuk 24 jam, lalu pindah ke riwayat</p>
            </div>
          )}
        </div>
      </main>
      <style jsx global>{`
        body, .font-mono { font-family: 'IBM Plex Mono', 'Fira Mono', 'Roboto Mono', monospace; }
      `}</style>
    </div>
  );
}
