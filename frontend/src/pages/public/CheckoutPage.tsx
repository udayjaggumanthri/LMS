import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Smartphone, Building, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLearning } from '../../context/LearningContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { orderService } from '../../api/orderService';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paymentReturn = searchParams.get('status');
  const { cartItems, cartReady, subtotal, discount, total, appliedCoupon } = useCart();
  const { isEnrolled, refreshLearning } = useLearning();
  const { currentUser } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<'toucanpay' | 'upi' | 'card' | 'netbanking'>('toucanpay');
  const [fullName, setFullName] = useState(currentUser?.name || (currentUser as any)?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState('');
  const [billingCountry, setBillingCountry] = useState('India');
  const [billingState, setBillingState] = useState('Karnataka');

  // Payment method specific fields
  const [upiId, setUpiId] = useState('learner@upi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [cardExp, setCardExp] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('321');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(
    paymentReturn === 'cancelled' || paymentReturn === 'failed'
      ? 'Payment was not completed. The course stays in your cart until ToucanPay confirms payment.'
      : ''
  );

  useEffect(() => {
    if (!currentUser) return;
    if (paymentReturn !== 'cancelled' && paymentReturn !== 'failed') return;
    const orderId = searchParams.get('orderId') || undefined;
    const invoiceNumber = searchParams.get('invoice') || undefined;
    if (!orderId && !invoiceNumber) return;
    orderService.abandonToucanPayment({ orderId, invoiceNumber })
      .then(() => refreshLearning())
      .catch(() => undefined);
  }, [paymentReturn, currentUser, refreshLearning, searchParams]);

  const cartCourses = cartItems;
  const validCoursesToBuy = cartCourses.filter(c => !isEnrolled(c.id));
  const alreadyEnrolledCourses = cartCourses.filter(c => isEnrolled(c.id));

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900">Sign in to complete your enrollment</h2>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          Please log in or create your learner account to secure your courses, generate tax invoices, and access lecture materials.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link to="/signin?redirect=/checkout">
            <Button variant="primary" size="md" className="w-full justify-center">
              Sign In to Checkout &rarr;
            </Button>
          </Link>
          <Link to="/signup?redirect=/checkout">
            <Button variant="outline" size="md" className="w-full justify-center">
              Create New Learner Account
            </Button>
          </Link>
        </div>
        <div className="mt-4">
          <Link to="/cart" className="text-xs text-slate-500 hover:underline">
            &larr; Back to Cart
          </Link>
        </div>
      </div>
    );
  }

  if (!cartReady) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center text-sm text-slate-500">
        Loading your cart…
      </div>
    );
  }

  if (cartCourses.length === 0 || validCoursesToBuy.length === 0) {
    if (alreadyEnrolledCourses.length > 0 && validCoursesToBuy.length === 0) {
      return (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900">Already Enrolled</h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            You already have active lifetime access to all selected masterclass(es). No duplicate payment is required.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/student/learning">
              <Button variant="primary" size="md">
                Go to My Learning &rarr;
              </Button>
            </Link>
            <Link to="/courses">
              <Button variant="outline" size="md">
                Explore Catalog
              </Button>
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold font-display text-slate-900">Your Cart is Empty</h2>
        <p className="mt-2 text-xs text-slate-500">Add at least one course before checking out.</p>
        <Link to="/courses" className="mt-4 inline-block">
          <Button variant="primary" size="sm">
            Browse Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    const digits = phone.replace(/\D/g, '').slice(-10);
    if (digits.length !== 10) {
      setErrorMessage('Enter the 10-digit mobile number for this payment.');
      setIsProcessing(false);
      return;
    }

    try {
      const targetCourseIds = validCoursesToBuy.map(c => c.id);
      const toucanRes = await orderService.initiateToucanPayment({
        courseIds: targetCourseIds,
        couponCode: appliedCoupon?.code,
        name: fullName,
        phone: digits,
        email: email
      });

      if ((toucanRes as any)?.free) {
        window.location.href = `/order-confirmation?orderId=${(toucanRes as any).orderId}`;
        return;
      }
      const redirectUrl = toucanRes?.redirectUrl || '';
      if (redirectUrl.startsWith('http') && !redirectUrl.includes('/auth/failure/')) {
        setIsRedirecting(true);
        window.location.href = redirectUrl;
        return;
      } else {
        setErrorMessage((toucanRes as any)?.error || (toucanRes as any)?.notice || 'ToucanPay payment session initiation failed. Please verify credentials.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.error || 
        err?.message || 
        'Unable to initialize Toucan Payments gateway. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-left text-slate-900">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Cart', href: '/cart' },
          { label: 'Checkout' }
        ]}
        className="mb-6"
      />

      <div className="pb-6 border-b border-slate-200 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Secure Checkout
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            100% encrypted transaction with instant lifetime course provisioning
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
          <Lock className="w-3.5 h-3.5" />
          <span>256-Bit SSL Encrypted</span>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage('')} className="text-rose-600 hover:text-rose-900 font-bold text-base">&times;</button>
        </div>
      )}

      {isRedirecting && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center space-y-4 border border-emerald-500/20">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-950">
              Connecting to ToucanPay
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Redirecting you to the official ToucanPay secure checkout page... Please do not refresh or close this browser window.
            </p>
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-800 font-semibold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
              256-Bit SSL Encrypted Session
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Billing Details & Payment Options */}
        <div className="lg:col-span-7 space-y-8">
          {/* Billing Info */}
          <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
              1. Customer & Billing Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <Input
                label="Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <Input
                label="Email Address (Receipt & Login)"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Mobile Phone (for Payment OTP & SMS)"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
              />
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Country
                </label>
                <select
                  value={billingCountry}
                  onChange={(e) => setBillingCountry(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Singapore">Singapore</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 border border-slate-200 rounded bg-white space-y-5">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
              2. Select Payment Method
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              <div
                className="p-3.5 rounded-lg border text-left sm:col-span-3 flex items-center justify-between border-emerald-700 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-emerald-700 text-white font-bold flex items-center justify-center text-xs tracking-wider shrink-0">
                    TP
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">ToucanPay Official Gateway</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Recommended
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal block">
                      All UPI apps, RuPay, Visa, Mastercard &amp; NetBanking via Toucan Payments
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block text-right">
                  <span className="text-[10px] font-semibold text-emerald-800 block">Instant &amp; Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Final Payment Button */}
        <div className="lg:col-span-5">
          <div className="p-6 border border-slate-200 rounded bg-white space-y-5 sticky top-20">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
              Order Summary ({cartCourses.length} Items)
            </h3>

            {/* Item Mini List */}
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto pr-1">
              {cartCourses.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{c.title}</div>
                    <div className="text-[11px] text-slate-500">{c.subcategory}</div>
                  </div>
                  <div className="font-bold tabular-nums text-slate-900 shrink-0">
                    {c.isFree ? 'Free' : `₹${Number(c.price || 0).toLocaleString('en-IN')}`}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 tabular-nums">₹{Number(subtotal || 0).toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Coupon ({appliedCoupon.code}):</span>
                  <span className="tabular-nums">-₹{Number(discount || 0).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline text-base font-bold text-slate-950 pt-2 border-t border-slate-100">
                <span>Total to Pay:</span>
                <span className="tabular-nums text-lg text-emerald-950">₹{Number(total || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Authorize & Pay CTA */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isProcessing}
            >
              Complete Purchase (₹{Number(total || 0).toLocaleString('en-IN')}) &rarr;
            </Button>

            <div className="text-center text-[11px] text-slate-500 leading-relaxed pt-2">
              By placing this order, you agree to the{' '}
              <Link to="/terms" className="underline hover:text-slate-800">Terms of Service</Link> and{' '}
              <Link to="/privacy" className="underline hover:text-slate-800">Privacy Policy</Link>.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
