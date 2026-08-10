'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className = '' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      <div className={`relative bg-surface rounded-xl border border-border shadow-lg w-full max-w-md p-6 animate-scaleIn ${className}`}>
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-semibold text-text-primary">{title}</h2>}
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 transition-colors text-text-secondary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
