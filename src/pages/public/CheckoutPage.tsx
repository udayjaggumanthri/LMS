import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, Smartphone, Building, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLearning } from '../../context/LearningContext';
import { useAuth } from '../../context/AuthContext';
import { useCourses } from '../../context/CourseContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Order, OrderItem } from '../../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartCourseIds, subtotal, discount, total, appliedCoupon, clearCart } = useCart();
  const { addOrder } = useLearning();
  const { currentUser } = useAuth();
  const { courses } = useCourses();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [fullName, setFullName] = useState(currentUser?.name || 'Arjun Nambiar');
  const [email, setEmail] = useState(currentUser?.email || 'student@prajnadhara.edu');
  const [billingCountry, setBillingCountry] = useState('India');
  const [billingState, setBillingState] = useState('Karnataka');

  // Payment method specific fields
  const [upiId, setUpiId] = useState('arjun@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8912');
  const [cardExp, setCardExp] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('321');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);

  const cartCourses = courses.filter(c => cartCourseIds.includes(c.id));

  if (cartCourses.length === 0) {
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

  const handleCompleteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const orderNumber = `PJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const orderItems: OrderItem[] = cartCourses.map(c => ({
        courseId: c.id,
        courseTitle: c.title,
        thumbnail: c.thumbnail,
        price: c.price,
        instructorName: 'Faculty'
      }));

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        userId: currentUser?.id || 'user-student-1',
        items: orderItems,
        subtotal,
        discount,
        total,
        couponCode: appliedCoupon?.code,
        paymentMethod,
        status: 'completed',
        createdAt: new Date().toISOString().split('T')[0],
        invoiceNumber
      };

      addOrder(newOrder);
      clearCart();
      setIsProcessing(false);
      navigate(`/order-confirmation?orderId=${newOrder.id}`);
    }, 700);
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
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  State / Region
                </label>
                <input
                  type="text"
                  required
                  value={billingState}
                  onChange={(e) => setBillingState(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="p-6 border border-slate-200 rounded bg-white space-y-5">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
              2. Select Payment Method
            </h3>

            {/* Payment Method Radio Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded border text-center transition-colors min-h-[48px] flex sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-0 ${
                  paymentMethod === 'upi'
                    ? 'border-emerald-800 bg-emerald-50/50 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 sm:mx-auto sm:mb-1 text-emerald-800 shrink-0" />
                <div className="text-left sm:text-center">
                  <span className="text-xs block">UPI / QR</span>
                  <span className="text-[10px] text-slate-400 font-normal">GPay, PhonePe, Paytm</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded border text-center transition-colors min-h-[48px] flex sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-0 ${
                  paymentMethod === 'card'
                    ? 'border-emerald-800 bg-emerald-50/50 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4 sm:mx-auto sm:mb-1 text-emerald-800 shrink-0" />
                <div className="text-left sm:text-center">
                  <span className="text-xs block">Cards</span>
                  <span className="text-[10px] text-slate-400 font-normal">Visa, Mastercard, RuPay</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-3 rounded border text-center transition-colors min-h-[48px] flex sm:flex-col items-center justify-start sm:justify-center gap-3 sm:gap-0 ${
                  paymentMethod === 'netbanking'
                    ? 'border-emerald-800 bg-emerald-50/50 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Building className="w-4 h-4 sm:mx-auto sm:mb-1 text-emerald-800 shrink-0" />
                <div className="text-left sm:text-center">
                  <span className="text-xs block">Net Banking</span>
                  <span className="text-[10px] text-slate-400 font-normal">All Indian Banks</span>
                </div>
              </button>
            </div>

            {/* UPI Form */}
            {paymentMethod === 'upi' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3 text-xs">
                <Input
                  label="Virtual Payment Address (VPA / UPI ID)"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. username@okhdfcbank"
                  helper="A collect request will be sent to your UPI application."
                />
              </div>
            )}

            {/* Card Form */}
            {paymentMethod === 'card' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-3 text-xs">
                <Input
                  label="Card Number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="•••• •••• •••• ••••"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Expiration Date (MM/YY)"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    placeholder="MM/YY"
                  />
                  <Input
                    label="CVV / CVC"
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                  />
                </div>
              </div>
            )}

            {/* Net Banking Form */}
            {paymentMethod === 'netbanking' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Select Your Bank
                </label>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                  <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}
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
                    {c.isFree ? 'Free' : `₹${c.price.toLocaleString('en-IN')}`}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Coupon ({appliedCoupon.code}):</span>
                  <span className="tabular-nums">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline text-base font-bold text-slate-950 pt-2 border-t border-slate-100">
                <span>Total to Pay:</span>
                <span className="tabular-nums text-lg text-emerald-950">₹{total.toLocaleString('en-IN')}</span>
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
              Complete Purchase (₹{total.toLocaleString('en-IN')}) &rarr;
            </Button>

            <div className="text-center text-[11px] text-slate-500 leading-relaxed pt-2">
              By placing this order, you agree to the{' '}
              <Link to="/terms" className="underline hover:text-slate-800">Terms of Service</Link> and{' '}
              <Link to="/refund-policy" className="underline hover:text-slate-800">30-Day Refund Policy</Link>.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
