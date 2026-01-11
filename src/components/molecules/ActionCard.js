import React from 'react';
import Card from '../atoms/Card';

export default function ActionCard({ title, subtitle = 'Klik untuk lihat', icon = '🔔', gradientClass = 'bg-gradient-to-br from-[#333399] to-[#00fff7]', onClick }) {
  return (
    <Card as="button" className="cursor-pointer hover:bg-[#b8a492]/10 transition-all p-0" onClick={onClick}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`w-10 h-10 ${gradientClass} rounded-full flex items-center justify-center shadow-neon`}>
              <span className="text-[#181818] text-xl font-extrabold">{icon}</span>
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <div className="text-sm font-medium text-[#b8a492] truncate font-mono">{title}</div>
            <div className="text-xl font-bold text-[#b8a492] font-mono">{subtitle}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
