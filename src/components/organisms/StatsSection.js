"use client";

import React from 'react';
import { formatRupiah } from '@/utils/format';
import { useRouter } from 'next/navigation';

const StatsSection = ({ stats, onHistoryClick, onLeaderboardClick }) => {
  const router = useRouter();
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {/* Kartu 1: Saldo / Total Terkumpul */}
      <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-5 shadow-[4px_4px_0px_#2d2d2d] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#8c8276]">
            <span>Saldo Terkumpul</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#2d2d2d] tracking-tight">
            {formatRupiah(stats.totalAmount || 0)}
          </div>
          <p className="mt-1 text-xs text-[#696057]">
            Akumulasi total donasi yang berhasil
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-[#2d2d2d]/10">
          <button
            onClick={() => router.push('/dashboard/payout')}
            className="w-full text-center text-xs font-extrabold text-[#2d2d2d] hover:underline flex items-center justify-between cursor-pointer"
          >
            <span>Kelola Pencairan</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Kartu 2: Donasi Hari Ini */}
      <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-5 shadow-[4px_4px_0px_#2d2d2d] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#8c8276]">
            <span>Hari Ini</span>
            <span className="font-mono text-[10px] bg-[#f5e9da] px-1.5 py-0.5 rounded border border-[#2d2d2d]/20 text-[#2d2d2d] font-bold">24 Jam</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#2d2d2d] tracking-tight">
            {formatRupiah(stats.todayAmount || 0)}
          </div>
          <p className="mt-1 text-xs text-[#696057]">
            {stats.todayDonations || 0} donasi masuk sejak 00:00 WIB
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-[#2d2d2d]/10">
          <span className="text-xs font-semibold text-[#8c8276]">
            Reset otomatis tengah malam
          </span>
        </div>
      </div>

      {/* Kartu 3: Total Transaksi Donasi */}
      <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#fffdf9] p-5 shadow-[4px_4px_0px_#2d2d2d] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#8c8276]">
            <span>Total Dukungan</span>
            <span className="text-base">❤️</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-[#2d2d2d] tracking-tight">
            {stats.totalDonations || 0}
            <span className="text-sm font-bold text-[#8c8276] ml-1.5">kali</span>
          </div>
          <p className="mt-1 text-xs text-[#696057]">
            Semua dukungan dari penontonmu
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-[#2d2d2d]/10">
          <button
            onClick={() => onHistoryClick && onHistoryClick()}
            className="w-full text-center text-xs font-extrabold text-[#2d2d2d] hover:underline flex items-center justify-between cursor-pointer"
          >
            <span>Buka Riwayat Lengkap</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Kartu 4: Peringkat Donatur / Leaderboard */}
      <div className="rounded-2xl border-2 border-[#2d2d2d] bg-[#f5e9da] p-5 shadow-[4px_4px_0px_#2d2d2d] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2d2d2d]">
            <span>Top Sultan Bulan Ini</span>
            <span className="text-base">🏆</span>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-black text-[#2d2d2d] tracking-tight">
            Leaderboard
          </div>
          <p className="mt-1 text-xs text-[#5c544d]">
            Daftar donatur paling setia & loyal bulanan
          </p>
        </div>
        <div className="mt-4 pt-3 border-t border-[#2d2d2d]/15">
          <button
            onClick={() => onLeaderboardClick && onLeaderboardClick()}
            className="w-full py-2 px-3 rounded-xl border-2 border-[#2d2d2d] bg-white text-xs font-extrabold text-[#2d2d2d] shadow-[2px_2px_0px_#2d2d2d] transition hover:bg-[#fffdf9] hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-0.5 cursor-pointer text-center block"
          >
            Lihat Peringkat Donatur
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
