import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
  className?: string;
}

export const Carousel: React.FC<CarouselProps> = ({
  children,
  title,
  subtitle,
  viewAllLink,
  className = ''
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {(title || subtitle) && (
        <div className="flex items-end justify-between mb-4">
          <div>
            {title && <h2 className="text-xl md:text-2xl font-bold font-display text-slate-900 tracking-tight">{title}</h2>}
            {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {viewAllLink && (
              <a
                href={viewAllLink}
                className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 mr-2 underline-offset-4 hover:underline"
              >
                View all
              </a>
            )}
            <button
              type="button"
              onClick={() => scroll('left')}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll('right')}
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {children}
      </div>
    </div>
  );
};
