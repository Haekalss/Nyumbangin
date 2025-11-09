import React from 'react';

/**
 * Generic Modal atom responsible only for layout, backdrop and container.
 */
const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div 
        className={`bg-[#2d2d2d] border-4 border-[#b8a492] rounded-xl p-6 w-full ${maxWidth} max-h-full overflow-hidden shadow-xl relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <h3 className="text-2xl font-extrabold text-[#b8a492] mb-2 font-mono text-center">{title}</h3>
        )}
        <button
          onClick={onClose}
          aria-label="Tutup modal"
          className="absolute top-3 right-3 px-3 py-1 rounded border-2 border-[#b8a492] bg-[#b8a492] text-[#2d2d2d] font-bold font-mono hover:bg-[#d6c6b9] transition-all"
        >
          Tutup
        </button>
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 mt-4">
          {children}
        </div>
        {footer && (
          <div className="pt-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
