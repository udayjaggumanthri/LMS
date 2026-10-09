import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { Order } from '../../types';
import { FileText, RotateCcw, CheckCircle2, ShieldAlert } from 'lucide-react';

export const PurchaseHistoryPage: React.FC = () => {
  const { orders, refundRequests, requestRefund } = useLearning();

  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [selectedCourseForRefund, setSelectedCourseForRefund] = useState<{
    orderId: string;
    courseId: string;
    courseTitle: string;
    amount: number;
  } | null>(null);

  const [refundReason, setRefundReason] = useState('Course content did not match my expectations');
  const [refundNotes, setRefundNotes] = useState('');
  const [refundResultMsg, setRefundResultMsg] = useState<{ success: boolean; message: string } | null>(null);

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForRefund) return;
    const combinedReason = `${refundReason}: ${refundNotes}`;
    const res = requestRefund(
      selectedCourseForRefund.orderId,
      selectedCourseForRefund.courseId,
      selectedCourseForRefund.courseTitle,
      selectedCourseForRefund.amount,
      combinedReason
    );
    setRefundResultMsg(res);
  };

  const columns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Order Reference',
      render: (o) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
          <div className="text-[10px] text-slate-400">{o.createdAt}</div>
        </div>
      )
    },
    {
      key: 'items',
      header: 'Purchased Courses',
      render: (o) => (
        <div className="space-y-1">
          {o.items.map((it) => {
            const hasRequestedRefund = refundRequests.some(r => r.orderId === o.id && r.courseId === it.courseId);
            return (
              <div key={it.courseId} className="flex items-center justify-between gap-4">
                <span className="truncate max-w-xs font-medium text-slate-800">{it.courseTitle}</span>
                <div className="flex items-center gap-2">
                  <span className="tabular-nums text-slate-500">₹{it.price.toLocaleString('en-IN')}</span>
                  {hasRequestedRefund ? (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      Refund Pending
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCourseForRefund({
                          orderId: o.id,
                          courseId: it.courseId,
                          courseTitle: it.courseTitle,
                          amount: it.price
                        });
                        setRefundResultMsg(null);
                      }}
                      className="text-[11px] text-rose-700 hover:underline font-semibold"
                    >
                      Request Refund
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )
    },
    {
      key: 'total',
      header: 'Total Paid',
      align: 'right',
      render: (o) => (
        <span className="font-bold text-slate-900 tabular-nums">
          ₹{o.total.toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (o) => <span className="uppercase text-[11px] text-slate-600 font-medium">{o.paymentMethod}</span>
    },
    {
      key: 'actions',
      header: 'Invoice',
      align: 'right',
      render: (o) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedOrderForInvoice(o)}
          leftIcon={<FileText className="w-3.5 h-3.5" />}
        >
          Invoice
        </Button>
      )
    }
  ];

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Purchase History & Invoices
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review all course transactions, download official tax receipts, and manage 30-day refund guarantees
        </p>
      </div>

      <Table
        columns={columns}
        data={orders}
        keyExtractor={(o) => o.id}
        pageSize={10}
      />

      {/* Invoice Modal */}
      {selectedOrderForInvoice && (
        <Modal
          isOpen={!!selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
          title={`Invoice ${selectedOrderForInvoice.invoiceNumber}`}
          size="md"
        >
          <div className="p-4 border border-slate-200 rounded text-xs space-y-4">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Order:</span>
              <span className="font-mono font-bold text-slate-900">{selectedOrderForInvoice.orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Date:</span>
              <span>{selectedOrderForInvoice.createdAt}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Payment Channel:</span>
              <span className="uppercase font-medium">{selectedOrderForInvoice.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2 font-bold text-slate-900">
              <span>Total Paid:</span>
              <span className="tabular-nums text-sm">₹{selectedOrderForInvoice.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              Print Receipt
            </Button>
          </div>
        </Modal>
      )}

      {/* Refund Request Modal */}
      {selectedCourseForRefund && (
        <Modal
          isOpen={!!selectedCourseForRefund}
          onClose={() => setSelectedCourseForRefund(null)}
          title="Request 30-Day Money-Back Guarantee Refund"
          size="md"
        >
          {refundResultMsg ? (
            <div className="p-6 text-center space-y-3 text-xs">
              <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">Refund Claim Submitted</h4>
              <p className="text-slate-600">{refundResultMsg.message}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCourseForRefund(null)}
              >
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-slate-500 block text-[11px]">Refunding Course:</span>
                <strong className="text-slate-900 block font-medium">{selectedCourseForRefund.courseTitle}</strong>
                <span className="text-emerald-800 font-bold tabular-nums">
                  Refund Amount: ₹{selectedCourseForRefund.amount.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Primary Reason for Refund
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="Course content did not match my expectations">Course content did not match my expectations</option>
                  <option value="Audio or video quality issues">Audio or video playback quality issues</option>
                  <option value="Accidental duplicate purchase">Accidental duplicate purchase</option>
                  <option value="Too advanced or too basic for current level">Too advanced or too basic for current level</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Additional Constructive Feedback for Instructor
                </label>
                <textarea
                  required
                  rows={3}
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Tell us what could be improved..."
                  className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedCourseForRefund(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="danger" size="sm">
                  Confirm Refund Request
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </div>
  );
};
