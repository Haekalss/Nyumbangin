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
  const baseClasses = 'font-bold font-mono transition-all rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[#b8a492] text-[#2d2d2d] border-[#2d2d2d] hover:bg-[#d6c6b9] focus:ring-[#b8a492]',
    secondary: 'bg-transparent text-[#b8a492] border-[#b8a492] hover:bg-[#b8a492]/10 focus:ring-[#b8a492]',
    danger: 'bg-red-500 text-white border-red-600 hover:bg-red-600 focus:ring-red-500',
    success: 'bg-green-500 text-white border-green-600 hover:bg-green-600 focus:ring-green-500'
  };
  
  const sizes = {
    small: 'px-3 py-1 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`;
  
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
