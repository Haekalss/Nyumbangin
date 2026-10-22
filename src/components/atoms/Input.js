import React from 'react';

const Input = ({ 
  type = 'text',
  placeholder = '',
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
  error = false,
  ...props 
}) => {
  const baseClasses = 'w-full px-3.5 py-2.5 border-2 bg-white text-[#2d2d2d] font-semibold text-sm rounded-xl focus:outline-none transition-all placeholder:text-[#b4aba0]';
  
  const stateClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
    : 'border-[#2d2d2d] focus:bg-[#fffdf9] focus:shadow-[2px_2px_0px_#2d2d2d]';
    
  const disabledClasses = disabled 
    ? 'border-[#2d2d2d]/30 bg-gray-100 text-[#2d2d2d]/50 cursor-not-allowed shadow-none' 
    : '';
  
  const inputClasses = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`;
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={inputClasses}
      {...props}
    />
  );
};

export default Input;
