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
    h1: 'text-3xl sm:text-4xl font-extrabold tracking-tight',
    h2: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
    h3: 'text-xl sm:text-2xl font-bold tracking-tight',
    h4: 'text-base sm:text-lg font-bold',
    body: 'text-sm sm:text-base',
    small: 'text-xs sm:text-sm',
    xs: 'text-xs'
  };
  
  const colors = {
    primary: 'text-[#2d2d2d]',
    secondary: 'text-[#696057]',
    muted: 'text-[#8c8276]',
    white: 'text-white',
    danger: 'text-red-600',
    success: 'text-emerald-700'
  };
  
  const weights = {
    light: 'font-normal',
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
  
  const textClasses = `${variants[variant] || variants.body} ${colors[color] || colors.primary} ${weights[weight] || weights.normal} ${alignments[align] || alignments.left} ${className}`;
  
  return (
    <Component className={textClasses} {...props}>
      {children}
    </Component>
  );
};

export default Text;
