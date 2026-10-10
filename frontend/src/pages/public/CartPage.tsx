import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Heart,
  ShieldCheck,
  Tag,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Percent
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCourses } from '../../context/CourseContext';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { cartCourseIds, removeFromCart, appliedCoupon, applyCoupon, removeCoupon, subtotal, discount, total } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { courses } = useCourses();
  const { showToast } = useNotifications();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; text?: string } | null>(null);

  const cartCourses = courses.filter(c => cartCourseIds.some(id => String(id) === String(c.id)));

  const handleApplyCoupon = async (e: React.FormEvent, codeToApply?: string) => {
    if (e) e.preventDefault();
    const targetCode = codeToApply || couponInput;
    if (!targetCode.trim()) return;
    const res = await applyCoupon(targetCode.trim());
    setCouponFeedback({ success: res.success, text: res.message });
    if (res.success) {
      setCouponInput('');
      showToast('success', `Coupon ${targetCode.toUpperCase()} applied! You saved on this order.`);
    } else {
      showToast('error', res.message);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponFeedback(null);
    showToast('info', 'Coupon removed from order.');
  };

  const handleRemoveFromCart = (courseId: string, title: string) => {
    removeFromCart(courseId);
    showToast('info', `Removed "${title}" from your cart.`);
  };

  const handleMoveToWishlist = (courseId: string, title: string) => {
    if (!isInWishlist(courseId)) {
      toggleWishlist(courseId);
    }
    removeFromCart(courseId);
    showToast('success', `Moved "${title}" to your saved wishlist.`);
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

      <div className="pb-6 border-b border-slate-200 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {cartCourses.length} {cartCourses.length === 1 ? 'masterclass item' : 'masterclass items'} ready for checkout
          </p>
        </div>

        {cartCourses.length > 0 && (
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Guaranteed Secure 256-Bit SSL Checkout</span>
          </div>
        )}
      </div>

      {cartCourses.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-slate-300 rounded-lg bg-slate-50/50 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">Your cart is currently empty</h3>
          <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Browse our catalog of accredited practical curricula and add masterclasses to build real production skills.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/courses">
              <Button variant="primary" size="md">
                Browse Masterclasses &rarr;
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
                  <Link to={`/course/${course.slug}`} className="w-28 aspect-video rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
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
                    <p className="text-xs text-slate-500 mt-0.5">{course.subcategory} &bull; {course.level}</p>

                    <div className="mt-3 flex items-center gap-4 text-xs">
                      <button
                        type="button"
                        onClick={() => handleRemoveFromCart(course.id, course.title)}
                        className="text-rose-700 hover:underline inline-flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveToWishlist(course.id, course.title)}
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
            <div className="p-6 border border-slate-200 rounded-lg bg-white space-y-4 shadow-xs">
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900 font-display">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs text-slate-600 border-b border-slate-100 pb-3">
                <div className="flex justify-between items-center">
                  <span>Gross Tuition Subtotal:</span>
                  <span className="font-semibold text-slate-900 tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-emerald-800 font-semibold bg-emerald-50/50 p-1.5 rounded">
                    <span>Coupon ({appliedCoupon.code} - {appliedCoupon.discountPercent}% off):</span>
                    <span className="tabular-nums">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-sm font-bold text-slate-950 pt-2 border-t border-slate-100">
                  <span>Total Payable:</span>
                  <span className="tabular-nums text-lg font-display text-emerald-900">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Button
                variant="primary"
                size="lg"
                className="w-full shadow-xs"
                onClick={() => {
                  if (!currentUser) {
                    navigate('/signin?redirect=/checkout');
                  } else {
                    navigate('/checkout');
                  }
                }}
              >
                Proceed to Checkout &rarr;
              </Button>

              {/* Coupon Field */}
              <div className="pt-2">
                {appliedCoupon ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md flex items-center justify-between text-xs text-emerald-950 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Applied: <strong>{appliedCoupon.code}</strong></span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-rose-700 hover:underline text-[11px] font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <form onSubmit={(e) => handleApplyCoupon(e)} className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          placeholder="Enter coupon code"
                          className="flex-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 uppercase focus:outline-none focus:ring-1 focus:ring-emerald-700 font-mono"
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

                    {/* Quick Available Promo Pills */}
                    <div className="pt-1">
                      <span className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase tracking-wider">
                        Available Coupons:
                      </span>
                      <div className="flex gap-1.5 flex-wrap">
                        {['WELCOME50', 'PRAKASH20'].map(code => (
                          <button
                            key={code}
                            type="button"
                            onClick={(e) => handleApplyCoupon(e as any, code)}
                            className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 text-slate-600 transition-colors"
                          >
                            +{code}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                  <span>30-Day Unconditional Money-Back Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Permanent lifetime access & repo updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
