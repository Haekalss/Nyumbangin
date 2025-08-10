import React from 'react';
import Button from '../atoms/Button';
import Text from '../atoms/Text';
import Badge from '../atoms/Badge';
import { formatRupiah } from '@/utils/format';

const DonationCard = ({ donation, onDelete }) => {
  return (
    <div className="bg-[#b8a492]/20 border-2 border-[#b8a492] rounded-md p-4 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <Text variant="h4" weight="bold" color="primary">{donation.name}</Text>
  <Badge variant="default" size="medium">{formatRupiah(donation.amount)}</Badge>
      </div>
      {donation.message && (
        <Text variant="body" color="primary" className="italic truncate">{donation.message}</Text>
      )}
      <div className="flex justify-end">
        <Button variant="danger" size="small" onClick={() => onDelete(donation._id)}>
          Hapus
        </Button>
      </div>
    </div>
  );
};

export default DonationCard;
