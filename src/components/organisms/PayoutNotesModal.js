import Modal from '../atoms/Modal';
import Button from '../atoms/Button';

export default function PayoutNotesModal({
  isOpen,
  type,
  notes,
  onNotesChange,
  onClose,
  onSubmit
}) {
  const isProcessing = type === 'PROCESSED';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isProcessing ? 'Proses Payout' : 'Tolak Payout'}
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="small" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant={isProcessing ? 'primary' : 'danger'}
            size="small"
            onClick={onSubmit}
          >
            Simpan &amp; {isProcessing ? 'Proses' : 'Tolak'}
          </Button>
        </div>
      }
    >
      <p className="mb-4 text-sm font-medium leading-relaxed text-[#696057]">
        {isProcessing
          ? 'Tambahkan catatan sebelum menyelesaikan pengajuan pencairan ini.'
          : 'Berikan alasan penolakan agar creator tahu langkah selanjutnya.'}
      </p>

      <label
        htmlFor="payout-notes"
        className="mb-1.5 block text-xs font-extrabold uppercase tracking-wider text-[#8f857b]"
      >
        Catatan (opsional)
      </label>
      <textarea
        id="payout-notes"
        rows={3}
        value={notes}
        onChange={onNotesChange}
        placeholder="Tulis catatan untuk payout ini..."
        className="w-full resize-none rounded-xl border-2 border-[#2d2d2d] bg-[#fbf8f3] px-3.5 py-2.5 text-sm font-medium text-[#2d2d2d] placeholder:text-[#a89c90] transition focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#b8a492]"
      />
    </Modal>
  );
}
