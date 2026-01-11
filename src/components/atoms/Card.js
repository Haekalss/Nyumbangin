import React from 'react';

export default function Card({ children, className = '', as: Component = 'div', ...props }) {
  const base = 'bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl';
  return (
    <Component className={`${base} ${className}`} {...props}>
      {children}
    </Component>
  );
}
