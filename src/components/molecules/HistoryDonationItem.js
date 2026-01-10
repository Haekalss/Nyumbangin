import React from 'react';
import Avatar from '../atoms/Avatar';
import { formatRupiah } from '@/utils/format';

const HistoryDonationItem = ({ 
  donation, 
  className = '' 
}) => {
  const formattedTime = new Date(donation.createdAt).toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const isMediaShare = donation.mediaShareRequest?.enabled;

  return (
    <div className={`bg-[#2d2d2d] ${className} h-full`}>
      <div className="flex items-center h-full gap-4 px-4 py-3 hover:bg-[#b8a492]/8 transition-colors">
        {/* Avatar */}
        <Avatar name={donation.name} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center gap-3">
            <div className="min-w-0">
              <div className="truncate font-bold text-[#b8a492] text-base font-mono">
                {donation.name}
              </div>
              <div className="text-xs text-[#b8a492]/60 mt-0.5 font-mono">
                {formattedTime}
              </div>
            </div>

            <div className="flex flex-col items-end flex-shrink-0 ml-4">
              <div className="mb-1">
                {isMediaShare ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    🎬 Media Share
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f5e9da] text-[#2d2d2d] border border-[#d6c6b9]">
                    💰 Donasi
                  </span>
                )}
              </div>
              <div className="font-extrabold text-[#b8a492] text-base font-mono">
                {formatRupiah(donation.amount)}
              </div>
            </div>
          </div>

          {donation.message ? (
            <div className="mt-2 text-sm text-[#b8a492] font-mono">
              💬 {donation.message}
            </div>
          ) : (
            <div className="mt-2 text-sm text-[#b8a492]/50 font-mono italic">
              — Tanpa pesan —
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDonationItem;
