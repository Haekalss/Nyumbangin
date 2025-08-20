"use client";

import CreatorDetailModal from '../../components/organisms/CreatorDetailModal';
import StatusBadge from '../../components/atoms/StatusBadge';
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { Chart, registerables } from 'chart.js';
import { useState, useEffect, useRef } from "react";


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
        const res = await axios.get('/api/dashboard/donations?limit=100', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDonations(res.data?.data || []);
      } catch (err) {
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
    if (!donationByCreator[d.ownerUsername]) donationByCreator[d.ownerUsername] = 0;
    donationByCreator[d.ownerUsername] += d.amount || 0;
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
    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels: topCreators.map(c => c.displayName || c.username),
        datasets: [{
          label: 'Total Donasi (Rp)',
          data: topCreators.map(c => c.totalDonation),
          backgroundColor: '#b8a492',
          borderColor: '#2d2d2d',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Top 5 Creator Paling Aktif (Total Donasi)',
            color: '#b8a492',
            font: { size: 18 }
          }
        },
        scales: {
          x: {
            ticks: { color: '#b8a492', font: { weight: 'bold' } },
            grid: { color: '#b8a49222' }
          },
          y: {
            ticks: { color: '#b8a492' },
            grid: { color: '#b8a49222' }
          }
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
      toast.success(notesModalType === 'processed' ? 'Payout berhasil diproses!' : 'Payout ditandai gagal!');
      setShowNotesModal(false);
      setNotesModalId(null);
      setNotesModalType('');
      setNotesInput('');
      // Refresh payout data
      setPayoutLoading(true);
      const res = await axios.get('/api/admin/payouts');
      setPayouts(res.data?.data || []);
      setPayoutLoading(false);
    } catch (err) {
      toast.error('Gagal memproses payout!');
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
    axios.get('/api/admin/payouts')
      .then(res => {
        console.log('Payouts API response:', res.data);
        setPayouts(res.data?.data || []);
        setPayoutError("");
      })
      .catch((err) => {
        console.error('Payouts API error:', err);
        setPayouts([]);
        setPayoutError("Gagal memuat data pengajuan payout");
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

  const handleLogout = () => {
    toast.dismiss(); // Dismiss all active toasts before showing confirmation
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
                    router.replace('/login');
                    setTimeout(() => { window.location.reload(); }, 100);
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

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] text-[#2d2d2d] font-mono">
  {/* SIDEBAR */}
  <aside className="w-64 h-screen bg-[#2d2d2d] border-r-4 border-[#b8a492] flex flex-col justify-between py-8 px-6 fixed left-0 top-0 z-40">
        <div>
          <div className="mb-2">
            <span className="text-3xl font-extrabold text-[#b8a492] tracking-wide block">Nyumbangin</span>
          </div>
          <div className="mb-8">
            <span className="bg-[#b8a492] text-[#2d2d2d] px-2 py-1 rounded font-bold text-xs block w-fit">ADMIN</span>
          </div>
          <nav className="flex flex-col gap-4">
            <button
              className={`text-left text-lg font-bold px-2 py-2 rounded transition-all ${activeSection === 'dashboard' ? 'bg-[#b8a492] text-[#2d2d2d]' : 'text-[#b8a492] hover:text-[#d6c6b9]'}`}
              onClick={() => setActiveSection('dashboard')}
            >Dashboard</button>
            <button
              className={`text-left text-lg font-bold px-2 py-2 rounded transition-all ${activeSection === 'creator' ? 'bg-[#b8a492] text-[#2d2d2d]' : 'text-[#b8a492] hover:text-[#d6c6b9]'}`}
              onClick={() => setActiveSection('creator')}
            >Creator</button>
            <button
              className={`text-left text-lg font-bold px-2 py-2 rounded transition-all ${activeSection === 'payout' ? 'bg-[#b8a492] text-[#2d2d2d]' : 'text-[#b8a492] hover:text-[#d6c6b9]'}`}
              onClick={() => setActiveSection('payout')}
            >Payout</button>
          </nav>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold border-2 border-red-700 hover:bg-red-700 font-mono text-base transition-colors mt-8"
        >
          Logout
        </button>
      </aside>
      {/* MAIN CONTENT */}
      <main className="flex-grow w-full font-mono">
  <div className="ml-64 max-w-6xl mx-auto py-8 px-4 h-screen overflow-y-auto">
          {/* DASHBOARD SECTION */}
          {activeSection === 'dashboard' && (
            <div className="mb-8">
              <h2 className="text-3xl font-extrabold text-[#2d2d2d] mb-4">Dashboard Admin</h2>
              <p className="text-[#2d2d2d] mb-2">Selamat datang di panel admin Nyumbangin. Silakan pilih menu di sidebar untuk mengelola data.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                <div className="bg-[#2d2d2d] border-2 border-[#b8a492] rounded-xl p-6 flex flex-col items-center">
                  <span className="text-lg text-[#b8a492] font-bold mb-2">Total Creator</span>
                  <span className="text-3xl font-extrabold text-white">{creatorsArray.length}</span>
                </div>
                <div className="bg-[#2d2d2d] border-2 border-[#b8a492] rounded-xl p-6 flex flex-col items-center">
                  <span className="text-lg text-[#b8a492] font-bold mb-2">Total Pengajuan Payout</span>
                  <span className="text-3xl font-extrabold text-white">{payoutsArray.length}</span>
                </div>
                <div className="bg-[#2d2d2d] border-2 border-[#b8a492] rounded-xl p-6 flex flex-col items-center">
                  <span className="text-lg text-[#b8a492] font-bold mb-2">Total Payout Selesai</span>
                  <span className="text-3xl font-extrabold text-white">{payoutsArray.filter(p => p.status === 'processed').length}</span>
                </div>
              </div>
              {/* Bar Chart for Top Creators */}
              <div className="mt-10 bg-[#2d2d2d] border-2 border-[#b8a492] rounded-xl p-6">
                <canvas ref={chartRef} height={120} />
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
                          <td className="px-4 py-2 text-sm text-white">{p.username}</td>
                          <td className="px-4 py-2 text-sm text-white">{new Date(p.requestedAt).toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm text-white">{p.amount?.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })}</td>
                          <td className="px-4 py-2 text-sm font-bold">
                            {p.status === 'pending' && <span className="bg-yellow-900/30 text-yellow-200 border border-yellow-400/40 rounded px-2 py-1">Pending</span>}
                            {p.status === 'processed' && <span className="bg-green-900/30 text-green-300 border-green-400/40 rounded px-2 py-1">Selesai</span>}
                            {p.status === 'failed' && <span className="bg-red-900/30 text-red-300 border-red-400/40 rounded px-2 py-1">Gagal</span>}
                          </td>
                          <td className="px-4 py-2 text-sm text-white">{p.processedAt ? new Date(p.processedAt).toLocaleString() : '-'}</td>
                          <td className="px-4 py-2 text-sm text-white">{p.notes || '-'}</td>
                          <td className="px-4 py-2 text-sm">
                            {p.status === 'pending' && (
                              <>
                                <button className="bg-green-700 text-white px-3 py-1 rounded mr-2 cursor-pointer" onClick={() => openNotesModal(p._id, 'processed')}>Proses</button>
                                <button className="bg-red-700 text-white px-3 py-1 rounded cursor-pointer" onClick={() => openNotesModal(p._id, 'failed')}>X</button>
                                {/* Modal for input catatan payout */}
                                {showNotesModal && (
                                  <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
                                    <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 w-full max-w-md shadow-xl">
                                      <h2 className="text-xl font-extrabold text-[#b8a492] mb-2">{notesModalType === 'processed' ? 'Proses Payout' : 'Tandai Gagal Payout'}</h2>
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
        </div>
        {/* MODAL DETAIL CREATOR */}
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
