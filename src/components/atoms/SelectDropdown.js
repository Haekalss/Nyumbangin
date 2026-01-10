import React from 'react';

const SelectDropdown = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Pilih...', 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl text-[#b8a492] font-mono focus:outline-none focus:ring-2 focus:ring-[#b8a492] transition-all appearance-none cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((option, idx) => (
          <option key={idx} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#b8a492]">
        ▼
      </div>
      <style jsx>{`
        select:focus option, select option {
          background: #232323;
          color: #b8a492;
        }
      `}</style>
    </div>
  );
};

export default SelectDropdown;
