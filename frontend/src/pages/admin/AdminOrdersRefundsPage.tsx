import React, { useEffect, useState } from 'react';
import { orderService, AdminGatewayPayment } from '../../api/orderService';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TaxInvoiceModal } from '../../components/orders/TaxInvoiceSheet';
import { Order } from '../../types';
import { DollarSign, FileText, Search, ShoppingBag, CreditCard } from 'lucide-react';

export const AdminOrdersRefundsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<AdminGatewayPayment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);
  const [checking, setChecking] = useState(false);
  const [checkNote, setCheckNote] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    orderService.searchAdminPayments(appliedQuery)
      .then((result) => {
        if (cancelled) return;
        setOrders(Array.isArray(result.orders) ? result.orders : []);
        setPayments(Array.isArray(result.payments) ? result.payments : []);
      })
      .catch(() => {
        if (!cancelled) {
          setOrders([]);
          setPayments([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [appliedQuery, reloadKey]);

  const totalGMV = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalItemsSold = orders.reduce((sum, o) => sum + o.items.length, 0);
  const filteredOrders = orders;

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
      header: 'Buyer',
      render: (o) => (
        <div>
          <span className="font-mono text-slate-700 text-xs">{o.userEmail || o.userId}</span>
        </div>
      )
    },
    {
      key: 'gatewayInvoice',
      header: 'Transaction ID',
      render: (o) => <span className="font-mono text-xs text-slate-800">{o.gatewayInvoice || o.invoiceNumber}</span>
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
          disabled={o.status !== 'completed'}
          onClick={() => { if (o.status === 'completed') setInspectOrder(o); }}
          leftIcon={<FileText className="w-3.5 h-3.5" />}
        >
          Receipt
        </Button>
      )
    },
    {
      key: 'check',
      header: 'Status',
      align: 'right',
      render: (o) => (
        <Button
          variant="outline"
          size="sm"
          disabled={checking}
          onClick={() => checkOrder(o)}
        >
          {checking ? 'Checking…' : 'Check with Toucan'}
        </Button>
      )
    }
  ];

  const checkOrder = async (order: Order) => {
    setChecking(true);
    setCheckNote('');
    setPaymentNote('');
    try {
      const result = await orderService.checkAdminPayment({
        orderId: order.id,
        invoice: order.gatewayInvoice || undefined,
      });
      setCheckNote(result.message || (result.success ? 'Toucan confirmed this payment.' : 'Toucan has not confirmed this payment.'));
      setReloadKey((key) => key + 1);
    } catch (err: any) {
      setCheckNote(err?.response?.data?.error || 'Status check failed.');
    } finally {
      setChecking(false);
    }
  };

  const checkPayment = async (payment: AdminGatewayPayment) => {
    setChecking(true);
    setPaymentNote('');
    try {
      const result = await orderService.checkAdminPayment({ invoice: payment.invoice });
      setPaymentNote(result.message || `${payment.invoice}: ${result.paymentStatus || 'checked'}`);
      setPayments((rows) => rows.map((row) => (
        row.invoice === payment.invoice
          ? { ...row, paymentStatus: result.paymentStatus || row.paymentStatus, actionCode: result.actionCode }
          : row
      )));
    } catch (err: any) {
      setPaymentNote(err?.response?.data?.error || 'Status check failed.');
    } finally {
      setChecking(false);
    }
  };

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

      <form
        className="flex flex-wrap items-center gap-2 max-w-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          setAppliedQuery(searchTerm.trim());
        }}
      >
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Transaction ID, order number, invoice, or buyer email"
            className="w-full bg-white border border-slate-300 rounded pl-9 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
        <Button type="submit" variant="primary" size="sm">Search</Button>
      </form>
      {loading ? <p className="text-xs text-slate-500">Loading transactions…</p> : null}
      {checkNote ? <p className="text-xs text-slate-700">{checkNote}</p> : null}

      <Table
        columns={orderColumns}
        data={filteredOrders}
        keyExtractor={(o) => o.id}
        pageSize={12}
      />

      {payments.length > 0 ? (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">Other application payments</h2>
          <p className="text-xs text-slate-500">These payments were not course orders. The transaction id still checks with Toucan.</p>
          {paymentNote ? <p className="text-xs text-slate-700">{paymentNote}</p> : null}
          <div className="border border-slate-200 rounded overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="p-2 font-medium">Transaction ID</th>
                  <th className="p-2 font-medium">Application</th>
                  <th className="p-2 font-medium">Name</th>
                  <th className="p-2 font-medium">Phone</th>
                  <th className="p-2 font-medium">Email</th>
                  <th className="p-2 font-medium">Amount</th>
                  <th className="p-2 font-medium">Status</th>
                  <th className="p-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.invoice} className="border-t border-slate-100">
                    <td className="p-2 font-mono">{payment.invoice}</td>
                    <td className="p-2">{payment.applicationId}</td>
                    <td className="p-2">{payment.customerName || '—'}</td>
                    <td className="p-2 font-mono">{payment.customerPhone || '—'}</td>
                    <td className="p-2">{payment.customerEmail || payment.applicationOrderId || '—'}</td>
                    <td className="p-2">₹{payment.amount}</td>
                    <td className="p-2">{payment.paymentStatus}</td>
                    <td className="p-2 text-right">
                      <Button variant="outline" size="sm" disabled={checking} onClick={() => checkPayment(payment)}>
                        Check with Toucan
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <TaxInvoiceModal
        orderId={inspectOrder?.status === 'completed' ? inspectOrder.id : null}
        onClose={() => setInspectOrder(null)}
      />
    </div>
  );
};
