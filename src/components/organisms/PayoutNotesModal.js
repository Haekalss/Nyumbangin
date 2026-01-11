import Card from '../atoms/Card';

export default function PayoutNotesModal({ 
  isOpen, 
  type, 
  notes, 
  onNotesChange, 
  onClose, 
  onSubmit 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
      <Card className="p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-extrabold text-[#b8a492] mb-2">
          {type === 'PROCESSED' ? 'Proses Payout' : 'Tolak Payout'}
        </h2>
        <label className="block mb-2 font-semibold text-[#b8a492]">
          Catatan (opsional)
        </label>
        <textarea
          className="w-full border-2 border-[#b8a492] rounded-lg p-2 mb-4 bg-[#fbe8d4] text-[#2d2d2d] font-mono focus:outline-none focus:ring-2 focus:ring-[#b8a492] placeholder-[#b8a492]"
          rows={3}
          value={notes}
          onChange={onNotesChange}
          placeholder="Isi catatan untuk payout ini..."
        />
        <div className="flex gap-2 justify-end">
          <button 
            className="px-4 py-2 rounded-lg bg-[#b8a492] text-[#2d2d2d] font-bold border-2 border-[#b8a492] hover:bg-[#d6c6b9] transition-all" 
            onClick={onClose}
          >
            Batal
          </button>
          <button 
            className="px-4 py-2 rounded-lg bg-[#2d2d2d] text-[#b8a492] font-bold border-2 border-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d] transition-all" 
            onClick={onSubmit}
          >
            Simpan & {type === 'PROCESSED' ? 'Proses' : 'Tolak'}
          </button>
        </div>
      </Card>
    </div>
  );
}
