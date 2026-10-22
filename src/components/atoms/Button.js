import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false, 
  onClick, 
  type = 'button',
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-extrabold transition-all rounded-xl border-2 cursor-pointer inline-flex items-center justify-center gap-2 select-none active:translate-y-0.5';
  
  const variants = {
    primary: 'bg-[#2d2d2d] text-[#fbf8f3] border-[#2d2d2d] shadow-[3px_3px_0px_#b8a492] hover:translate-x-[1px] hover:translate-y-[1px]',
    secondary: 'bg-white text-[#2d2d2d] border-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d] hover:bg-[#fbf8f3] hover:translate-x-[1px] hover:translate-y-[1px]',
    accent: 'bg-[#b8a492] text-[#2d2d2d] border-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d] hover:bg-[#cabaa9] hover:translate-x-[1px] hover:translate-y-[1px]',
    danger: 'bg-red-500 text-white border-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d] hover:bg-red-600',
    success: 'bg-emerald-600 text-white border-[#2d2d2d] shadow-[3px_3px_0px_#2d2d2d] hover:bg-emerald-700'
  };
  
  const sizes = {
    small: 'px-3 py-1.5 text-xs',
    medium: 'px-4 py-2 text-sm',
    large: 'px-5 py-2.5 text-base'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none shadow-none' : '';
  
  const buttonClasses = `${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.medium} ${disabledClasses} ${className}`;
  
  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
