import React from 'react';

const Text = ({ 
  children,
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  align = 'left',
  className = '',
  as: Component = 'p',
  ...props 
}) => {
  const variants = {
    h1: 'text-4xl font-extrabold tracking-wide',
    h2: 'text-2xl font-extrabold',
    h3: 'text-xl font-bold',
    h4: 'text-lg font-bold',
    body: 'text-base',
    small: 'text-sm',
    xs: 'text-xs'
  };
  
  const colors = {
    primary: 'text-[#b8a492]',
    secondary: 'text-[#b8a492]/70',
    dark: 'text-[#2d2d2d]',
    white: 'text-white',
    danger: 'text-red-500',
    success: 'text-green-500'
  };
  
  const weights = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    bold: 'font-bold',
    extrabold: 'font-extrabold'
  };
  
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  const textClasses = `font-mono ${variants[variant]} ${colors[color]} ${weights[weight]} ${alignments[align]} ${className}`;
  
  return (
    <Component className={textClasses} {...props}>
      {children}
    </Component>
  );
};

export default Text;
