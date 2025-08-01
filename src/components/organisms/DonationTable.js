import React from 'react';

const DonationTable = ({ donations, onDelete, onPreviewNotification }) => {
  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-12 text-[#b8a492] font-mono">
        Belum ada donasi hari ini
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-[#b8a492]/20">
      <thead className="bg-[#2d2d2d]">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Donatur</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Jumlah</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Status</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Tanggal</th>
          <th className="px-6 py-3 text-left text-xs font-bold text-[#b8a492] uppercase tracking-wider font-mono">Aksi</th>
        </tr>
      </thead>
      <tbody className="bg-[#2d2d2d] divide-y divide-[#b8a492]/10">
        {donations.map((donation) => (
          <tr
            key={donation._id}
            className="hover:bg-[#d6c6b9]/20 transition-all cursor-pointer"
            onClick={() => onPreviewNotification(donation)}
          >
            <td className="px-6 py-4 whitespace-nowrap">
              <div>
                <div className="text-sm font-bold text-[#b8a492] font-mono">{donation.name}</div>
                <div className="text-sm text-[#b8a492] font-mono truncate">{donation.message || 'Tidak ada pesan'}</div>
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-bold text-[#b8a492] font-mono">Rp {donation.amount.toLocaleString('id-ID')}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="text-xs font-bold rounded-full px-2 py-1 bg-[#b8a492]/20 text-[#2d2d2d] border-2 border-[#b8a492] font-mono">PAID</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-[#b8a492] font-mono">
              {new Date(donation.createdAt).toLocaleDateString('id-ID')}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(donation._id);
                }}
                className="text-[#b8a492] hover:text-[#2d2d2d] transition-all font-mono"
              >
                Hapus
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DonationTable;
