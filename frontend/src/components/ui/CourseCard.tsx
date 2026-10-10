import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Clock, BarChart2, Check, ShoppingBag } from 'lucide-react';
import { Course } from '../../types';
import { Rating } from './Rating';
import { Badge } from './Badge';
import { Button } from './Button';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLearning } from '../../context/LearningContext';

interface CourseCardProps {
  course: Course;
  className?: string;
  showHoverPopover?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  className = '',
  showHoverPopover = true
}) => {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useNotifications();
  const { isEnrolled } = useLearning();
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const instructorName = typeof course.instructor === 'object' && course.instructor?.name
    ? course.instructor.name
    : (typeof course.instructor === 'object' && (course.instructor as any)?.username
      ? (course.instructor as any).username
      : 'Prajnadhara Faculty');
  const isWishlisted = isInWishlist(course.id);
  const inCart = isInCart(course.id);
  const enrolled = isEnrolled(course.id);

  const primaryBadge = course.badges && course.badges.length > 0 ? course.badges[0] : null;

  return (
    <div
      className={`relative group bg-white border border-slate-200 rounded flex flex-col text-left transition-colors duration-150 hover:border-slate-300 ${className}`}
      onMouseEnter={() => showHoverPopover && setIsHovered(true)}
      onMouseLeave={() => showHoverPopover && setIsHovered(false)}
    >
      {/* 16:9 Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 rounded-t">
        <Link to={`/course/${course.slug}`} className="block w-full h-full">
          {!imgError && course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-4">
              <span className="font-display font-semibold text-xs tracking-wider uppercase text-slate-500">
                {course.subcategory}
              </span>
            </div>
          )}
        </Link>

        {/* Subtle Wishlist Heart Button in corner */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(course.id);
            showToast(
              isWishlisted ? 'info' : 'success',
              isWishlisted ? `Removed "${course.title}" from your wishlist` : `Saved "${course.title}" to your wishlist!`
            );
          }}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded bg-white/95 border border-slate-200 shadow-sm transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 ${
            isWishlisted ? 'text-rose-600' : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-600' : ''}`} />
        </button>

        {/* Primary Badge or Enrolled Tag */}
        {enrolled ? (
          <div className="absolute top-2.5 left-2.5">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-700 text-white shadow-sm inline-flex items-center gap-1">
              <Check className="w-3 h-3" /> Enrolled
            </span>
          </div>
        ) : primaryBadge ? (
          <div className="absolute top-2.5 left-2.5">
            <Badge
              variant={
                primaryBadge === 'Bestseller'
                  ? 'bestseller'
                  : primaryBadge === 'Highest rated'
                  ? 'highest-rated'
                  : 'new'
              }
            >
              {primaryBadge}
            </Badge>
          </div>
        ) : null}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed category metadata with separator */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5 font-medium">
            <span>{course.subcategory}</span>
            <span aria-hidden="true">·</span>
            <span>{course.level}</span>
          </div>

          {/* Course Title */}
          <Link
            to={`/course/${course.slug}`}
            className="block font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-900 transition-colors"
          >
            {course.title}
          </Link>

          {/* Instructor Name */}
          <p className="mt-1 text-xs text-slate-600 truncate">{instructorName}</p>

          {/* Rating and Reviews */}
          <div className="mt-2">
            <Rating rating={course.rating} reviewsCount={course.reviewsCount} size="sm" />
          </div>

          {/* Duration and Lectures metadata (unboxed) */}
          <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="tabular-nums">{course.durationHours}h total</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <BarChart2 className="w-3.5 h-3.5 text-slate-400" />
              <span className="tabular-nums">{course.lectureCount} lectures</span>
            </span>
          </div>
        </div>

        {/* Price Baseline */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {course.isFree || course.price === 0 ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}
            </span>
            {course.originalPrice > course.price && !course.isFree && (
              <span className="text-xs text-slate-400 line-through tabular-nums">
                ₹{course.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (inCart) {
                navigate('/cart');
              } else {
                addToCart(course.id);
                showToast('success', `Added "${course.title}" to your cart!`);
              }
            }}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 transition-colors"
          >
            {inCart ? 'In cart' : 'Add to cart'}
          </button>
        </div>
      </div>

      {/* Desktop Hover Flyout / Popover */}
      {isHovered && showHoverPopover && (
        <div
          className="hidden lg:block absolute left-full top-0 ml-3 w-80 bg-white border border-slate-200 rounded p-4 z-40 text-slate-900 shadow-md animate-in fade-in-50 duration-150"
          style={{ minHeight: '100%' }}
        >
          <div className="text-xs text-slate-500 mb-1 font-medium">Updated {course.lastUpdated}</div>
          <h4 className="font-bold text-sm text-slate-900 font-display leading-tight">{course.title}</h4>
          <p className="mt-1.5 text-xs text-slate-600 line-clamp-3 leading-relaxed">{course.subtitle}</p>

          <div className="mt-3 pt-3 border-t border-slate-100">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-700 mb-2">
              What you will learn
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {course.whatYouWillLearn.slice(0, 3).map((pt, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-tight">{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
            {enrolled ? (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(`/student/course/${course.id}`);
                }}
              >
                Resume Learning &rarr;
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (inCart) {
                    navigate('/cart');
                  } else {
                    addToCart(course.id);
                    showToast('success', `Added "${course.title}" to your cart!`);
                  }
                }}
              >
                {inCart ? 'View in Cart' : 'Add to Cart'}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/course/${course.slug}`);
              }}
            >
              View Full Syllabus
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
