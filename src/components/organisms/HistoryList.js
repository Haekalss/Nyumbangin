import React from 'react';
import HistoryDayCard from './HistoryDayCard';

const HistoryList = ({ 
  data, 
  searchQuery = '',
  totalDonations = 0,
  className = '' 
}) => {
  if (data.length === 0) {
    return (
      <div className="text-center py-16 bg-[#fffdf9] rounded-2xl border-2 border-[#2d2d2d] shadow-[4px_4px_0px_#2d2d2d] p-8">
        <img
          src="/Logo2.png"
          alt="Maskot Nyumbangin"
          className="h-16 w-16 object-contain select-none opacity-60 mx-auto mb-3"
        />
        <div className="text-sm text-[#2d2d2d] font-black">
          {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada riwayat donasi'}
        </div>
        <p className="text-xs font-medium text-[#696057] mt-1 max-w-sm mx-auto">
          {searchQuery 
            ? 'Coba gunakan kata kunci pencarian yang berbeda.' 
            : 'Donasi yang berhasil masuk akan tercatat dan dikelompokkan per hari di sini.'}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-5">
        {data.map((day, idx) => (
          <HistoryDayCard key={idx} dayData={day} />
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
