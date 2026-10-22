import React from 'react';
import Card from './Card';

/**
 * Generic Modal atom with neo-brutalist styling.
 */
const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-2xl', showCloseButton = true }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <Card 
        className={`p-6 sm:p-7 w-full ${maxWidth} max-h-[90vh] overflow-hidden shadow-[8px_8px_0px_#2d2d2d] relative bg-[#fffdf9]`} 
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="pb-4 mb-4 border-b-2 border-[#2d2d2d]/15 flex items-center justify-between pr-10">
            <h3 className="text-xl sm:text-2xl font-black text-[#2d2d2d] tracking-tight">{title}</h3>
          </div>
        )}
        {showCloseButton && (
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-xl border-2 border-[#2d2d2d] bg-white text-[#2d2d2d] font-bold text-lg hover:bg-[#fbf8f3] shadow-[2px_2px_0px_#2d2d2d] transition-all cursor-pointer active:translate-y-0.5"
          >
            ✕
          </button>
        )}
        <div className="max-h-[calc(90vh-10rem)] overflow-y-auto pr-1">
          {children}
        </div>
        {footer && (
          <div className="pt-4 mt-4 border-t-2 border-[#2d2d2d]/15">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Modal;
