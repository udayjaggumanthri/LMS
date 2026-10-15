import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { orderService } from '../../api/orderService';
import { Button } from '../../components/ui/Button';
import { TaxInvoiceModal } from '../../components/orders/TaxInvoiceSheet';
import { Table, Column } from '../../components/ui/Table';
import { Order } from '../../types';
import { FileText, CheckCircle2 } from 'lucide-react';

const STATUS_LABEL: Record<string, string> = {
  completed: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const PurchaseHistoryPage: React.FC = () => {
  const { orders, addOrder, refreshLearning } = useLearning();
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);
  const [checkingId, setCheckingId] = useState<string | number | null>(null);
  const [checkNote, setCheckNote] = useState('');

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
          {o.items.map((it) => (
            <div key={it.courseId} className="flex items-center justify-between gap-4">
              <span className="truncate max-w-xs font-medium text-slate-800">{it.courseTitle}</span>
              <span className="tabular-nums text-slate-500 font-mono text-xs">₹{it.price.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'total',
      header: 'Amount',
      align: 'right',
      render: (o) => (
        <span className="font-bold text-slate-900 tabular-nums">
          ₹{Number(o.total || 0).toLocaleString('en-IN')}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => (
        <div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border inline-flex items-center gap-1 ${
            o.status === 'completed'
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {o.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
            {STATUS_LABEL[o.status] || o.status}
          </span>
          {o.status !== 'completed' && o.status !== 'refunded' && (
            <div className="text-[10px] text-slate-500 mt-1">Course not unlocked yet</div>
          )}
        </div>
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
        <div className="flex justify-end gap-2">
          {o.status === 'completed' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrderForInvoice(o)}
              leftIcon={<FileText className="w-3.5 h-3.5" />}
            >
              Invoice
            </Button>
          ) : null}
          <Button
            variant="outline"
            size="sm"
            disabled={checkingId === o.id}
            onClick={async () => {
              setCheckingId(o.id);
              setCheckNote('');
              try {
                const result = await orderService.verifyToucanPayment({ orderId: o.id });
                if (result.success && result.order) {
                  addOrder(result.order);
                  refreshLearning();
                  setCheckNote('Toucan confirmed this payment.');
                } else {
                  setCheckNote('Toucan has not confirmed this payment.');
                }
              } catch (err: any) {
                setCheckNote(err?.response?.data?.error || 'Toucan has not confirmed this payment.');
              } finally {
                setCheckingId(null);
              }
            }}
          >
            {checkingId === o.id ? 'Checking…' : 'Check with Toucan'}
          </Button>
        </div>
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
          Review all course transactions, download official tax receipts, and verified purchase records
        </p>
      </div>

      {checkNote ? <p className="text-xs text-slate-600">{checkNote}</p> : null}
      <Table
        columns={columns}
        data={orders}
        keyExtractor={(o) => o.id}
        pageSize={10}
      />

      <TaxInvoiceModal
        orderId={selectedOrderForInvoice?.id ?? null}
        onClose={() => setSelectedOrderForInvoice(null)}
      />
    </div>
  );
};
