import React from 'react';
import Card from '../atoms/Card';
import toast from 'react-hot-toast';

export default function LinkBox({ title, icon, url, description, field }) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url || '');
      toast.success('Link berhasil disalin!');
    } catch (e) {
      toast.error('Gagal menyalin link');
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#b8a492] text-[#2d2d2d] flex items-center justify-center font-bold">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="truncate">
              <div className="text-sm font-bold text-[#b8a492]">{title}</div>
              {description && <div className="text-xs text-[#b8a492]/70 truncate">{description}</div>}
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
              <a href={url} target="_blank" rel="noreferrer" className="text-sm text-[#b8a492] hover:underline">Buka</a>
              <button onClick={handleCopy} className="text-sm px-3 py-1 bg-[#2d2d2d] border-2 border-[#b8a492] rounded text-[#b8a492] hover:bg-[#b8a492] hover:text-[#2d2d2d]">Salin</button>
            </div>
          </div>
          <div className="mt-2">
            <input readOnly value={url} className="w-full bg-transparent text-xs text-[#b8a492] truncate" onClick={e => e.target.select()} />
          </div>
        </div>
      </div>
    </Card>
  );
}
