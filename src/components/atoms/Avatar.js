import React from 'react';

const Avatar = ({ 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-xl',
    xl: 'w-14 h-14 text-2xl'
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';

  return (
    <div 
      className={`
        ${sizeClasses[size]} 
        rounded-full bg-gradient-to-br from-[#333399] to-[#00fff7] 
        flex items-center justify-center 
        text-[#181818] font-extrabold font-mono
        flex-shrink-0 shadow-neon
        ${className}
      `}
    >
      {initial}
    </div>
  );
};

export default Avatar;
