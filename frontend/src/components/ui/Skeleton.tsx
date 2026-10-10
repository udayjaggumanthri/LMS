import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular'
}) => {
  const variantStyles = {
    text: 'h-4 w-full rounded-sm',
    rectangular: 'rounded',
    circular: 'rounded-full'
  };

  return (
    <div
      className={`animate-pulse bg-slate-200 ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
    />
  );
};
