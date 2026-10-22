import React, { forwardRef } from 'react';
import Text from '../atoms/Text';

// Reusable SectionBox molecule with warm neo-brutalist styling
const SectionBox = forwardRef(({ title, description, children, tone = 'default', className = '' }, ref) => {
  const toneMap = {
    default: 'bg-[#f5e9da]/40 border-2 border-[#2d2d2d]/20',
    danger: 'bg-red-50 border-2 border-red-300',
    success: 'bg-emerald-50 border-2 border-emerald-300'
  };
  return (
    <div ref={ref} className={`p-4 sm:p-5 rounded-2xl ${toneMap[tone] || toneMap.default} ${className}`}>
      {title && <Text variant="h4" className="mb-1 text-[#2d2d2d]" weight="bold">{title}</Text>}
      {description && <Text variant="xs" color="secondary" className="mb-3 text-[#696057]">{description}</Text>}
      {children}
    </div>
  );
});

SectionBox.displayName = 'SectionBox';

export default SectionBox;
