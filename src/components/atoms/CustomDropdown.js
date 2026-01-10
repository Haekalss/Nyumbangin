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
        className="w-full px-4 py-2.5 bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl text-[#b8a492] font-mono flex items-center focus:outline-none focus:ring-2 focus:ring-[#b8a492] transition-all"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="mr-3 text-xl">📅</span>
        <span className={selectedLabel ? '' : 'opacity-60'}>
          {selectedLabel || 'Semua tanggal'}
        </span>
        <span className="ml-auto text-[#b8a492] text-xl">▼</span>
      </button>
      {open && (
        <ul
          className="absolute z-20 mt-2 w-full bg-[#232323] border-2 border-[#b8a492] rounded-xl shadow-lg max-h-60 overflow-auto animate-fadein"
          role="listbox"
        >
          {options.length === 0 && (
            <li className="px-4 py-2 text-[#b8a492]/60 font-mono">Tidak ada opsi</li>
          )}
          {options.map((option, idx) => (
            <li
              key={option.value}
              className={`px-4 py-2 cursor-pointer font-mono text-[#b8a492] hover:bg-[#333399]/30 transition-colors ${value === option.value ? 'bg-[#b8a492]/10 font-bold' : ''}`}
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
      <style jsx>{`
        .animate-fadein {
          animation: fadein 0.15s;
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default CustomDropdown;
