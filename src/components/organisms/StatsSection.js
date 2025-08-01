import React from 'react';
import StatsCard from '../molecules/StatsCard';

const StatsSection = ({ stats, onHistoryClick, onLeaderboardClick }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <StatsCard 
        title="Total Donasi"
        value={stats.totalDonations || 0}
        icon="#"
      />
      
      <StatsCard 
        title="Total Terkumpul"
        value={`Rp ${(stats.totalAmount || 0).toLocaleString('id-ID')}`}
        icon="Rp"
      />
      
      <div 
        className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl cursor-pointer hover:bg-[#b8a492]/10 transition-all"
        onClick={() => {
          onHistoryClick();
        }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#333399] to-[#00fff7] rounded-full flex items-center justify-center shadow-neon">
                <span className="text-[#181818] text-xl font-extrabold">📊</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="text-sm font-medium text-[#b8a492] truncate font-mono">
                Riwayat Harian
              </div>
              <div className="text-xl font-bold text-[#b8a492] font-mono">
                Klik untuk lihat
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div 
        className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl cursor-pointer hover:bg-[#b8a492]/10 transition-all"
        onClick={() => {
          onLeaderboardClick();
        }}
      >
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-[#ff00cc] to-[#333399] rounded-full flex items-center justify-center shadow-neon">
                <span className="text-[#181818] text-xl font-extrabold">🏆</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="text-sm font-medium text-[#b8a492] truncate font-mono">
                Leaderboard Bulanan
              </div>
              <div className="text-xl font-bold text-[#b8a492] font-mono">
                Klik untuk lihat
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
