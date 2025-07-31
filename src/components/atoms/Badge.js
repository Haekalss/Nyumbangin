import React from 'react';

const Badge = ({ 
  children,
  variant = 'default',
  size = 'medium',
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-bold font-mono rounded-full border-2 inline-flex items-center justify-center';
  
  const variants = {
    default: 'bg-[#b8a492]/20 text-[#2d2d2d] border-[#b8a492]',
    success: 'bg-green-500/20 text-green-700 border-green-500',
    warning: 'bg-yellow-500/20 text-yellow-700 border-yellow-500',
    danger: 'bg-red-500/20 text-red-700 border-red-500',
    info: 'bg-blue-500/20 text-blue-700 border-blue-500'
  };
  
  const sizes = {
    small: 'px-2 py-1 text-xs',
    medium: 'px-3 py-1 text-sm',
    large: 'px-4 py-2 text-base'
  };
  
  const badgeClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};

export default Badge;
