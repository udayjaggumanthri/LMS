import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Order, RefundRequest } from '../../types';

export const AdminOrdersRefundsPage: React.FC = () => {
  const { orders, refundRequests, approveRefund, rejectRefund } = useLearning();
  const [activeTab, setActiveTab] = useState<'refunds' | 'orders'>('refunds');

  const pendingRefunds = refundRequests.filter(r => r.status === 'pending');

  const orderColumns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Order Ref',
      render: (o) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
          <div className="text-[10px] text-slate-400">{o.createdAt}</div>
        </div>
      )
    },
    {
      key: 'userId',
      header: 'Buyer ID',
      render: (o) => <span className="font-mono text-slate-600">{o.userId}</span>
    },
    {
      key: 'items',
      header: 'Items Count',
      align: 'center',
      render: (o) => <span className="tabular-nums font-semibold">{o.items.length} courses</span>
    },
    {
      key: 'total',
      header: 'Gross Total (INR)',
      align: 'right',
      render: (o) => <span className="font-bold text-slate-900 tabular-nums">₹{o.total.toLocaleString('en-IN')}</span>
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (o) => <span className="uppercase text-[11px] font-medium text-slate-600">{o.paymentMethod}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => (
        <Badge variant={o.status === 'completed' ? 'success' : 'danger'}>
          {o.status}
        </Badge>
      )
    }
  ];

  const refundColumns: Column<RefundRequest>[] = [
    {
      key: 'orderId',
      header: 'Claim Details',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-900">{r.courseTitle}</div>
          <div className="text-[11px] text-slate-500">Learner: {r.userName} ({r.userEmail})</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Refund Amount',
      align: 'right',
      render: (r) => <span className="font-bold text-rose-700 tabular-nums">₹{r.amount.toLocaleString('en-IN')}</span>
    },
    {
      key: 'reason',
      header: 'Learner Reason',
      render: (r) => <span className="text-slate-700 line-clamp-2">{r.reason}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <Badge
          variant={
            r.status === 'approved'
              ? 'success'
              : r.status === 'pending'
              ? 'warning'
              : 'danger'
          }
        >
          {r.status}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (r) => <span className="text-slate-500">{r.createdAt}</span>
    },
    {
      key: 'actions',
      header: 'Resolution',
      align: 'right',
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          {r.status === 'pending' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const reason = prompt('Rejection rationale:') || undefined;
                  rejectRefund(r.id, reason);
                }}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-800 hover:bg-emerald-900"
                onClick={() => approveRefund(r.id)}
              >
                Approve & Refund
              </Button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 capitalize">Settled ({r.status})</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Marketplace Orders & 30-Day Refunds
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit customer payments and process student money-back guarantee claims
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded text-xs">
          <button
            onClick={() => setActiveTab('refunds')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'refunds' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Refund Claims ({refundRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'orders' ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Orders ({orders.length})
          </button>
        </div>
      </div>

      {activeTab === 'refunds' ? (
        <Table
          columns={refundColumns}
          data={refundRequests}
          keyExtractor={(r) => r.id}
          pageSize={10}
        />
      ) : (
        <Table
          columns={orderColumns}
          data={orders}
          keyExtractor={(o) => o.id}
          pageSize={10}
        />
      )}
    </div>
  );
};
