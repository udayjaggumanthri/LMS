import React from 'react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, ...props }, ref) => {
    const inputId = id || `check-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className="flex items-start gap-2.5 select-none text-left">
        <div className="flex items-center h-5">
          <input
            id={inputId}
            ref={ref}
            type="checkbox"
            className={`w-4 h-4 text-emerald-800 bg-white border-slate-300 rounded focus:ring-emerald-700 focus:ring-offset-1 focus:ring-2 disabled:cursor-not-allowed ${className}`}
            {...props}
          />
        </div>
        <div className="text-sm">
          <label htmlFor={inputId} className="font-medium text-slate-800 cursor-pointer">
            {label}
          </label>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
