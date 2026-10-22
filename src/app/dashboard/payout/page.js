"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSessionManager } from '@/utils/sessionManager';
import { formatRupiah } from '@/utils/format';
import CreatorAppLayout from '@/components/dashboard/CreatorAppLayout';
import Link from 'next/link';

export default function PayoutPage() {
  const [payouts, setPayouts] = useState([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);
  const [payoutError, setPayoutError] = useState('');
  const [stats, setStats] = useState(null);
  const router = useRouter();
  const { startMonitoring, stopMonitoring } = useSessionManager();
  const [user, setUser] = useState(null);

  // Platform fee 5%
  const PLATFORM_FEE_PERCENTAGE = 5;

  const calculateAvailableBalance = () => {
    const totalPaid = stats?.paidAmount || 0;
    const platformFee = Math.floor(totalPaid * (PLATFORM_FEE_PERCENTAGE / 100));
    const afterFee = totalPaid - platformFee;
    return Math.max(0, afterFee);
  };

  const calculatePlatformFee = () => {
    const totalPaid = stats?.paidAmount || 0;
    return Math.floor(totalPaid * (PLATFORM_FEE_PERCENTAGE / 100));
  };

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
        if (!token) return;
        
        const res = await axios.get('/api/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.stats || {});
      } catch (e) {
        if (e.response?.status !== 401) {
          console.error('Error fetching stats:', e);
        }
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch payout history
  useEffect(() => {
    if (!user) return;
    
    const fetchPayouts = async () => {
      setPayoutLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const endpoint = user.userType === 'admin' 
          ? '/api/admin/payouts' 
          : '/api/creator/payouts';
          
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayouts(res.data.data || []);
      } catch (e) {
        if (e.response?.status !== 401) {
          console.error('Error fetching payouts:', e);
          setPayoutError('Gagal memuat riwayat pencairan');
        }
      } finally {
        setPayoutLoading(false);
      }
    };
    
    fetchPayouts();
    const interval = setInterval(fetchPayouts, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Request payout manual
  const handleRequestPayout = async () => {
    const available = calculateAvailableBalance();
    if (available < 10000) {
      toast.error('Minimal penarikan dana adalah Rp10.000');
      return;
    }

    setRequestingPayout(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/creator/request-payout', 
        { username: user?.username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Permintaan pencairan dana berhasil diajukan!');
      
      const endpoint = user.userType === 'admin' 
        ? '/api/admin/payouts' 
        : '/api/creator/payouts';
        
      const payoutRes = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayouts(payoutRes.data.data || []);
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Gagal mengajukan pencairan');
    } finally {
      setRequestingPayout(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f4f0]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2d2d2d] border-t-transparent mx-auto mb-3"></div>
          <p className="text-xs font-medium text-[#8c8276]">Memuat pencairan...</p>
        </div>
      </div>
    );
  }

  const availableBalance = calculateAvailableBalance();
  const platformFee = calculatePlatformFee();
  const totalPaid = stats?.paidAmount || 0;

  return (
    <CreatorAppLayout user={user}>
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#8f857b] mb-1">
          <Link href="/dashboard" className="hover:text-[#2d2d2d] transition">Dashboard</Link>
          <span>/</span>
          <span className="text-[#2d2d2d] font-extrabold">Pencairan</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#2d2d2d] tracking-tight">Pencairan Dana</h1>
        <p className="text-sm font-medium text-[#696057] mt-0.5">Tarik saldo donasi ke rekening terdaftar.</p>
      </div>

      {/* Balance + Account Info */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Balance Card */}
        <div className="lg:col-span-3 rounded-2xl bg-[#2d2d2d] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#b8a492] text-white p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#b8a492] mb-1">Saldo Bersih Siap Tarik</p>
            <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {formatRupiah(availableBalance)}
            </div>

            {/* Breakdown */}
            <div className="mt-6 pt-4 border-t-2 border-white/10 grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-white/50 block">Total Masuk</span>
                <span className="text-sm font-black text-white/90">{formatRupiah(totalPaid)}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-white/50 block">Biaya Platform (5%)</span>
                <span className="text-sm font-black text-white/90">- {formatRupiah(platformFee)}</span>
              </div>
            </div>
          </div>

          {/* Withdraw Action */}
          <div className="mt-6 pt-4 border-t-2 border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {user?.isPayoutReady && (
              <div className="text-xs font-medium text-white/60">
                <span className="block font-bold">Rekening Tujuan:</span>
                <span className="text-white font-mono font-bold">{user.payoutBank} - {user.payoutAccountNumber}</span>
              </div>
            )}
            <button
              type="button"
              onClick={handleRequestPayout}
              disabled={requestingPayout || availableBalance < 10000 || !user?.isPayoutReady}
              className="px-6 py-2.5 rounded-xl border-2 border-[#2d2d2d] bg-[#b8a492] text-[#2d2d2d] text-sm font-extrabold shadow-[2px_2px_0px_#2d2d2d] hover:bg-[#cabaa9] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 active:translate-y-0.5"
            >
              {requestingPayout ? 'Memproses...' : 'Tarik Dana'}
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="lg:col-span-2 rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b] mb-3">Rekening Penerima</p>

            {user?.isPayoutReady ? (
              <div className="space-y-3 bg-[#fbf8f3] border-2 border-[#2d2d2d] rounded-xl p-4 shadow-[2px_2px_0px_#2d2d2d]">
                <div className="flex items-center justify-between border-b border-[#2d2d2d]/10 pb-2">
                  <span className="text-xs font-extrabold text-[#2d2d2d]">Status: Aktif</span>
                  <Link
                    href="/dashboard/profile?section=payout"
                    className="text-xs font-bold text-[#2d2d2d] hover:underline"
                  >
                    Detail Profil &rarr;
                  </Link>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#8f857b] block">Bank / E-Wallet</span>
                  <span className="text-base font-black text-[#2d2d2d]">{user?.payoutBank || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#8f857b] block">Nomor Rekening</span>
                  <span className="text-base font-mono font-black text-[#2d2d2d]">{user?.payoutAccountNumber || '-'}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#8f857b] block">Nama Pemilik</span>
                  <span className="text-sm font-extrabold text-[#2d2d2d]">{user?.payoutAccountName || '-'}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border-2 border-[#2d2d2d] bg-amber-100 text-xs font-bold text-amber-900 shadow-[2px_2px_0px_#2d2d2d] space-y-2">
                <p className="font-extrabold text-sm">Belum ada rekening</p>
                <p className="text-amber-800">Lengkapi rekening di Pengaturan Profil agar bisa mencairkan saldo saweran.</p>
                <Link
                  href="/dashboard/profile?section=payout"
                  className="inline-block mt-1 px-3.5 py-1.5 rounded-lg border-2 border-[#2d2d2d] bg-[#2d2d2d] text-white text-xs font-extrabold shadow-[2px_2px_0px_#b8a492] hover:bg-black transition active:translate-y-0.5"
                >
                  Lengkapi Rekening &rarr;
                </Link>
              </div>
            )}
          </div>

          <p className="mt-4 pt-3 border-t-2 border-[#2d2d2d]/10 text-xs font-bold text-[#8f857b]">
            Proses 1x24 jam hari kerja. Min. penarikan Rp10.000.
          </p>
        </div>
      </div>

      {/* Payout History */}
      <div className="rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b-2 border-[#2d2d2d] bg-[#fbf8f3] flex items-center justify-between">
          <div>
            <h3 className="font-black text-base text-[#2d2d2d]">Riwayat Pencairan</h3>
            <p className="text-xs font-medium text-[#696057] mt-0.5">Seluruh pengajuan penarikan saldo</p>
          </div>
          <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg border border-[#2d2d2d] bg-[#fffdf9] text-[#2d2d2d] shadow-[1px_1px_0px_#2d2d2d]">
            {payouts.length} pengajuan
          </span>
        </div>

        {payoutError && (
          <div className="m-4 rounded-xl border-2 border-red-500 bg-red-100 p-3 text-xs font-bold text-red-900 shadow-[2px_2px_0px_#dc2626]">
            {payoutError}
          </div>
        )}

        {payoutLoading ? (
          <div className="p-12 text-center text-xs font-bold text-[#8f857b]">
            Memuat riwayat...
          </div>
        ) : payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-[#2d2d2d] bg-[#fbf8f3] text-xs font-black text-[#2d2d2d]">
                  <th className="px-5 py-3.5">ID & Waktu</th>
                  <th className="px-5 py-3.5">Nominal</th>
                  <th className="px-5 py-3.5">Tujuan</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#2d2d2d]/10 text-sm">
                {payouts.map((p) => {
                  const isSuccess = p.status === 'SUCCESS' || p.status === 'COMPLETED';
                  const isPending = p.status === 'PENDING';
                  const isProcessing = p.status === 'PROCESSING';

                  return (
                    <tr key={p._id} className="hover:bg-[#fbf8f3] transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs font-bold text-[#2d2d2d]">
                          #{p._id?.slice(-8) || '-'}
                        </div>
                        <div className="text-xs font-medium text-[#8f857b] mt-0.5">
                          {new Date(p.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-black text-base text-[#2d2d2d]">
                        {formatRupiah(p.amount || 0)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-xs font-extrabold text-[#2d2d2d]">
                          {p.bankName || p.bank || '-'}
                        </div>
                        <div className="text-xs font-mono font-medium text-[#696057]">
                          {p.accountNumber} a.n {p.accountName}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {isSuccess ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold border border-[#2d2d2d] bg-emerald-100 text-emerald-900 shadow-[1px_1px_0px_#2d2d2d]">
                            Berhasil
                          </span>
                        ) : isProcessing ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold border border-[#2d2d2d] bg-blue-100 text-blue-900 shadow-[1px_1px_0px_#2d2d2d]">
                            Diproses
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold border border-[#2d2d2d] bg-amber-100 text-amber-900 shadow-[1px_1px_0px_#2d2d2d]">
                            Menunggu
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-extrabold border border-[#2d2d2d] bg-red-100 text-red-900 shadow-[1px_1px_0px_#2d2d2d]">
                            {p.status || 'Ditolak'}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-[#8f857b] italic">
                        {p.notes || p.adminNotes || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs font-bold text-[#8f857b]">
            Belum ada riwayat penarikan dana.
          </div>
        )}
      </div>
    </CreatorAppLayout>
  );
}