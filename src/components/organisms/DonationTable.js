import React from 'react';
import DonationCard from '../molecules/DonationCard';

const DonationTable = ({ donations, onDelete }) => {
  if (!donations || donations.length === 0) {
    return (
      <div className="text-center py-12 text-[#b8a492] font-mono">
        Belum ada donasi hari ini
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <DonationCard key={donation._id} donation={donation} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default DonationTable;
