import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded text-slate-900 ${
        interactive
          ? 'transition-colors duration-150 hover:border-slate-300'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
