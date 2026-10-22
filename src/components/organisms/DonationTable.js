"use client";

import React from 'react';
import { formatRupiah } from '@/utils/format';

const DonationTable = ({ donations, onDelete, onPreviewNotification }) => {
  if (!donations || donations.length === 0) {
    return null;
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-[#2d2d2d] bg-[#f5e9da]/60 text-xs font-bold uppercase tracking-wider text-[#2d2d2d]">
            <th className="px-5 py-3.5">Donatur & Pesan</th>
            <th className="px-5 py-3.5">Nominal</th>
            <th className="px-5 py-3.5">Tipe</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5">Waktu</th>
            <th className="px-5 py-3.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y border-b border-[#2d2d2d]/15">
          {donations.map((donation) => {
            const isPending = donation.status === 'PENDING';
            const isMediaShare = donation.mediaShareRequest?.enabled;
            
            return (
              <tr
                key={donation._id}
                className={`transition-colors ${
                  isPending 
                    ? 'opacity-60 bg-gray-50' 
                    : 'hover:bg-[#f5e9da]/30 cursor-pointer'
                }`}
                onClick={() => !isPending && onPreviewNotification && onPreviewNotification(donation)}
                title={!isPending ? "Klik untuk uji tayang notifikasi ke overlay" : undefined}
              >
                {/* Donatur & Pesan */}
                <td className="px-5 py-4">
                  <div className="font-extrabold text-[#2d2d2d] text-sm flex items-center gap-2">
                    <span>{donation.name || 'Anonim'}</span>
                    {!isPending && (
                      <span className="text-[10px] bg-white border border-[#2d2d2d]/20 px-1.5 py-0.5 rounded text-[#696057] font-normal hidden sm:inline">
                        Klik tes ↗
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-[#5c544d] max-w-sm sm:max-w-md break-words italic line-clamp-2">
                    {donation.message ? `"${donation.message}"` : <span className="not-italic text-[#8c8276]">Tanpa pesan</span>}
                  </div>
                </td>

                {/* Nominal */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <div className="text-sm font-black text-[#2d2d2d]">
                    {formatRupiah(donation.amount)}
                  </div>
                </td>

                {/* Tipe */}
                <td className="px-5 py-4 whitespace-nowrap">
                  {isMediaShare ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-300">
                      <span>🎬</span> Media Share
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#f5e9da] text-[#2d2d2d] border border-[#2d2d2d]/20">
                      <span>💰</span> Saweran
                    </span>
                  )}
                </td>

                {/* Status */}
                <td className="px-5 py-4 whitespace-nowrap">
                  {donation.status === 'PAID' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> Berhasil
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span> Menunggu
                    </span>
                  )}
                </td>

                {/* Waktu */}
                <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold text-[#696057]">
                  {new Date(donation.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                </td>

                {/* Aksi */}
                <td className="px-5 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {!isPending && (
                      <button
                        onClick={() => onPreviewNotification && onPreviewNotification(donation)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#2d2d2d] bg-white text-[#2d2d2d] hover:bg-[#fbf8f3] shadow-[1px_1px_0px_#2d2d2d] transition cursor-pointer"
                        title="Tes notifikasi overlay"
                      >
                        Tes Overlay
                      </button>
                    )}
                    <button
                      onClick={() => onDelete && onDelete(donation._id)}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition cursor-pointer"
                      title="Hapus riwayat donasi ini"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DonationTable;
