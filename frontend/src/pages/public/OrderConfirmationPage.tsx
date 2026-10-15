import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, PlayCircle, Loader2 } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { Button } from '../../components/ui/Button';
import { TaxInvoiceModal } from '../../components/orders/TaxInvoiceSheet';
import { CourseCover } from '../../components/courses/CourseCover';
import { orderService } from '../../api/orderService';

export const OrderConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  // Parse query parameters from both searchParams and hash (for ToucanPay redirects)
  const hash = window.location.hash || '';
  const hashQueryStr = hash.includes('?') ? hash.split('?')[1] : (hash.startsWith('#/') ? '' : hash.replace(/^#/, ''));
  const hashParams = new URLSearchParams(hashQueryStr);

  let rawInvoice = searchParams.get('invoice') || hashParams.get('invoice') || hashParams.get('invoiceNumber');
  let rawOrderId = searchParams.get('orderId') || hashParams.get('orderId') || hashParams.get('o');

  // Handle base64 encoded data parameter from ToucanPay dashboard/shoppingcart redirect
  const rawData = searchParams.get('data') || hashParams.get('data');
  if (rawData && !rawInvoice) {
    try {
      const decoded = atob(rawData);
      const inner = new URLSearchParams(decoded);
      rawInvoice = inner.get('invoiceNumber') || inner.get('invoice') || inner.get('o') || rawInvoice;
    } catch (e) {
      console.warn('Could not decode Toucan data parameter:', e);
    }
  }

  const invoice = rawInvoice;
  const orderId = rawOrderId;
  const unmatched = searchParams.get('unmatched') === '1';

  const { orders, addOrder, refreshLearning } = useLearning();

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState<any>(null);
  const [verifyError, setVerifyError] = useState('');

  const matchedOrder = (orderId || invoice)
    ? (fetchedOrder || orders.find(o => (orderId && String(o.id) === String(orderId)) || (invoice && o.invoiceNumber === invoice)))
    : fetchedOrder;

  const addOrderRef = useRef(addOrder);
  const refreshLearningRef = useRef(refreshLearning);
  addOrderRef.current = addOrder;
  refreshLearningRef.current = refreshLearning;

  useEffect(() => {
    if (!invoice && !orderId) return;
    let cancelled = false;
    setLoading(true);
    setVerifyError('');
    orderService.verifyToucanPayment({
      invoiceNumber: invoice || undefined,
      orderId: orderId || undefined,
    })
      .then((res) => {
        if (cancelled) return;
        if (res.success && res.order) {
          setFetchedOrder(res.order);
          addOrderRef.current(res.order);
          refreshLearningRef.current();
          return;
        }
        setVerifyError(res.error || 'Payment is not confirmed yet.');
      })
      .catch((err) => {
        if (!cancelled) {
          setVerifyError(err?.response?.data?.error || 'Payment is not confirmed yet.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [invoice, orderId]);

  const order = matchedOrder;

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
        <h2 className="text-lg font-bold font-display text-slate-900">Verifying ToucanPay Payment...</h2>
        <p className="text-xs text-slate-500 mt-1">Confirming transaction with merchant gateway...</p>
      </div>
    );
  }

  if (verifyError && !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold font-display text-slate-900">Payment not confirmed</h2>
        <p className="text-xs text-slate-500 mt-2 mb-4">{verifyError}</p>
        <Button
          variant="primary"
          size="sm"
          disabled={loading}
          onClick={() => {
            setVerifyError('');
            setLoading(true);
            orderService.verifyToucanPayment({
              invoiceNumber: invoice || undefined,
              orderId: orderId || undefined,
            })
              .then((res) => {
                if (res.success && res.order) {
                  setFetchedOrder(res.order);
                  addOrder(res.order);
                  refreshLearning();
                }
              })
              .catch((err) => {
                setVerifyError(err?.response?.data?.error || 'Payment is not confirmed yet.');
              })
              .finally(() => setLoading(false));
          }}
        >
          Check with Toucan
        </Button>
        <Link to="/checkout" className="block mt-3 text-sm font-semibold text-emerald-800">Return to checkout</Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold font-display text-slate-900">
          {unmatched || (!invoice && !orderId) ? 'Payment return received' : 'Order Not Found'}
        </h2>
        <p className="text-xs text-slate-500 mt-2 mb-4">
          {unmatched || (!invoice && !orderId)
            ? 'The gateway sent you back without an order reference. Log in and open Purchase history. A successful payment is listed there.'
            : 'No active or matching order found for this reference.'}
        </p>
        <Link to="/" className="inline-block">
          <Button variant="outline" size="sm">Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-left text-slate-900">
      {/* Success Hero Header */}
      <div className="p-8 border border-slate-200 rounded bg-slate-50 mb-8 text-center space-y-3">
        <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-950">
          Order Confirmed & Provisioned
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
          Thank you for investing in your skills. Lifetime access to your enrolled masterclasses has been instantly unlocked in your account.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3 text-xs text-slate-500">
          <span>Order Reference: <strong className="text-slate-900 font-mono">{order.orderNumber}</strong></span>
          <span aria-hidden="true">·</span>
          <span>Date: <strong className="text-slate-900">{order.createdAt}</strong></span>
        </div>
      </div>

      {/* Enrolled Courses Direct Access Grid */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold font-display text-slate-900 uppercase tracking-wider text-xs">
            Your Newly Enrolled Masterclasses
          </h2>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={() => setInvoiceModalOpen(true)}
          >
            View Tax Invoice
          </Button>
        </div>

        <div className="space-y-4">
          {(order.items || []).map((item: any) => (
            <div
              key={item.courseId}
              className="p-5 border border-slate-200 rounded bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 aspect-video rounded overflow-hidden border border-slate-200 shrink-0">
                  <CourseCover
                    title={item.courseTitle}
                    category={item.category || item.subcategory}
                    thumbnail={item.thumbnail}
                    size="sm"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{item.courseTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Lifetime Access · Full Syllabus Unlocked</p>
                </div>
              </div>

              <Link to={`/student/course/${item.courseId}`} className="shrink-0 w-full sm:w-auto">
                <Button variant="primary" size="sm" className="w-full sm:w-auto" leftIcon={<PlayCircle className="w-4 h-4" />}>
                  Start Learning Now &rarr;
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Order Payment Summary Card */}
      <div className="p-6 border border-slate-200 rounded bg-white text-xs">
        <h3 className="font-bold uppercase tracking-wider text-slate-900 mb-4 text-[11px]">
          Payment Receipt Breakdown
        </h3>
        <div className="space-y-2 border-b border-slate-100 pb-3 text-slate-600">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="font-semibold text-slate-900 uppercase">{order.paymentMethod || 'Online'}</span>
          </div>
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="tabular-nums font-semibold text-slate-900">₹{Number(order.subtotal || order.total || 0).toLocaleString('en-IN')}</span>
          </div>
          {Number(order.discount || 0) > 0 && (
            <div className="flex justify-between text-emerald-800 font-semibold">
              <span>Discount ({order.couponCode || 'PROMO'}):</span>
              <span className="tabular-nums">-₹{Number(order.discount).toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-slate-950 pt-2 border-t border-slate-100">
            <span>Total Paid (INR):</span>
            <span className="tabular-nums">₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="pt-3 text-[11px] text-slate-500">
          Protected by our 30-Day Money-Back Guarantee. You may request a refund from your student account until 30 days after purchase.
        </div>
      </div>

      <TaxInvoiceModal
        orderId={invoiceModalOpen ? order.id : null}
        onClose={() => setInvoiceModalOpen(false)}
      />
    </div>
  );
};
