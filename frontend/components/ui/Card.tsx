import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className = '', hoverable = false, children, ...props }) => {
  const base = 'bg-surface border border-border rounded-xl overflow-hidden';
  const hover = hoverable ? 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-200' : '';
  
  return (
    <div className={`${base} ${hover} ${className}`} {...props}>
      {children}
    </div>
  );
};
