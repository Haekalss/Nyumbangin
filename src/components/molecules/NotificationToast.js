import React from 'react';
import Text from '../atoms/Text';

const NotificationToast = ({ message, detail, time, progress }) => {
  return (
    <div className="fixed top-6 right-6 z-50 bg-[#b8a492] text-[#2d2d2d] px-6 py-4 rounded-xl border-4 border-[#2d2d2d] flex flex-col gap-1" style={{ minWidth: 320 }}>
      <Text variant="h4" weight="bold" color="primary">{message}</Text>
      {detail && <Text variant="small" color="primary">Pesan: {detail}</Text>}
      <Text variant="xs" color="primary" className="opacity-80">{time}</Text>
      <div className="w-full h-1 bg-[#2d2d2d]/30 rounded mt-2 overflow-hidden">
        <div className="h-1 bg-[#2d2d2d] transition-all duration-50" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

export default NotificationToast;
