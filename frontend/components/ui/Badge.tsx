import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '', ...props }) => {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  const variants = {
    default: 'bg-black/5 text-text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    outline: 'border border-border text-text-secondary'
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
