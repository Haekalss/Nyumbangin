import React from 'react';
import { formatRupiah } from '@/utils/format';
import Modal from '../atoms/Modal';
import Button from '../atoms/Button';

const HistoryModal = ({ 
  onClose, 
  historyData, 
  selectedDate, 
  onDateFilterChange 
}) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Riwayat Donasi Harian" maxWidth="max-w-5xl">
      <div className="mt-2 mb-4">
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
              {day.date} - {formatRupiah(day.total)} ({day.count} donasi)
            </option>
          ))}
        </select>
      </div>
      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto flex flex-col gap-4 mt-2">
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
                  <span className="font-bold">{formatRupiah(day.total)}</span> ({day.count} donasi)
                </div>
              </div>
              <div className="space-y-1">
                {day.donations.map((donation, i) => (
                  <div key={i} className="text-sm text-[#b8a492] font-mono flex justify-between">
                    <span>{donation.name}</span>
                    <span>{formatRupiah(donation.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="secondary" onClick={onClose}>Tutup</Button>
      </div>
    </Modal>
  );
};

export default HistoryModal;
