import React from 'react';

// StatusBadge atom for consistent status pill styling.
const statusStyles = {
  PAID: 'bg-green-600/30 text-green-200 border-green-400',
  UNPAID: 'bg-yellow-600/30 text-yellow-200 border-yellow-400',
  PENDING: 'bg-yellow-600/30 text-yellow-200 border-yellow-400',
  FAILED: 'bg-red-600/30 text-red-200 border-red-400'
};

const StatusBadge = ({ status = 'PAID', children }) => {
  const cls = statusStyles[status] || 'bg-[#b8a492]/20 text-[#2d2d2d] border-[#b8a492]';
  return (
    <span className={`text-xs font-bold rounded-full px-2 py-1 border-2 font-mono inline-block ${cls}`}>
      {children || status}
    </span>
  );
};

export default StatusBadge;
