import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'line' | 'circle' | 'card';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'line' }) => {
  const base = 'bg-border/50 animate-shimmer bg-gradient-to-r from-border/50 via-border/80 to-border/50 bg-[length:400%_100%]';
  
  const variants = {
    line: 'h-4 w-full rounded',
    circle: 'rounded-full',
    card: 'h-48 w-full rounded-lg'
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`} />
  );
};
