import React from 'react';
import Input from '../atoms/Input';
import Text from '../atoms/Text';

// PayoutFields molecule encapsulates payout/bank details input set with lock messaging.
const PayoutFields = ({ formData, onChange, locked }) => {
  return (
    <div className="space-y-3">
      <div>
        <Text variant="small" weight="bold" className="mb-1 block text-[#2d2d2d]">
          Nama Bank / Channel Pembayaran
        </Text>
        <Input
          value={formData.payoutBankName || ''}
          onChange={(e) => onChange({ ...formData, payoutBankName: e.target.value })}
          placeholder={locked ? "Data sudah terkunci" : "Contoh: BCA / Mandiri / BRI / GoPay / DANA"}
          disabled={locked}
        />
        {locked && formData.payoutBankName && (
          <p className="text-xs text-emerald-700 font-bold mt-1">
            ✓ Tersimpan: {formData.payoutBankName}
          </p>
        )}
      </div>
      <div>
        <Text variant="small" weight="bold" className="mb-1 block text-[#2d2d2d]">
          Nomor Rekening / Nomor E-Wallet
        </Text>
        <Input
          value={formData.payoutAccountNumber || ''}
          onChange={(e) => {
            const v = e.target.value;
            if (/^\d*$/.test(v)) onChange({ ...formData, payoutAccountNumber: v });
          }}
          placeholder={locked ? "Data sudah terkunci" : "Nomor rekening atau nomor HP e-wallet"}
          disabled={locked}
        />
        {locked && formData.payoutAccountNumber && (
          <p className="text-xs text-emerald-700 font-bold mt-1">
            ✓ Tersimpan: {formData.payoutAccountNumber}
          </p>
        )}
      </div>
      <div>
        <Text variant="small" weight="bold" className="mb-1 block text-[#2d2d2d]">
          Nama Pemilik Rekening
        </Text>
        <Input
          value={formData.payoutAccountHolder || ''}
          onChange={(e) => onChange({ ...formData, payoutAccountHolder: e.target.value })}
          placeholder={locked ? "Data sudah terkunci" : "Sesuai nama di buku tabungan / aplikasi"}
          disabled={locked}
        />
        {locked && formData.payoutAccountHolder && (
          <p className="text-xs text-emerald-700 font-bold mt-1">
            ✓ Tersimpan: {formData.payoutAccountHolder}
          </p>
        )}
      </div>
    </div>
  );
};

export default PayoutFields;
