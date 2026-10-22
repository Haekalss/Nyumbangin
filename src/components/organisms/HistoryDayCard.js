import React from 'react';
import HistoryDonationItem from '../molecules/HistoryDonationItem';
import { formatRupiah } from '@/utils/format';

const HistoryDayCard = ({ 
  dayData, 
  className = '' 
}) => {
  return (
    <div className={`rounded-2xl bg-[#fffdf9] border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] overflow-hidden ${className}`}>
      {/* Date Header */}
      <div className="px-5 py-3.5 flex justify-between items-center border-b-2 border-[#2d2d2d] bg-[#fbf8f3]">
        <div className="flex items-center gap-3">
          <span className="font-black text-sm text-[#2d2d2d]">{dayData.date}</span>
          <span className="text-xs font-extrabold px-2 py-0.5 rounded-md border border-[#2d2d2d] bg-[#fffdf9] text-[#2d2d2d] shadow-[1px_1px_0px_#2d2d2d]">
            {dayData.count} donasi
          </span>
        </div>
        <span className="text-sm font-black text-[#2d2d2d]">
          {formatRupiah(dayData.total)}
        </span>
      </div>

      {/* Donations List */}
      <div className="divide-y-2 divide-[#2d2d2d]/10">
        {dayData.donations.map((donation, idx) => (
          <HistoryDonationItem key={donation._id || idx} donation={donation} />
        ))}
      </div>
    </div>
  );
};

export default HistoryDayCard;
