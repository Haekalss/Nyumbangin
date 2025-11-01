import React from 'react';
import Input from '../atoms/Input';
import Text from '../atoms/Text';

// PayoutFields molecule encapsulates payout/bank details input set with lock messaging.
const PayoutFields = ({ formData, onChange, locked }) => {
  return (
    <div className="space-y-3">
      <div>
        <Text variant="small" weight="bold" className="mb-1 block">
          Nama Bank / Channel
        </Text>
        <Input
          value={formData.payoutBankName || ''}
          onChange={(e) => onChange({ ...formData, payoutBankName: e.target.value })}
          placeholder={locked ? "Data sudah terkunci" : "Contoh: BCA / BRI / OVO / DANA"}
          disabled={locked}
          className={locked ? "bg-gray-800 cursor-not-allowed" : ""}
        />
        {locked && formData.payoutBankName && (
          <Text variant="xs" color="secondary" className="mt-1">
            ✅ Tersimpan: {formData.payoutBankName}
          </Text>
        )}
      </div>
      <div>
        <Text variant="small" weight="bold" className="mb-1 block">
          Nomor Rekening / Akun
        </Text>
        <Input
          value={formData.payoutAccountNumber || ''}
          onChange={(e) => {
            const v = e.target.value;
            if (/^\d*$/.test(v)) onChange({ ...formData, payoutAccountNumber: v });
          }}
          placeholder={locked ? "Data sudah terkunci" : "Nomor rekening atau nomor e-wallet"}
          disabled={locked}
          className={locked ? "bg-gray-800 cursor-not-allowed" : ""}
        />
        {locked && formData.payoutAccountNumber && (
          <Text variant="xs" color="secondary" className="mt-1">
            ✅ Tersimpan: {formData.payoutAccountNumber}
          </Text>
        )}
      </div>
      <div>
        <Text variant="small" weight="bold" className="mb-1 block">
          Nama Pemilik Rekening
        </Text>
        <Input
          value={formData.payoutAccountHolder || ''}
          onChange={(e) => onChange({ ...formData, payoutAccountHolder: e.target.value })}
          placeholder={locked ? "Data sudah terkunci" : "Sesuai buku tabungan / aplikasi"}
          disabled={locked}
          className={locked ? "bg-gray-800 cursor-not-allowed" : ""}
        />
        {locked && formData.payoutAccountHolder && (
          <Text variant="xs" color="secondary" className="mt-1">
            ✅ Tersimpan: {formData.payoutAccountHolder}
          </Text>
        )}
      </div>
    </div>
  );
};

export default PayoutFields;
