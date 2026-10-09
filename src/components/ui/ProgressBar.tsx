import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = true,
  size = 'md',
  className = ''
}) => {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`w-full text-left ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center text-xs text-slate-600 mb-1 font-medium">
          {label && <span>{label}</span>}
          {showPercent && <span className="tabular-nums font-semibold text-slate-900">{percent}%</span>}
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-sm overflow-hidden border border-slate-200 ${heightClasses[size]}`}>
        <div
          className="bg-emerald-800 h-full transition-[width] duration-300 ease-out"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
