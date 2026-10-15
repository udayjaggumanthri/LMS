import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Clock, BarChart2, Check } from 'lucide-react';
import { Course } from '../../types';
import { Rating } from './Rating';
import { Badge } from './Badge';
import { CartAuthError, useCart } from '../../context/CartContext';
import { apiErrorMessage } from '../../api/client';
import { useWishlist } from '../../context/WishlistContext';
import { useNotifications } from '../../context/NotificationContext';
import { useLearning } from '../../context/LearningContext';
import { CourseCover } from '../courses/CourseCover';

interface CourseCardProps {
  course: Course;
  className?: string;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  className = ''
}) => {
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useNotifications();
  const { isEnrolled } = useLearning();
  const instructorName = typeof course.instructor === 'object' && course.instructor?.name
    ? course.instructor.name
    : (typeof course.instructor === 'object' && (course.instructor as any)?.username
      ? (course.instructor as any).username
      : 'Prajnadhara Faculty');
  const isWishlisted = isInWishlist(course.id);
  const inCart = isInCart(course.id);
  const enrolled = isEnrolled(course.id);

  const primaryBadge = course.badges && course.badges.length > 0 ? course.badges[0] : null;

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (course.isFree || course.price === 0) {
      navigate(`/course/${course.slug}`);
      return;
    }
    if (inCart) {
      navigate('/cart');
      return;
    }
    try {
      await addToCart(course.id);
      showToast('success', `Added "${course.title}" to your cart.`);
    } catch (err) {
      if (err instanceof CartAuthError) {
        navigate(`/signin?redirect=${encodeURIComponent(`/course/${course.slug}`)}`);
        return;
      }
      showToast('error', apiErrorMessage(err, 'Could not add this course to the cart.'));
    }
  };

  return (
    <div
      className={`relative group bg-white border border-slate-200 rounded flex flex-col text-left transition-colors duration-150 hover:border-slate-300 ${className}`}
    >
      {/* 16:9 Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100 rounded-t">
        <Link to={`/course/${course.slug}`} className="block w-full h-full">
          <CourseCover
            title={course.title}
            category={course.subcategory}
            categoryId={course.categoryId}
            thumbnail={course.thumbnail}
            className="transition-transform duration-200 group-hover:scale-[1.02]"
          />
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
              <span className="tabular-nums">
                {(course.durationHours || 0) > 0
                  ? `${course.durationHours}h total`
                  : (course.durationWeeks || 0) > 0
                    ? `${course.durationWeeks} weeks`
                    : '—'}
              </span>
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
            onClick={handleAddToCart}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 transition-colors"
          >
            {course.isFree || course.price === 0 ? 'Register' : inCart ? 'In cart' : 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
