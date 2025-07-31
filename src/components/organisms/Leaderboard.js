import React from 'react';
import Text from '../atoms/Text';

const Leaderboard = ({ leaderboardData }) => {
  if (!leaderboardData || leaderboardData.length === 0) {
    return (
      <div className="text-center py-8 text-[#b8a492] font-mono">
        Belum ada donasi bulan ini
      </div>
    );
  }

  return (
    <div className="bg-[#b8a492]/20 border-2 border-[#b8a492] rounded-md p-4">
      <div className="flex justify-between items-center mb-3">
        <Text variant="h4" weight="bold" color="primary">Top Donatur</Text>
        <Text variant="small" color="primary">
          Total: {leaderboardData.reduce((sum, donor) => sum + donor.totalAmount, 0).toLocaleString('id-ID')} • {leaderboardData.length} donatur
        </Text>
      </div>
      <div className="space-y-1">
        {leaderboardData.map((donor, idx) => (
          <div key={idx} className="text-sm text-[#b8a492] font-mono flex justify-between items-center py-1">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-[#b8a492] text-[#2d2d2d] rounded-full flex items-center justify-center font-bold text-xs">
                {idx + 1}
              </span>
              <span>{donor.name}</span>
            </div>
            <span>Rp {donor.totalAmount.toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
