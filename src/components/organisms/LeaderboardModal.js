import React from 'react';

const LeaderboardModal = ({ onClose, leaderboardData }) => {
  return (
    <div className="fixed inset-1 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 max-w-5xl w-full max-h-full overflow-hidden shadow-xl relative">
        <h3 className="text-2xl font-extrabold text-[#b8a492] mb-4 font-mono text-center">Leaderboard</h3>
        <button
          className="absolute top-3 right-3 px-3 py-1 rounded border-2 border-[#b8a492] bg-[#b8a492] text-[#2d2d2d] font-bold font-mono hover:bg-[#d6c6b9] transition-all"
          onClick={onClose}
        >
          Tutup
        </button>

        <div className="text-center text-[#b8a492] font-mono mb-6 text-sm">
          Sultan bulan ini
        </div>

        <div>
          {leaderboardData.length === 0 ? (
            <div className="text-[#b8a492] text-center font-mono py-8">
              Belum ada donasi bulan ini
            </div>
          ) : (
            <div className="bg-[#b8a492]/20 border-2 border-[#b8a492] rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="font-bold text-[#b8a492] font-mono text-lg">Top Donatur</div>
                <div className="text-[#b8a492] font-mono text-sm">
                  Total: {leaderboardData.reduce((sum, donor) => sum + donor.totalAmount, 0).toLocaleString('id-ID')} • {leaderboardData.length} donatur
                </div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;
