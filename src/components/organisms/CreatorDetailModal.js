import React from "react";

export default function CreatorDetailModal({ creator, onClose }) {
  if (!creator) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 cursor-default"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 w-full max-w-md max-h-full overflow-hidden shadow-xl relative font-mono"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-2xl font-extrabold text-[#b8a492] mb-2 font-mono text-center">Detail Creator</h3>
        <button
          onClick={onClose}
          aria-label="Tutup modal"
          className="absolute top-3 right-3 text-3xl text-[#b8a492] hover:text-[#d6c6b9] font-bold font-mono cursor-pointer bg-transparent border-none p-0 m-0 leading-none"
          style={{ background: 'none', border: 'none' }}
        >
          &times;
        </button>
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 mt-4 space-y-3">
          <div><span className="font-bold text-[#b8a492]">Username:</span> <span className="text-white">{creator.username}</span></div>
          <div><span className="font-bold text-[#b8a492]">Email:</span> <span className="text-white">{creator.email}</span></div>
          <div><span className="font-bold text-[#b8a492]">Nama:</span> <span className="text-white">{creator.displayName}</span></div>
          <div><span className="font-bold text-[#b8a492]">Payout Account:</span> <span className="text-white">{creator.payoutSettings?.accountNumber || <span className='text-red-400'>-</span>}</span></div>
          <div><span className="font-bold text-[#b8a492]">Payout Holder:</span> <span className="text-white">{creator.payoutSettings?.accountHolder || <span className='text-red-400'>-</span>}</span></div>
          <div><span className="font-bold text-[#b8a492]">Payout Type:</span> <span className="text-white">{creator.payoutSettings?.type || <span className='text-red-400'>-</span>}</span></div>
          <div><span className="font-bold text-[#b8a492]">Tanggal Daftar:</span> <span className="text-white">{creator.createdAt ? new Date(creator.createdAt).toLocaleString() : '-'}</span></div>
        </div>
      </div>
    </div>
  );
}
