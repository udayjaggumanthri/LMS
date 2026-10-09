import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Heart, ShieldCheck, Tag, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCourses } from '../../context/CourseContext';
import { Button } from '../../components/ui/Button';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartCourseIds, removeFromCart, appliedCoupon, applyCoupon, removeCoupon, subtotal, discount, total } = useCart();
  const { toggleWishlist } = useWishlist();
  const { courses } = useCourses();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; text?: string } | null>(null);

  const cartCourses = courses.filter(c => cartCourseIds.includes(c.id));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    setCouponFeedback({ success: res.success, text: res.message });
    if (res.success) setCouponInput('');
  };

  const handleMoveToWishlist = (courseId: string) => {
    toggleWishlist(courseId);
    removeFromCart(courseId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 text-left text-slate-900">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Shopping Cart' }
        ]}
        className="mb-6"
      />

      <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950 mb-2">
        Shopping Cart
      </h1>
      <p className="text-xs text-slate-500 mb-8 tabular-nums">
        {cartCourses.length} {cartCourses.length === 1 ? 'course' : 'courses'} in cart
      </p>

      {cartCourses.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-300 rounded bg-slate-50/50 max-w-lg mx-auto">
          <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Your cart is currently empty</h3>
          <p className="mt-1 text-xs text-slate-500">
            Browse our 24+ practical courses and add masterclasses to build real production skills.
          </p>
          <div className="mt-5">
            <Link to="/courses">
              <Button variant="primary" size="md">
                Explore Courses &rarr;
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Cart Item List */}
          <div className="lg:col-span-8 divide-y divide-slate-200 border-t border-b border-slate-200">
            {cartCourses.map((course) => (
              <div key={course.id} className="py-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <Link to={`/course/${course.slug}`} className="w-28 aspect-video rounded overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/course/${course.slug}`}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-900 block truncate"
                    >
                      {course.title}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">{course.subcategory} · {course.level}</p>

                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <button
                        type="button"
                        onClick={() => removeFromCart(course.id)}
                        className="text-rose-700 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveToWishlist(course.id)}
                        className="text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
                      >
                        <Heart className="w-3.5 h-3.5" />
                        <span>Move to Wishlist</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="sm:text-right shrink-0">
                  <div className="text-base font-bold text-slate-900 tabular-nums">
                    {course.isFree ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}
                  </div>
                  {course.originalPrice > course.price && !course.isFree && (
                    <div className="text-xs text-slate-400 line-through tabular-nums">
                      ₹{course.originalPrice.toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary Card */}
          <div className="lg:col-span-4 sticky top-20">
            <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs text-slate-600 border-b border-slate-100 pb-3">
                <div className="flex justify-between items-center">
                  <span>Original Subtotal:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-800 font-semibold">
                    <span>Coupon ({appliedCoupon.code} - {appliedCoupon.discountPercent}% off):</span>
                    <span className="tabular-nums">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-slate-950 pt-2 border-t border-slate-100">
                  <span>Total Amount:</span>
                  <span className="tabular-nums text-base">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout &rarr;
              </Button>

              {/* Coupon Field */}
              <div className="pt-2">
                {appliedCoupon ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between text-xs text-emerald-900 font-medium">
                    <span>Applied: <strong>{appliedCoupon.code}</strong></span>
                    <button
                      onClick={removeCoupon}
                      className="text-rose-700 hover:underline text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Try WELCOME50 or PRAKASH20"
                        className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                      <Button type="submit" variant="secondary" size="sm">
                        Apply
                      </Button>
                    </div>
                    {couponFeedback && (
                      <p className={`text-[11px] ${couponFeedback.success ? 'text-emerald-700 font-semibold' : 'text-rose-600'}`}>
                        {couponFeedback.text}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Instant lifetime access unlocked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
