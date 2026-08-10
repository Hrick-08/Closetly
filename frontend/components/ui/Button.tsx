'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-accent text-white hover:bg-accent-hover',
      secondary: 'border border-border bg-transparent hover:bg-surface text-text-primary',
      ghost: 'bg-transparent hover:bg-black/5 text-text-primary',
      danger: 'bg-error text-white hover:bg-error/90',
    };
    
    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-5',
      lg: 'h-12 px-7 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
