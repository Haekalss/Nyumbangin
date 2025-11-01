"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useSessionManager } from '@/utils/sessionManager';
import { formatRupiah } from '@/utils/format';

export default function PayoutPage() {
  const [payouts, setPayouts] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState('');
  const [totalPayoutProcessed, setTotalPayoutProcessed] = useState(0);
  const [stats, setStats] = useState(null);
  const router = useRouter();
  const { startMonitoring, stopMonitoring, logout } = useSessionManager();
  const [user, setUser] = useState(null);

  // Check auth and fetch user
  useEffect(() => {
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
    checkAuth();
  }, [router]);

  // Start monitoring when user is set
  useEffect(() => {
    if (user) {
      startMonitoring();
    }
    return () => stopMonitoring();
  }, [user, startMonitoring, stopMonitoring]);

  // Fetch stats for saldo calculation
  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.stats || {});
      } catch (e) {
        console.error('Error fetching stats:', e);
      }
    };
    fetchStats();
  }, [user]);

  // Fetch payout history & total processed
  useEffect(() => {
    if (!user) return;
    
    const fetchPayouts = async () => {
      setPayoutLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Use different endpoint based on user type
        const endpoint = user.userType === 'admin' 
          ? '/api/admin/payouts' 
          : '/api/creator/payouts';
          
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allPayouts = res.data.data || [];
        setPayouts(allPayouts);
        
        // Hitung total payout processed untuk creator
        if (user.userType === 'creator') {
          const processed = allPayouts
            .filter(p => p.status === 'PROCESSED')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
          setTotalPayoutProcessed(processed);
        }
      } catch (e) {
        console.error('Error fetching payouts:', e);
        if (e.response?.status === 403) {
          setPayoutError('Akses ditolak - Silakan login ulang');
        } else {
          setPayoutError('Gagal memuat riwayat pencairan');
        }
      } finally {
        setPayoutLoading(false);
      }
    };
    
    fetchPayouts();
  }, [user]);

  // Request payout manual
  const handleRequestPayout = async () => {
    setRequestingPayout(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('/api/creator/request-payout', 
        { username: user?.username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Permintaan pencairan berhasil!');
      
      // Refresh payouts after request
      const endpoint = user.userType === 'admin' 
        ? '/api/admin/payouts' 
        : '/api/creator/payouts';
        
      const payoutRes = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allPayouts = payoutRes.data.data || [];
      setPayouts(allPayouts);
      
      if (user.userType === 'creator') {
        const processed = allPayouts
          .filter(p => p.status === 'PROCESSED')
          .reduce((sum, p) => sum + (p.amount || 0), 0);
        setTotalPayoutProcessed(processed);
      }
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Gagal request pencairan');
    } finally {
      setRequestingPayout(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b8a492]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5e9da] via-[#d6c6b9] to-[#b8a492] font-mono">
      <Toaster position="top-right" />
      
      {/* Simple Header - tanpa navigation buttons */}
      <header className="bg-[#2d2d2d] border-b-4 border-[#b8a492] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <img src="/logo.png" alt="Nyumbangin Logo" className="w-16 h-16" />
              <div>
                <h1 className="text-4xl font-extrabold text-[#b8a492] tracking-wide font-mono">Nyumbangin - Payout</h1>
                <p className="text-[#b8a492] text-lg mt-2 font-mono">Kelola Pencairan Dana</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 text-base font-bold font-mono transition-all rounded-lg border-2 bg-transparent text-[#b8a492] border-[#b8a492] hover:bg-[#b8a492]/10"
              >
                ← Kembali
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <section className="bg-[#2d2d2d] border-4 border-[#b8a492] sm:rounded-xl mb-8 p-6">
          <h2 className="text-xl font-bold text-[#b8a492] mb-2">Saldo & Pencairan Dana</h2>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <div className="text-sm text-[#b8a492]">Saldo Terkumpul</div>
              <div className="text-2xl font-bold text-white mb-2">{formatRupiah(stats?.paidAmount || 0)}</div>
              <div className="text-sm text-[#b8a492] mt-2">Saldo Siap Cair</div>
              <div className="text-3xl font-extrabold text-white">{formatRupiah((stats?.paidAmount || 0) - totalPayoutProcessed)}</div>
            </div>
            <button
              className="bg-[#b8a492] text-[#2d2d2d] px-6 py-2 rounded-lg font-bold border-2 border-[#b8a492] hover:bg-[#d6c6b9] transition-all disabled:opacity-50"
              disabled={requestingPayout || (((stats?.paidAmount || 0) - totalPayoutProcessed) < 50000) || payouts.some(p => p.status === 'PENDING')}
              onClick={handleRequestPayout}
            >
              {requestingPayout ? 'Memproses...' : 'Ajukan Pencairan'}
            </button>
          </div>
          <div className="text-xs text-[#b8a492] mb-2">Jika tidak mengajukan, dana akan otomatis dicairkan setiap minggu.</div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#b8a492]/20">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Tanggal Request</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Nominal</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Tanggal Proses</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-[#b8a492] uppercase">Catatan</th>
                </tr>
              </thead>
              <tbody>
                {payoutLoading ? (
                  <tr><td colSpan={5} className="text-center py-6 text-[#b8a492]">Memuat...</td></tr>
                ) : payouts.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-6 text-[#b8a492]">Belum ada riwayat pencairan</td></tr>
                ) : (
                  payouts.map(p => (
                    <tr key={p._id}>
                      <td className="px-4 py-2 text-sm text-white">{new Date(p.requestedAt).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-2 text-sm text-white">{formatRupiah(p.amount)}</td>
                      <td className="px-4 py-2 text-sm font-bold">
                        {p.status === 'PENDING' && <span className="bg-yellow-900/30 text-yellow-200 border border-yellow-400/40 rounded px-2 py-1">Pending</span>}
                        {p.status === 'APPROVED' && <span className="bg-blue-900/30 text-blue-300 border border-blue-400/40 rounded px-2 py-1">Disetujui</span>}
                        {p.status === 'PROCESSED' && <span className="bg-green-900/30 text-green-300 border border-green-400/40 rounded px-2 py-1">Selesai</span>}
                        {p.status === 'REJECTED' && <span className="bg-red-900/30 text-red-300 border border-red-400/40 rounded px-2 py-1">Ditolak</span>}
                      </td>
                      <td className="px-4 py-2 text-sm text-white">{p.processedAt ? new Date(p.processedAt).toLocaleString('id-ID') : '-'}</td>
                      <td className="px-4 py-2 text-sm text-white">{p.adminNote || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {payoutError && <div className="text-red-500 mt-2 text-sm">{payoutError}</div>}
        </section>
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