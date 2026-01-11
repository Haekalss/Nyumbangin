import React from 'react';
import { formatRupiah } from '@/utils/format';
import StatsCard from '../molecules/StatsCard';
import ActionCard from '../molecules/ActionCard';

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
  value={formatRupiah(stats.totalAmount || 0)}
        icon="Rp"
      />
      
      <ActionCard
        title="Riwayat Harian"
        subtitle="Klik untuk lihat"
        icon="📊"
        gradientClass="bg-gradient-to-br from-[#333399] to-[#00fff7]"
        onClick={() => { onHistoryClick(); }}
      />
      
      <ActionCard
        title="Leaderboard Bulanan"
        subtitle="Klik untuk lihat"
        icon="🏆"
        gradientClass="bg-gradient-to-br from-[#ff00cc] to-[#333399]"
        onClick={() => { onLeaderboardClick(); }}
      />
    </div>
  );
};

export default StatsSection;
