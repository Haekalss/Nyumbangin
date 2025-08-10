import React from 'react';
import { formatRupiah } from '@/utils/format';
import Modal from '../atoms/Modal';
import Button from '../atoms/Button';

const LeaderboardModal = ({ onClose, leaderboardData }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Leaderboard" maxWidth="max-w-5xl">
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
                Total: {formatRupiah(leaderboardData.reduce((sum, donor) => sum + donor.totalAmount, 0))} • {leaderboardData.length} donatur
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
                  <span>{formatRupiah(donor.totalAmount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="secondary" onClick={onClose}>Tutup</Button>
      </div>
    </Modal>
  );
};

export default LeaderboardModal;
