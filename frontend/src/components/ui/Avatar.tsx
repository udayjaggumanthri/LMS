import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const iconClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9',
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0 ${sizeClasses[size]} ${className}`}
      aria-label={name ? `${name} profile` : 'Profile'}
      title={name || 'Profile'}
    >
      <User className={iconClasses[size]} strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
};
