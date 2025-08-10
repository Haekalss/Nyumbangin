import React from 'react';
import Input from '../atoms/Input';
import Text from '../atoms/Text';

// PayoutFields molecule encapsulates payout/bank details input set with lock messaging.
const PayoutFields = ({ formData, onChange, locked }) => {
  return (
    <div className="space-y-3">
      <div>
        <Text variant="small" weight="bold" className="mb-1 block">Nama Bank / Channel</Text>
        <Input
          value={formData.payoutBankName || ''}
          onChange={(e) => onChange({ ...formData, payoutBankName: e.target.value })}
          placeholder="Contoh: BCA / BRI / OVO / DANA"
          disabled={locked}
        />
      </div>
      <div>
        <Text variant="small" weight="bold" className="mb-1 block">Nomor Rekening / Akun</Text>
        <Input
          value={formData.payoutAccountNumber || ''}
          onChange={(e) => {
            const v = e.target.value;
            if (/^\d*$/.test(v)) onChange({ ...formData, payoutAccountNumber: v });
          }}
          placeholder="Nomor rekening atau nomor e-wallet"
          disabled={locked}
        />
      </div>
      <div>
        <Text variant="small" weight="bold" className="mb-1 block">Nama Pemilik Rekening</Text>
        <Input
          value={formData.payoutAccountHolder || ''}
          onChange={(e) => onChange({ ...formData, payoutAccountHolder: e.target.value })}
          placeholder="Sesuai buku tabungan / aplikasi"
          disabled={locked}
        />
      </div>
    </div>
  );
};

export default PayoutFields;
