import React from 'react';
import Text from '../atoms/Text';

// Reusable SectionBox molecule used for grouping related form fields with a title & optional description.
const SectionBox = ({ title, description, children, tone = 'default', className = '' }) => {
  const toneMap = {
    default: 'bg-[#b8a492]/10 border-[#b8a492]/30',
    danger: 'bg-red-500/10 border-red-500/30',
    success: 'bg-green-500/10 border-green-500/30'
  };
  return (
    <div className={`p-4 rounded-lg border ${toneMap[tone]} ${className}`}>
      {title && <Text variant="h4" className="mb-3" weight="bold">{title}</Text>}
      {description && <Text variant="xs" color="secondary" className="mb-3">{description}</Text>}
      {children}
    </div>
  );
};

export default SectionBox;
