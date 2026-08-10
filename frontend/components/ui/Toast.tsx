'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-error" />,
    info: <Info className="w-5 h-5 text-accent" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning" />
  };

  const borders = {
    success: 'border-l-success',
    error: 'border-l-error',
    info: 'border-l-accent',
    warning: 'border-l-warning'
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 bg-surface border border-border border-l-4 ${borders[toast.type]} rounded-lg shadow-lg p-4 min-w-[300px] animate-fadeIn`}
          >
            {icons[toast.type]}
            <p className="flex-1 text-sm font-medium text-text-primary">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-text-secondary hover:text-text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
