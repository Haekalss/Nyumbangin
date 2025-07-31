import React from 'react';
import Text from '../atoms/Text';
import Badge from '../atoms/Badge';

const StatsCard = ({ title, value, icon }) => {
  return (
    <div className="bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-5 cursor-pointer hover:bg-[#b8a492]/10 transition-all flex items-center gap-4">
      <div className="w-10 h-10 bg-gradient-to-br from-[#00fff7] to-[#333399] rounded-full flex items-center justify-center shadow-neon text-[#181818] text-xl font-extrabold">
        {icon}
      </div>
      <div>
        <Text variant="body" weight="bold" color="primary">{title}</Text>
        <Text variant="h3" weight="bold" color="primary">{value}</Text>
      </div>
    </div>
  );
};

export default StatsCard;
