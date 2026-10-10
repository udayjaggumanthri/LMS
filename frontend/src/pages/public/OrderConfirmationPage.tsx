import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Download, PlayCircle, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Logo } from '../../components/common/Logo';
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

  const { orders, addOrder, refreshLearning } = useLearning();
  const { currentUser } = useAuth();

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchedOrder, setFetchedOrder] = useState<any>(null);

  // Match by explicit invoice or orderId first, then fallback to fetched, then cached
  const matchedOrder = (orderId || invoice)
    ? (orders.find(o => (orderId && String(o.id) === String(orderId)) || (invoice && (o.invoiceNumber === invoice || (o as any).paymentId === invoice))) || fetchedOrder)
    : (fetchedOrder || orders[0]);

  useEffect(() => {
    if (invoice || orderId) {
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
          console.warn('Payment verification notice:', err);
        })
        .finally(() => setLoading(false));
    } else if (!matchedOrder && currentUser) {
      // If user landed here without params, fetch their latest order
      setLoading(true);
      orderService.getMyOrders()
        .then((myOrders) => {
          if (myOrders && myOrders.length > 0) {
            setFetchedOrder(myOrders[0]);
            addOrder(myOrders[0]);
            refreshLearning();
          }
        })
        .catch((err) => {
          console.warn('Failed to load user orders:', err);
        })
        .finally(() => setLoading(false));
    }
  }, [invoice, orderId, currentUser, addOrder, refreshLearning]);

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

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold font-display text-slate-900">Order Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 mb-4">No active or matching order found for this reference.</p>
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
                <img
                  src={item.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'}
                  alt={item.courseTitle}
                  className="w-20 aspect-video rounded object-cover border border-slate-200 shrink-0"
                />
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

      {/* Invoice Modal */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        title="Official Tax Invoice"
        size="lg"
      >
        <div className="p-6 border border-slate-200 rounded bg-white text-xs space-y-6 text-slate-900">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <Logo size="md" />
            <div className="text-right">
              <div className="font-bold text-sm text-slate-900">{order.invoiceNumber}</div>
              <div className="text-slate-500">{order.createdAt}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">Billed To</div>
              <div className="font-bold text-slate-900">{currentUser?.name || (currentUser as any)?.username || 'Verified Learner'}</div>
              <div className="text-slate-500">{currentUser?.email || 'learner@prajnadhara.edu'}</div>
              <div className="text-slate-500">Bengaluru, Karnataka, India</div>
            </div>
            <div className="text-right">
              <div className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-1">Issued By</div>
              <div className="font-bold text-slate-900">PrajnadharaEdu Marketplace</div>
              <div className="text-slate-500">GSTIN: 29AABCP1234F1Z8</div>
              <div className="text-slate-500">Outer Ring Road, Bengaluru 560103</div>
            </div>
          </div>

          <table className="w-full text-left border-t border-b border-slate-200 py-2">
            <thead>
              <tr className="text-slate-400 uppercase text-[10px]">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(order.items || []).map((it: any) => (
                <tr key={it.courseId}>
                  <td className="py-2 font-medium">{it.courseTitle}</td>
                  <td className="py-2 text-right tabular-nums">₹{Number(it.price || it.price_at_purchase || 0).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between font-bold text-sm pt-2">
            <span>Total Paid:</span>
            <span className="tabular-nums">₹{Number(order.total || 0).toLocaleString('en-IN')}</span>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
            This is a computer-generated tax invoice for online education services rendered under Section 9(5) of the CGST Act.
          </div>
        </div>
      </Modal>
    </div>
  );
};
