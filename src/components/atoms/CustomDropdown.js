import React, { useState, useRef, useEffect } from 'react';

const CustomDropdown = ({ value, onChange, options = [], placeholder = 'Pilih...', className = '' }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || '';

  return (
    <div ref={ref} className={`relative ${className}`} tabIndex={0}>
      <button
        type="button"
        className="w-full px-4 py-2.5 bg-white border-2 border-[#2d2d2d] rounded-xl text-[#2d2d2d] text-sm font-semibold flex items-center justify-between outline-none shadow-[2px_2px_0px_#2d2d2d] transition-all cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 truncate">
          <svg className="w-4 h-4 text-[#8c8276] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={selectedLabel ? 'font-bold' : 'text-[#8c8276]'}>
            {selectedLabel || placeholder || 'Semua tanggal'}
          </span>
        </span>
        <svg className={`w-3.5 h-3.5 text-[#696057] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute z-30 mt-1.5 w-full bg-[#fffdf9] border-2 border-[#2d2d2d] rounded-xl shadow-[4px_4px_0px_#2d2d2d] max-h-60 overflow-auto divide-y divide-[#2d2d2d]/10"
          role="listbox"
        >
          <li
            className={`px-4 py-2.5 cursor-pointer text-xs font-bold transition-colors ${
              !value ? 'bg-[#f5e9da] text-[#2d2d2d]' : 'text-[#696057] hover:bg-[#fbf8f3]'
            }`}
            onClick={() => {
              onChange('');
              setOpen(false);
            }}
          >
            Semua tanggal
          </li>
          {options.map((option) => (
            <li
              key={option.value}
              className={`px-4 py-2.5 cursor-pointer text-xs font-semibold transition-colors ${
                value === option.value ? 'bg-[#f5e9da] font-extrabold text-[#2d2d2d]' : 'text-[#2d2d2d] hover:bg-[#fbf8f3]'
              }`}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              role="option"
              aria-selected={value === option.value}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
