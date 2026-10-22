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
    <div className={`px-5 py-4 hover:bg-[#fbf8f3] transition-colors ${className}`}>
      <div className="flex items-start gap-3.5">
        <Avatar name={donation.name} size="md" />

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="font-extrabold text-sm text-[#2d2d2d] truncate">{donation.name}</span>
              <span className="text-xs font-mono font-bold text-[#8f857b]">{formattedTime}</span>
              {isMediaShare && (
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md border border-[#2d2d2d] bg-purple-100 text-purple-900 shadow-[1px_1px_0px_#2d2d2d]">
                  Media Share
                </span>
              )}
            </div>
            <span className="text-base font-black text-[#2d2d2d] shrink-0">
              {formatRupiah(donation.amount)}
            </span>
          </div>

          {donation.message ? (
            <p className="mt-2 text-sm font-medium text-[#2d2d2d] break-words bg-[#fbf8f3] p-2.5 rounded-xl border border-[#2d2d2d]/20">
              {donation.message}
            </p>
          ) : (
            <p className="mt-1 text-xs text-[#8f857b] italic">Tanpa pesan</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryDonationItem;
