import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Order } from '../../types';
import { DollarSign, FileText, Search, Printer, CheckCircle2, ShoppingBag, CreditCard } from 'lucide-react';

export const AdminOrdersRefundsPage: React.FC = () => {
  const { orders } = useLearning();
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);

  const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + o.items.length, 0);

  const filteredOrders = orders.filter(o => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.userId.toLowerCase().includes(q) ||
      o.invoiceNumber.toLowerCase().includes(q) ||
      o.items.some(i => i.courseTitle.toLowerCase().includes(q))
    );
  });

  const orderColumns: Column<Order>[] = [
    {
      key: 'orderNumber',
      header: 'Order Reference',
      render: (o) => (
        <div>
          <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
          <div className="text-[10px] text-slate-400 tabular-nums">{o.createdAt}</div>
        </div>
      )
    },
    {
      key: 'userId',
      header: 'Buyer Account',
      render: (o) => <span className="font-mono text-slate-700 text-xs">{o.userId}</span>
    },
    {
      key: 'items',
      header: 'Purchased Masterclasses',
      render: (o) => (
        <div className="space-y-0.5 max-w-sm">
          {o.items.map((it, idx) => (
            <div key={idx} className="text-xs font-medium text-slate-900 truncate">
              • {it.courseTitle}
            </div>
          ))}
        </div>
      )
    },
    {
      key: 'total',
      header: 'Gross Total (INR)',
      align: 'right',
      sortable: true,
      render: (o) => <span className="font-bold text-slate-900 tabular-nums font-mono">₹{o.total.toLocaleString('en-IN')}</span>
    },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (o) => <span className="uppercase text-[11px] font-semibold text-slate-600">{o.paymentMethod}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => (
        <Badge variant={o.status === 'completed' ? 'success' : 'neutral'}>
          {o.status}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Invoice',
      align: 'right',
      render: (o) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInspectOrder(o)}
          leftIcon={<FileText className="w-3.5 h-3.5" />}
        >
          Receipt
        </Button>
      )
    }
  ];

  return (
    <div className="text-left space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Marketplace Orders & Invoices
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Audit platform order transactions, generate compliant tax invoices, and track revenue remittance
        </p>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Gross Marketplace GMV</div>
            <div className="text-xl font-bold font-display text-slate-900 tabular-nums">
              ₹{totalGMV.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Completed Orders</div>
            <div className="text-xl font-bold font-display text-slate-900 tabular-nums">
              {orders.length}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-amber-50 text-amber-800 flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Enrollments Remitted</div>
            <div className="text-xl font-bold font-display text-slate-900 tabular-nums">
              {totalItemsSold} Courses
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by Order ID, Buyer Account, Invoice, Course title..."
          className="w-full bg-white border border-slate-300 rounded pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
        />
      </div>

      {/* Orders Table */}
      <Table
        columns={orderColumns}
        data={filteredOrders}
        keyExtractor={(o) => o.id}
        pageSize={12}
      />

      {/* Order Invoice Inspector Modal */}
      {inspectOrder && (
        <Modal
          isOpen={!!inspectOrder}
          onClose={() => setInspectOrder(null)}
          title={`Order Tax Receipt: ${inspectOrder.invoiceNumber}`}
          size="md"
        >
          <div className="p-4 border border-slate-200 rounded text-xs space-y-4 bg-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Prajnadhara Edu Official Tax Invoice</h3>
                <p className="text-[11px] text-slate-500">GSTIN: 37AAECP1234F1Z5 • PAN: AAECP1234F</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Fully Settled
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-slate-500 block text-[11px]">Invoice ID:</span>
                <span className="font-mono font-bold text-slate-900">{inspectOrder.invoiceNumber}</span>
                <span className="text-slate-500 block text-[11px] mt-1">Order Ref:</span>
                <span className="font-mono text-slate-700">{inspectOrder.orderNumber}</span>
                <span className="text-slate-500 block text-[11px] mt-1">Learner ID:</span>
                <span className="font-mono text-slate-700">{inspectOrder.userId}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Order Date:</span>
                <span className="text-slate-800 font-medium">{inspectOrder.createdAt}</span>
                <span className="text-slate-500 block text-[11px] mt-1">Payment Method:</span>
                <span className="uppercase text-slate-800 font-semibold">{inspectOrder.paymentMethod}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Itemized Courses</h4>
              <div className="border border-slate-100 rounded overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th className="p-2 font-medium">Item Description</th>
                      <th className="p-2 text-right font-medium">Fee (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inspectOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium text-slate-800">{it.courseTitle}</td>
                        <td className="p-2 text-right font-mono text-slate-700">₹{it.price.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-sm">
              <span>Total Settlement:</span>
              <span className="tabular-nums font-mono">₹{inspectOrder.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setInspectOrder(null)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Print Receipt
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
