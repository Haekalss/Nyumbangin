import React from 'react';
import HistoryDonationItem from '../molecules/HistoryDonationItem';
import { formatRupiah } from '@/utils/format';

const HistoryDayCard = ({ 
  dayData, 
  className = '' 
}) => {
  return (
    <div className={`bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl overflow-hidden ${className}`}>
      {/* Date Header */}
      <div className="bg-[#b8a492]/10 px-5 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-2 border-[#b8a492]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#333399] to-[#00fff7] flex items-center justify-center shadow-neon">
            <span className="text-[#181818] text-xl font-extrabold">📅</span>
          </div>
          <div>
            <div className="font-extrabold text-lg text-[#b8a492] font-mono">{dayData.date}</div>
            <div className="text-sm text-[#b8a492]/70 font-mono">{dayData.count} donasi diterima</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-[#b8a492]/20 px-3 py-1.5 rounded-lg text-[#b8a492] text-sm font-bold font-mono border-2 border-[#b8a492]">
            {dayData.count} donasi
          </span>
          <span className="bg-[#b8a492] text-[#2d2d2d] px-3 py-1.5 rounded-lg font-extrabold font-mono">
            {formatRupiah(dayData.total)}
          </span>
        </div>
      </div>

      {/* Donations Grid (rows of two) */}
      <div className="flex flex-col">
        {(() => {
          const rows = [];
          for (let i = 0; i < dayData.donations.length; i += 2) {
            rows.push([dayData.donations[i], dayData.donations[i + 1] || null]);
          }
          return rows.map((pair, idx) => (
            <div key={idx} className="relative grid grid-cols-1 lg:grid-cols-2 items-stretch">
              <div className="p-0 h-full">
                <HistoryDonationItem donation={pair[0]} className="h-full" />
              </div>
              <div className="p-0 h-full">
                {pair[1] ? <HistoryDonationItem donation={pair[1]} className="h-full" /> : <div className="hidden lg:block" />}
              </div>

              {/* Horizontal separators as two segments with center gap */}
              {idx !== rows.length - 1 && (
                <>
                  <div
                    style={{ left: '16px', right: 'calc(50% + 16px)', bottom: 0, height: '1px', background: '#b8a49233' }}
                    className="absolute"
                  />
                  <div
                    style={{ left: 'calc(50% + 16px)', right: '16px', bottom: 0, height: '1px', background: '#b8a49233' }}
                    className="absolute"
                  />

                  {/* Short vertical divider in center (only on large screens) */}
                  <div
                    style={{ left: '50%', top: 18, bottom: 18, width: '1px', background: '#b8a49233', transform: 'translateX(-0.5px)' }}
                    className="absolute hidden lg:block"
                  />
                </>
              )}
            </div>
          ));
        })()}
      </div>
    </div>
  );
};

export default HistoryDayCard;
