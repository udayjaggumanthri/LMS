import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'bestseller' | 'new' | 'highest-rated' | 'featured' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = ''
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-1.5 py-0.5 font-semibold uppercase tracking-wider',
    md: 'text-xs px-2 py-0.5 font-medium'
  };

  const variantStyles = {
    bestseller: 'bg-amber-100 text-amber-900 border border-amber-300',
    new: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    'highest-rated': 'bg-sky-100 text-sky-900 border border-sky-300',
    featured: 'bg-emerald-900 text-white border border-emerald-900',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center rounded-sm leading-none whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
