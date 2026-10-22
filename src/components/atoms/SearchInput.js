import React from 'react';

const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = 'Cari...', 
  className = '' 
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <span className="absolute left-3.5 text-[#8c8276] pointer-events-none">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#2d2d2d] rounded-xl text-[#2d2d2d] text-sm font-semibold placeholder:text-[#8c8276] outline-none focus:bg-[#fffdf9] focus:shadow-[2px_2px_0px_#2d2d2d] transition-all"
      />
    </div>
  );
};

export default SearchInput;
