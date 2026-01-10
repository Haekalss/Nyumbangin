import React from 'react';

const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = 'Cari...', 
  className = '' 
}) => {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        w-full px-4 py-3 
        bg-[#2d2d2d] border-4 border-[#b8a492] 
        rounded-xl text-[#b8a492] font-mono
        placeholder-[#b8a492]/60 
        focus:outline-none focus:ring-2 focus:ring-[#b8a492] 
        transition-all
        ${className}
      `}
    />
  );
};

export default SearchInput;
