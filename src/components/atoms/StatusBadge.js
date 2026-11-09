import React from 'react';

// StatusBadge atom for consistent status pill styling.
const statusStyles = {
  PAID: 'bg-emerald-100 text-emerald-800 border-emerald-700',
  SUCCESS: 'bg-emerald-100 text-emerald-800 border-emerald-700',
  UNPAID: 'bg-amber-100 text-amber-800 border-amber-700',
  PENDING: 'bg-amber-100 text-amber-800 border-amber-700',
  PROCESSED: 'bg-emerald-100 text-emerald-800 border-emerald-700',
  APPROVED: 'bg-blue-100 text-blue-800 border-blue-700',
  REJECTED: 'bg-red-100 text-red-800 border-red-700',
  FAILED: 'bg-red-100 text-red-800 border-red-700',
};

const StatusBadge = ({ status = 'PAID', children }) => {
  const cls =
    statusStyles[status] ||
    'bg-[#f2e4d4] text-[#2d2d2d] border-[#2d2d2d]';

  return (
    <span
      className={`inline-block rounded-md border-2 px-2 py-0.5 text-[11px] font-extrabold shadow-[1px_1px_0px_#2d2d2d] ${cls}`}
    >
      {children || status}
    </span>
  );
};

export default StatusBadge;
