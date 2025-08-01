import React from 'react';

const HistoryModal = ({ 
  onClose, 
  historyData, 
  selectedDate, 
  onDateFilterChange 
}) => {
  return (
    <div className="fixed inset-1 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 max-w-5xl w-full max-h-full overflow-hidden shadow-xl relative">
        <h3 className="text-2xl font-extrabold text-[#b8a492] mb-4 font-mono text-center">Riwayat Donasi Harian</h3>
        <button
          className="absolute top-3 right-3 px-3 py-1 rounded border-2 border-[#b8a492] bg-[#b8a492] text-[#2d2d2d] font-bold font-mono hover:bg-[#d6c6b9] transition-all"
          onClick={onClose}
        >
          Tutup
        </button>

        <div className="mt-4 mb-6">
          <label className="block text-sm font-bold text-[#b8a492] font-mono mb-2">
            Filter berdasarkan tanggal:
          </label>
          <select
            value={selectedDate}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="w-full px-3 py-2 border-2 border-[#b8a492] bg-[#2d2d2d] text-[#b8a492] font-mono rounded-md focus:outline-none focus:ring-[#b8a492] focus:border-[#b8a492]"
          >
            <option value="">Semua tanggal</option>
            {historyData.map((day, idx) => (
              <option key={idx} value={day.date}>
                {day.date} - Rp {day.total.toLocaleString('id-ID')} ({day.count} donasi)
              </option>
            ))}
          </select>
        </div>

        <div className="max-h-[calc(100vh-12rem)] overflow-y-auto flex flex-col gap-4 mt-4">
          {historyData.length === 0 ? (
            <div className="text-[#b8a492] text-center font-mono">
              {selectedDate ? 'Tidak ada donasi pada tanggal tersebut' : 'Memuat data...'}
            </div>
          ) : (
            historyData.map((day, idx) => (
              <div key={idx} className="bg-[#b8a492]/20 border-2 border-[#b8a492] rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-bold text-[#b8a492] font-mono text-lg">{day.date}</div>
                  <div className="text-[#b8a492] font-mono">
                    <span className="font-bold">Rp {day.total.toLocaleString('id-ID')}</span> ({day.count} donasi)
                  </div>
                </div>
                <div className="space-y-1">
                  {day.donations.map((donation, i) => (
                    <div key={i} className="text-sm text-[#b8a492] font-mono flex justify-between">
                      <span>{donation.name}</span>
                      <span>Rp {donation.amount.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
