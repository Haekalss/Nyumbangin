import React from 'react';

export default function Card({ children, className = '', as: Component = 'div', ...props }) {
  const base = 'bg-[#fffdf9] border-2 border-[#2d2d2d] rounded-2xl shadow-[4px_4px_0px_#2d2d2d] text-[#2d2d2d]';
  return (
    <Component className={`${base} ${className}`} {...props}>
      {children}
    </Component>
  );
}
