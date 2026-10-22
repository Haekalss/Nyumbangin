"use client";

import React from 'react';
import { formatRupiah } from '@/utils/format';
import Modal from '../atoms/Modal';

const LeaderboardModal = ({ onClose, leaderboardData = [] }) => {
  const totalAmount = leaderboardData.reduce((sum, donor) => sum + donor.totalAmount, 0);

  const getRankBadge = (rank) => {
    if (rank === 0) return 'bg-amber-300 text-[#2d2d2d] border-[#2d2d2d]';
    if (rank === 1) return 'bg-gray-200 text-[#2d2d2d] border-[#2d2d2d]';
    if (rank === 2) return 'bg-amber-600 text-white border-[#2d2d2d]';
    return 'bg-white text-[#2d2d2d] border-[#2d2d2d]';
  };

  const getRankText = (rank) => {
    return `#${rank + 1}`;
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Top Donatur Bulan Ini" maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Subtitle Summary Card */}
        <div className="rounded-xl border-2 border-[#2d2d2d] bg-[#f5e9da] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[2px_2px_0px_#2d2d2d]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#696057]">
              Total Saweran Sultan Bulan Ini
            </span>
            <div className="text-2xl font-black text-[#2d2d2d]">
              {formatRupiah(totalAmount)}
            </div>
          </div>
          <div className="rounded-lg bg-white border border-[#2d2d2d]/20 px-3 py-1.5 text-xs font-bold text-[#2d2d2d]">
            {leaderboardData.length} Donatur Teratas
          </div>
        </div>

        {/* List of Donors */}
        {leaderboardData.length === 0 ? (
          <div className="py-12 text-center rounded-2xl border-2 border-dashed border-[#2d2d2d]/30 bg-[#fffdf9]">
            <div className="w-12 h-12 rounded-xl bg-[#f5e9da] border-2 border-[#2d2d2d] flex items-center justify-center mx-auto mb-2 shadow-[2px_2px_0px_#2d2d2d]">
              <svg className="w-6 h-6 text-[#2d2d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <p className="mt-2 text-sm font-bold text-[#2d2d2d]">Belum ada donasi bulan ini</p>
            <p className="mt-1 text-xs text-[#696057]">
              Dukungan pertamamu akan memuncaki papan peringkat kreator!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboardData.map((donor, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3.5 rounded-xl border-2 border-[#2d2d2d] bg-white transition hover:bg-[#fffdf9] shadow-[2px_2px_0px_#2d2d2d] ${
                  idx === 0 ? 'bg-amber-50/60' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center font-black text-xs shrink-0 shadow-[1px_1px_0px_#2d2d2d] ${getRankBadge(
                      idx
                    )}`}
                  >
                    {getRankText(idx)}
                  </div>
                  <div>
                    <div className="font-extrabold text-[#2d2d2d] text-sm">
                      {donor.name}
                    </div>
                    <div className="text-xs text-[#696057]">
                      {donor.donationCount} kali donasi
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-sm text-[#2d2d2d]">
                    {formatRupiah(donor.totalAmount)}
                  </div>
                  {idx === 0 && (
                    <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">
                      Peringkat Teratas
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default LeaderboardModal;
