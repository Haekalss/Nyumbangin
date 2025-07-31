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
  const baseClasses = 'w-full px-3 py-2 border-2 bg-[#2d2d2d] text-[#b8a492] font-mono rounded-md focus:outline-none transition-colors';
  
  const stateClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : 'border-[#b8a492] focus:ring-[#b8a492] focus:border-[#b8a492]';
    
  const disabledClasses = disabled 
    ? 'border-[#b8a492]/50 bg-[#2d2d2d]/50 text-[#b8a492]/70 cursor-not-allowed' 
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
