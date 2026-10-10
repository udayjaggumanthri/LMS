import React, { useState } from 'react';
import { useLearning } from '../../context/LearningContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { Order } from '../../types';
import { FileText, Printer, CheckCircle2 } from 'lucide-react';

export const PurchaseHistoryPage: React.FC = () => {
  const { orders } = useLearning();
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

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
          Review all course transactions, download official tax receipts, and verified purchase records
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
          title={`Official Invoice ${selectedOrderForInvoice.invoiceNumber}`}
          size="md"
        >
          <div className="p-4 border border-slate-200 rounded text-xs space-y-4 bg-white">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Prajnadhara Edu Tax Invoice</h3>
                <p className="text-[11px] text-slate-500">GSTIN: 37AAECP1234F1Z5</p>
              </div>
              <div className="text-right">
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Paid
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="text-slate-500 block text-[11px]">Invoice Reference:</span>
                <span className="font-mono font-bold text-slate-900">{selectedOrderForInvoice.invoiceNumber}</span>
                <span className="text-slate-500 block text-[11px] mt-1">Order ID:</span>
                <span className="font-mono text-slate-700">{selectedOrderForInvoice.orderNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Issue Date:</span>
                <span className="text-slate-800 font-medium">{selectedOrderForInvoice.createdAt}</span>
                <span className="text-slate-500 block text-[11px] mt-1">Payment Method:</span>
                <span className="uppercase text-slate-800 font-semibold">{selectedOrderForInvoice.paymentMethod}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Itemized Particulars</h4>
              <div className="border border-slate-100 rounded overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] text-slate-500">
                    <tr>
                      <th className="p-2 font-medium">Course Description</th>
                      <th className="p-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrderForInvoice.items.map((it) => (
                      <tr key={it.courseId}>
                        <td className="p-2 font-medium text-slate-800">{it.courseTitle}</td>
                        <td className="p-2 text-right font-mono text-slate-700">₹{it.price.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900 text-sm">
              <span>Grand Total:</span>
              <span className="tabular-nums">₹{selectedOrderForInvoice.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedOrderForInvoice(null)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => window.print()} leftIcon={<Printer className="w-3.5 h-3.5" />}>
              Print Invoice
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
