"use client";

import CreatorDetailModal from '../../components/organisms/CreatorDetailModal';
import StatusBadge from '../../components/atoms/StatusBadge';
import StatsCard from '../../components/StatsCard';
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Chart, registerables } from 'chart.js';
import { useState, useEffect, useRef } from "react";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  // Chart.js registration
  Chart.register(...registerables);

  // State declarations
  const [activeSection, setActiveSection] = useState('dashboard');
  const [payouts, setPayouts] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutError, setPayoutError] = useState("");
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notesModalType, setNotesModalType] = useState(''); // 'processed' or 'failed'
  const [notesModalId, setNotesModalId] = useState(null);
  const [notesInput, setNotesInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Auth check - must be admin
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        router.replace('/login');
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        
        // Must be admin
        if (parsedUser.userType !== 'admin') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.replace('/login');
          return;
        }
        
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // Prevent back button after logout
  useEffect(() => {
    if (!user) return;
    
    const handlePopState = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [user, router]);

  // Helper: always use array for payouts/creators
  const payoutsArray = Array.isArray(payouts) ? payouts : [];
  const creatorsArray = Array.isArray(creators) ? creators : [];

  // State for all donations
  const [donations, setDonations] = useState([]);
  const [donationLoading, setDonationLoading] = useState(true);
  // Fetch all donations for all creators (admin)
  useEffect(() => {
    async function fetchDonations() {
      setDonationLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get('/api/admin/donations?limit=200', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Admin donations API response:', res.data);
        setDonations(res.data?.data || []);
      } catch (err) {
        console.error('Admin donations API error:', err);
        setDonations([]);
      } finally {
        setDonationLoading(false);
      }
    }
    fetchDonations();
  }, []);

  // Calculate top creators by total donation (from donations, not payouts)
  const donationByCreator = {};
  donations.forEach(d => {
    if (!donationByCreator[d.createdByUsername]) donationByCreator[d.createdByUsername] = 0;
    donationByCreator[d.createdByUsername] += d.amount || 0;
  });
  const topCreators = creatorsArray
    .map(c => ({
      username: c.username,
      displayName: c.displayName,
      totalDonation: donationByCreator[c.username] || 0
    }))
    .sort((a, b) => b.totalDonation - a.totalDonation)
    .slice(0, 5);
  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    // Only create chart if we have data
    if (topCreators.length === 0) return;
    
    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: topCreators.map(c => c.displayName || c.username),
        datasets: [{
          label: 'Total Donasi (Rp)',
          data: topCreators.map(c => c.totalDonation),
          backgroundColor: [
            '#b8a492',
            '#d6c6b9', 
            '#f5e9da',
            '#b8a492aa',
            '#d6c6b9aa'
          ],
          borderColor: '#2d2d2d',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            display: true,
            labels: {
              color: '#b8a492',
              font: { size: 14, weight: 'bold' }
            }
          },
          title: {
            display: true,
            text: 'Top 5 Creator Paling Aktif (Total Donasi)',
            color: '#b8a492',
            font: { size: 20, weight: 'bold' },
            padding: 20
          },
          tooltip: {
            backgroundColor: '#2d2d2d',
            titleColor: '#b8a492',
            bodyColor: '#ffffff',
            borderColor: '#b8a492',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return `Total Donasi: ${context.parsed.y.toLocaleString('id-ID', { 
                  style: 'currency', 
                  currency: 'IDR' 
                })}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { 
              color: '#b8a492', 
              font: { weight: 'bold', size: 12 },
              maxRotation: 45
            },
            grid: { 
              color: '#b8a49222',
              drawOnChartArea: false
            }
          },
          y: {
            ticks: { 
              color: '#b8a492',
              font: { size: 12 },
              callback: function(value) {
                return value.toLocaleString('id-ID', { 
                  style: 'currency', 
                  currency: 'IDR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
              }
            },
            grid: { 
              color: '#b8a49222' 
            },
            beginAtZero: true
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }, [topCreators]);



   const openNotesModal = (id, type) => {
    setNotesModalId(id);
    setNotesModalType(type);
    setNotesInput('');
    setShowNotesModal(true);
  };

  const handleSubmitNotes = async () => {
    if (!notesModalId) return;
    try {
      await axios.put(`/api/admin/payouts`, { id: notesModalId, status: notesModalType, notes: notesInput }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      toast.success(notesModalType === 'PROCESSED' ? 'Payout berhasil diproses!' : 'Payout ditolak!');
      setShowNotesModal(false);
      setNotesModalId(null);
      setNotesModalType('');
      setNotesInput('');
      // Refresh payout data
      setPayoutLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get('/api/admin/payouts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayouts(res.data?.data || []);
      setPayoutLoading(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memproses payout!');
    }
  };

  // Fetch creators
  useEffect(() => {
    setLoading(true);
    axios.get('/api/admin/creators', {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => {
        console.log('Creators API response:', res.data);
        setCreators(res.data?.creators || []);
      })
      .catch((err) => {
        console.error('Creators API error:', err);
        setCreators([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch payouts
  useEffect(() => {
    setPayoutLoading(true);
    const token = localStorage.getItem("token");
    axios.get('/api/admin/payouts', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        console.log('Payouts API response:', res.data);
        setPayouts(res.data?.data || []);
        setPayoutError("");
      })
      .catch((err) => {
        console.error('Payouts API error:', err);
        setPayouts([]);
        setPayoutError(err.response?.data?.error || "Gagal memuat data pengajuan payout");
      })
      .finally(() => setPayoutLoading(false));
  }, []);
  // Fix: always use array for creators before filter
  // creatorsArray already defined above
  const filteredCreators = creatorsArray.filter(c =>
    c.username?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (creatorId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus creator ini?')) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/creators/${creatorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Creator berhasil dihapus!');
      
      // Refresh creators data
      setLoading(true);
      const res = await axios.get('/api/admin/creators', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCreators(res.data?.creators || []);
      setLoading(false);
    } catch (err) {
      console.error('Delete creator error:', err);
      toast.error(err.response?.data?.error || 'Gagal menghapus creator!');
    }
  };

  const handleLogout = () => {
    toast.dismiss(); // Dismiss all active toasts before showing confirmation
    toast((t) => (
      <div className="flex flex-col space-y-2">
        <span className="font-medium">Yakin ingin keluar?</span>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              
              // Clear all data
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              sessionStorage.clear();
              
              // Show success toast
              toast.success('Berhasil logout!', { duration: 1000 });
              
              // Redirect immediately
              setTimeout(() => {
                router.replace('/login');
                // Force reload to clear any cached state
                setTimeout(() => {
                  window.location.href = '/login';
                }, 100);
              }, 500);
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

  // Show loading while checking auth
  if (isAuthChecking || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#2d2d2d] mx-auto mb-4"></div>
          <p className="text-[#2d2d2d] font-mono font-bold">Memuat...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] text-[#2d2d2d] font-mono">
  {/* SIDEBAR */}
  <aside className="w-72 h-screen bg-[#2d2d2d] border-r-4 border-[#b8a492] flex flex-col justify-between py-6 px-4 fixed left-0 top-0 z-40">
        <div>
          {/* Logo and Brand */}
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-3">
              <img src="/logo.png" alt="Nyumbangin Logo" className="w-16 h-16" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-extrabold text-[#b8a492] tracking-wide leading-tight">
                Nyumbangin
              </h1>
              <span className="bg-[#b8a492] text-[#2d2d2d] px-3 py-1 rounded-full font-bold text-xs mt-2 inline-block">
                ADMIN PANEL
              </span>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex flex-col gap-3">
            <button
              className={`text-left text-base font-bold px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'dashboard' 
                  ? 'bg-[#b8a492] text-[#2d2d2d] shadow-lg' 
                  : 'text-[#b8a492] hover:text-[#d6c6b9] hover:bg-[#b8a492]/10'
              }`}
              onClick={() => setActiveSection('dashboard')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
              </svg>
              Dashboard
            </button>
            <button
              className={`text-left text-base font-bold px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'creator' 
                  ? 'bg-[#b8a492] text-[#2d2d2d] shadow-lg' 
                  : 'text-[#b8a492] hover:text-[#d6c6b9] hover:bg-[#b8a492]/10'
              }`}
              onClick={() => setActiveSection('creator')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM9 16a7 7 0 00-7-7v7h7zM20 9a7 7 0 00-7 7h7V9z"/>
              </svg>
              Creator
            </button>
            <button
              className={`text-left text-base font-bold px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                activeSection === 'payout' 
                  ? 'bg-[#b8a492] text-[#2d2d2d] shadow-lg' 
                  : 'text-[#b8a492] hover:text-[#d6c6b9] hover:bg-[#b8a492]/10'
              }`}
              onClick={() => setActiveSection('payout')}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
              </svg>
              Payout
            </button>
          </nav>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-3 rounded-lg font-bold border-2 border-red-700 hover:bg-red-700 transition-all flex items-center justify-center gap-2 w-full"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
          </svg>
          Logout
        </button>
      </aside>      {/* MAIN CONTENT */}
      <main className="flex-grow w-full font-mono">
  <div className="ml-72 max-w-6xl mx-auto py-8 px-4 h-screen overflow-y-auto">
          {/* DASHBOARD SECTION */}
          {activeSection === 'dashboard' && (            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-[#2d2d2d] mb-4">Dashboard Admin</h2>
              <p className="text-[#2d2d2d] mb-2">Selamat datang di panel admin Nyumbangin. Silakan pilih menu di sidebar untuk mengelola data.</p>              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                <StatsCard 
                  title="Total Creator" 
                  value={creatorsArray.length} 
                />
                <StatsCard 
                  title="Total Payout" 
                  value={payoutsArray.length} 
                />
                <StatsCard 
                  title="Payout Selesai" 
                  value={payoutsArray.filter(p => p.status === 'PROCESSED').length} 
                />
              </div>

              {/* Bar Chart for Top Creators */}
              <div className="mt-10 bg-[#2d2d2d] border-2 border-[#b8a492] rounded-xl p-6">
                {topCreators.length > 0 ? (
                  <canvas ref={chartRef} style={{ height: '400px' }} />
                ) : (
                  <div className="text-center py-12 text-[#b8a492]">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-lg font-bold">Belum ada data donasi untuk ditampilkan</p>
                    <p className="text-sm opacity-75 mt-2">Grafik akan muncul setelah ada donasi dari creator</p>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* PAYOUT SECTION */}
          {activeSection === 'payout' && (
            <div id="payout" className="bg-[#2d2d2d] border-4 border-[#b8a492] sm:rounded-xl overflow-hidden mb-8">
              <div className="px-4 py-5 sm:px-6 border-b border-[#00fff7]/20">
                <h3 className="text-2xl leading-6 font-extrabold text-[#b8a492] tracking-wide font-mono">Riwayat Pengajuan Payout Creator</h3>
                <p className="mt-1 max-w-2xl text-sm text-[#b8a492] font-mono">Kelola dan proses pengajuan pencairan dana dari para creator</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#b8a492]/20">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Username</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Tanggal Request</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Nominal</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Tanggal Proses</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Catatan</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payoutLoading ? (
                      <tr><td colSpan={7} className="text-center py-6 text-[#b8a492]">Memuat...</td></tr>
                    ) : payouts.length === 0 ? (
                      <tr><td colSpan={7} className="text-center py-6 text-[#b8a492]">Belum ada pengajuan payout</td></tr>
                    ) : (
                      payoutsArray.map(p => (
                        <tr key={p._id}>
                          <td className="px-4 py-2 text-sm text-white">{p.creatorUsername}</td>
                          <td className="px-4 py-2 text-sm text-white">{new Date(p.requestedAt).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-2 text-sm text-white">{p.amount?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                          <td className="px-4 py-2 text-sm font-bold">
                            {p.status === 'PENDING' && <span className="bg-yellow-900/30 text-yellow-200 border border-yellow-400/40 rounded px-2 py-1">Pending</span>}
                            {p.status === 'APPROVED' && <span className="bg-blue-900/30 text-blue-300 border border-blue-400/40 rounded px-2 py-1">Disetujui</span>}
                            {p.status === 'PROCESSED' && <span className="bg-green-900/30 text-green-300 border border-green-400/40 rounded px-2 py-1">Selesai</span>}
                            {p.status === 'REJECTED' && <span className="bg-red-900/30 text-red-300 border border-red-400/40 rounded px-2 py-1">Ditolak</span>}
                          </td>
                          <td className="px-4 py-2 text-sm text-white">{p.processedAt ? new Date(p.processedAt).toLocaleString('id-ID') : '-'}</td>
                          <td className="px-4 py-2 text-sm text-white">{p.adminNote || '-'}</td>
                          <td className="px-4 py-2 text-sm">
                            {p.status === 'PENDING' && (
                              <>
                                <button className="bg-green-700 text-white px-3 py-1 rounded mr-2 cursor-pointer hover:bg-green-600" onClick={() => openNotesModal(p._id, 'PROCESSED')}>Proses</button>
                                <button className="bg-red-700 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600" onClick={() => openNotesModal(p._id, 'REJECTED')}>Tolak</button>
                                {/* Modal for input catatan payout */}
                                {showNotesModal && (
                                  <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
                                    <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 w-full max-w-md shadow-xl">
                                      <h2 className="text-xl font-extrabold text-[#b8a492] mb-2">{notesModalType === 'PROCESSED' ? 'Proses Payout' : 'Tolak Payout'}</h2>
                                      <label className="block mb-2 font-semibold text-[#b8a492]">Catatan (opsional)</label>
                                      <textarea
                                        className="w-full border-2 border-[#b8a492] rounded-lg p-2 mb-4 bg-[#fbe8d4] text-[#2d2d2d] font-mono focus:outline-none focus:ring-2 focus:ring-[#b8a492] placeholder-[#b8a492]"
                                        rows={3}
                                        value={notesInput}
                                        onChange={e => setNotesInput(e.target.value)}
                                        placeholder="Isi catatan untuk payout ini..."
                                      />
                                      <div className="flex gap-2 justify-end">
                                        <button className="px-4 py-2 rounded-lg bg-[#b8a492] text-[#2d2d2d] font-bold border-2 border-[#b8a492] hover:bg-[#d6c6b9] transition-all" onClick={() => setShowNotesModal(false)}>Batal</button>
                                        <button className="px-4 py-2 rounded-lg bg-[#2d2d2d] text-[#b8a492] font-bold border-2 border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d] transition-all" onClick={handleSubmitNotes}>
                                          Simpan & {notesModalType === 'processed' ? 'Proses' : 'Tandai Gagal'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {payoutError && <div className="text-red-500 mt-2 text-sm">{payoutError}</div>}
              </div>
            </div>
          )}
          {/* CREATOR SECTION */}
          {activeSection === 'creator' && (
            <div id="creator" className="bg-[#2d2d2d] border-4 border-[#b8a492] sm:rounded-xl overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-[#00fff7]/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-2xl leading-6 font-extrabold text-[#b8a492] tracking-wide font-mono">Daftar Creator</h3>
                  <p className="mt-1 max-w-2xl text-sm text-[#b8a492] font-mono">Kelola akun creator yang terdaftar di platform</p>
                </div>
                <div className="relative w-full sm:w-80 mt-2 sm:mt-0">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-[#b8a492]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Cari creator..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 rounded-lg border-2 border-[#b8a492] bg-[#fbe8d4] text-[#2d2d2d] focus:outline-none focus:ring-2 focus:ring-[#b8a492] placeholder-[#b8a492] font-mono text-base shadow-sm transition-all"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#b8a492]/20">
                  <thead className="bg-[#2d2d2d]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Username</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Nama</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Payout</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-[#2d2d2d] divide-y divide-[#b8a492]/10">
                    {filteredCreators.map((c) => (
                      <tr
                        key={c._id}
                        className="hover:bg-[#d6c6b9]/20 transition-all cursor-pointer"
                        onClick={() => {
                          setSelectedCreator(c);
                          setIsModalOpen(true);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-[#b8a492] font-mono">{c.username}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-[#b8a492] font-mono">{c.email}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-[#b8a492] font-mono">{c.displayName}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {c.payoutAccountNumber && c.payoutAccountHolder ? (
                            <StatusBadge status="PAID">Lengkap</StatusBadge>
                          ) : (
                            <StatusBadge status="FAILED">Belum</StatusBadge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(c._id);
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
                {filteredCreators.length === 0 && (
                  <div className="text-center py-12 text-[#b8a492] font-mono">
                    Belum ada creator terdaftar.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>        {/* MODAL DETAIL CREATOR */}
        {isModalOpen && selectedCreator && (
          <CreatorDetailModal
            creator={selectedCreator}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCreator(null);
            }}
          />
        )}
      </main>
    </div>
  );
};
