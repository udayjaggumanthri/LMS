import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded border focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1 select-none whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed';

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-5 py-2.5 gap-2.5'
    };

    const variantStyles = {
      primary: 'bg-emerald-800 text-white border-emerald-800 hover:bg-emerald-900 hover:border-emerald-900 active:bg-emerald-950',
      secondary: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200 hover:border-slate-300 active:bg-slate-300',
      outline: 'bg-transparent text-slate-800 border-slate-300 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100',
      ghost: 'bg-transparent text-slate-700 border-transparent hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200',
      danger: 'bg-rose-700 text-white border-rose-700 hover:bg-rose-800 hover:border-rose-800 active:bg-rose-900'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
