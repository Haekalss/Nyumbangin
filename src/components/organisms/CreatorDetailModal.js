import React from 'react';
import Modal from '../atoms/Modal';

const DetailRow = ({ label, value, mono = false }) => (
  <div className="flex flex-col gap-0.5 border-b border-[#2d2d2d]/10 pb-2.5 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
    <span className="text-xs font-extrabold uppercase tracking-wider text-[#8f857b]">
      {label}
    </span>
    <span
      className={`text-sm font-bold text-[#2d2d2d] break-all sm:text-right ${
        mono ? 'font-mono' : ''
      }`}
    >
      {value}
    </span>
  </div>
);

export default function CreatorDetailModal({ creator, onClose }) {
  if (!creator) return null;

  const payout = creator.payoutSettings || {};

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Detail Creator"
      maxWidth="max-w-md"
    >
      <div className="space-y-3">
        <DetailRow label="Username" value={creator.username || '-'} mono />
        <DetailRow label="Email" value={creator.email || '-'} />
        <DetailRow label="Nama" value={creator.displayName || '-'} />
        <DetailRow
          label="No. Rekening"
          value={payout.accountNumber || '-'}
          mono
        />
        <DetailRow label="Atas Nama" value={payout.accountHolder || '-'} />
        <DetailRow label="Tipe Payout" value={payout.type || '-'} />
        <DetailRow
          label="Tanggal Daftar"
          value={
            creator.createdAt
              ? new Date(creator.createdAt).toLocaleString('id-ID')
              : '-'
          }
        />
      </div>
    </Modal>
  );
}
