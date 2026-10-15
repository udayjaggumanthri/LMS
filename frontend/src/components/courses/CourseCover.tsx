import React, { useEffect, useRef, useState } from 'react';
import { resolveMediaUrl } from '../../api/client';
import { useBranding } from '../../context/BrandingContext';
import { useCourses } from '../../context/CourseContext';

export function hasCourseImage(thumbnail?: string | null) {
  const value = String(thumbnail || '').trim();
  return Boolean(value) && !value.includes('empty-cover');
}

function CoverMark({ compact }: { compact: boolean }) {
  const { branding } = useBranding();
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [branding.logoUrl]);
  const logo = branding.logoUrl && !failed ? resolveMediaUrl(branding.logoUrl) : '';

  if (logo) {
    return (
      <span className={`inline-flex shrink-0 items-center rounded bg-white ${compact ? 'px-0.5 py-px' : 'px-1.5 py-0.5'}`}>
        <img
          src={logo}
          alt=""
          className={`${compact ? 'h-2.5 max-w-[36px]' : 'h-4 max-w-[64px] sm:h-5'} w-auto object-contain`}
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <svg viewBox="0 0 100 80" className={`${compact ? 'h-3 w-4' : 'h-5 w-6'} shrink-0`} aria-hidden="true">
      <path d="M10 68C22 66 38 64 50 74C62 64 78 66 90 68V38C78 36 62 34 50 44C38 34 22 36 10 38V68Z" fill="#F4F1EA" />
      <path d="M16 62C26 60 38 58 48 66V39C38 31 26 33 16 35V62Z" fill="#065F46" />
      <path d="M84 62C74 60 62 58 52 66V39C62 31 74 33 84 35V62Z" fill="#065F46" />
      <path d="M50 4C44 14 46 22 50 28C54 22 56 14 50 4Z" fill="#F4F1EA" />
    </svg>
  );
}

interface CourseCoverProps {
  title: string;
  category?: string;
  categoryId?: string | number;
  thumbnail?: string | null;
  className?: string;
  size?: 'sm' | 'md';
}

export const CourseCover: React.FC<CourseCoverProps> = ({
  title,
  category,
  categoryId,
  thumbnail,
  className = '',
  size = 'md',
}) => {
  const { categories } = useCourses();
  const { branding } = useBranding();
  const boxRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const [failed, setFailed] = useState(false);
  const [compact, setCompact] = useState(size === 'sm');
  useEffect(() => { setFailed(false); }, [thumbnail]);

  const image = hasCourseImage(thumbnail) && !failed ? resolveMediaUrl(String(thumbnail)) : '';
  const categoryLabel = category
    || categories.find((item) => String(item.id) === String(categoryId))?.name
    || 'Course';
  const courseTitle = title?.trim() || 'Untitled course';

  useEffect(() => {
    if (image) return undefined;
    const box = boxRef.current;
    const slot = slotRef.current;
    const heading = titleRef.current;
    if (!box || !slot || !heading) return undefined;

    const fit = () => {
      const width = box.clientWidth;
      setCompact(size === 'sm' || width < 180);
      const available = slot.clientHeight;
      const textWidth = slot.clientWidth;
      if (available < 8 || textWidth < 8) return;
      heading.style.display = 'block';
      heading.style.width = `${textWidth}px`;
      heading.style.maxWidth = `${textWidth}px`;
      heading.style.whiteSpace = 'normal';
      let low = width < 80 ? 6 : 10;
      let high = Math.max(low, Math.floor(Math.min(available * 0.46, textWidth * 0.16)));
      let best = low;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        heading.style.fontSize = `${mid}px`;
        heading.style.lineHeight = '1.2';
        const fitsHeight = heading.scrollHeight <= available + 1;
        const fitsWidth = heading.scrollWidth <= textWidth + 1;
        if (fitsHeight && fitsWidth) {
          best = mid;
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      heading.style.fontSize = `${best}px`;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    observer.observe(slot);
    return () => observer.disconnect();
  }, [image, courseTitle, size]);

  if (image) {
    return (
      <img
        src={image}
        alt={courseTitle}
        className={`h-full w-full object-cover ${className}`}
        onError={() => setFailed(true)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      ref={boxRef}
      className={`relative h-full w-full overflow-hidden bg-emerald-800 text-white ${className}`}
      role="img"
      aria-label={`${courseTitle}. ${categoryLabel}`}
    >
      <div className="flex h-full w-full min-w-0 flex-col overflow-hidden px-[8%] py-[7%]">
        <div className="flex items-center justify-between gap-2">
          <span className={`min-w-0 truncate font-semibold uppercase tracking-wide text-emerald-50 ${compact ? 'text-[8px]' : 'text-[11px]'}`}>
            {categoryLabel}
          </span>
          <CoverMark compact={compact} />
        </div>
        <div ref={slotRef} className="mt-1 flex min-h-0 min-w-0 flex-1 items-center overflow-hidden">
          <p
            ref={titleRef}
            className="w-full min-w-0 font-bold leading-tight"
            style={{ overflowWrap: 'break-word' }}
          >
            {courseTitle}
          </p>
        </div>
        {!compact && (
          <div className="truncate text-[10px] font-medium text-emerald-100">
            {branding.platformName || 'PrajnadharaEdu'}
          </div>
        )}
      </div>
    </div>
  );
};
