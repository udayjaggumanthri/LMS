import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  reviewsCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  reviewsCount,
  size = 'sm',
  showCount = true,
  className = ''
}) => {
  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const rounded = Math.round(rating * 10) / 10;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className={`font-bold text-amber-900 tabular-nums ${textSizes[size]}`}>
        {rating > 0 ? rounded.toFixed(1) : 'New'}
      </span>
      <div className="flex items-center gap-0.5 text-amber-500" aria-label={`Rating ${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const filled = rating >= starIndex;
          const half = !filled && rating >= starIndex - 0.5;
          return (
            <Star
              key={starIndex}
              className={`${starSizes[size]} ${
                filled
                  ? 'fill-amber-400 text-amber-500'
                  : half
                  ? 'fill-amber-400/50 text-amber-500'
                  : 'fill-slate-100 text-slate-300'
              }`}
            />
          );
        })}
      </div>
      {showCount && reviewsCount !== undefined && (
        <span className={`text-slate-500 tabular-nums ${textSizes[size]}`}>
          ({reviewsCount.toLocaleString()})
        </span>
      )}
    </div>
  );
};
