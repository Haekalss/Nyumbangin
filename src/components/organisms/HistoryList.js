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
      <div className="text-center py-16 bg-[#2d2d2d] rounded-xl border-4 border-[#b8a492]">
        <div className="text-6xl mb-4">📭</div>
        <div className="text-xl text-[#b8a492] font-bold font-mono">
          {searchQuery ? 'Tidak ada hasil pencarian' : 'Belum ada riwayat donasi'}
        </div>
        <p className="text-[#b8a492]/70 mt-2 font-mono">
          {searchQuery ? 'Coba kata kunci lain' : 'Donasi yang kamu terima akan muncul di sini'}
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {data.map((day, idx) => (
          <HistoryDayCard key={idx} dayData={day} />
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-[#b8a492]/60 text-sm font-mono">
        Menampilkan {totalDonations} donasi dari {data.length} hari
      </div>
    </div>
  );
};

export default HistoryList;
