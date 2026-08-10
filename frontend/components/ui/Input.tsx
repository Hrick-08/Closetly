'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg border bg-surface px-3 py-2 text-text-primary placeholder:text-text-secondary
              focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent
              transition-colors
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-error focus:border-error focus:ring-error/20' : 'border-border'}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-error">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
