import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer } from 'lucide-react';
import { orderService, TaxInvoice } from '../../api/orderService';
import { resolveMediaUrl } from '../../api/client';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

const PRINT_STYLE = `
  .tax-invoice-print-host { display: none; }
  @media print {
    @page { size: A4 portrait; margin: 8mm; }
    html, body { background: #fff !important; height: auto !important; margin: 0 !important; }
    #root { display: none !important; }
    body > .tax-invoice-print-host {
      display: block !important;
      position: static !important;
      width: 100% !important;
      height: auto !important;
      overflow: visible !important;
    }
    .tax-invoice-sheet {
      min-height: 277mm;
    }
  }
`;

function inr(value: string | number) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return '0.00';
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function rateLabel(value: string) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;
  return Number.isInteger(amount) ? String(amount) : String(amount);
}

const TaxInvoiceDocument: React.FC<{ invoice: TaxInvoice }> = ({ invoice }) => {
  const signature = resolveMediaUrl(invoice.company.signatureUrl);
  const stamp = resolveMediaUrl(invoice.company.stampUrl);
  const contact = [invoice.company.phone, invoice.company.email].filter(Boolean).join(' | ');

  const band = '#d9ebfb';
  const line = '#b7d4f2';

  return (
    <article
      className="tax-invoice-sheet mx-auto flex w-full max-w-[190mm] flex-col bg-white px-1 text-[13px] leading-5 text-slate-900"
      style={{ fontFamily: '"Segoe UI", Calibri, "Plus Jakarta Sans", sans-serif', minHeight: '270mm' }}
    >
      <div className="text-center">
        <div className="flex items-end justify-center gap-2">
          <div style={{ fontFamily: 'Nunito, Outfit, sans-serif', fontWeight: 800, fontSize: '42px', lineHeight: 1, color: '#1d4ed8' }}>
            {invoice.company.legalName || 'Prajnadhara'}
          </div>
          <div className="pb-1 text-[15px] font-semibold" style={{ color: '#3b82f6' }}>{invoice.company.companyLine}</div>
        </div>
        {invoice.company.address ? (
          <p className="mx-auto mt-1 max-w-[165mm] text-[12px] leading-4 text-slate-800">{invoice.company.address}</p>
        ) : null}
        {contact ? <p className="text-[12px] text-slate-800">{contact}</p> : null}
        <div className="mt-1 text-[16px] font-bold text-slate-900">Tax Invoice</div>
        <div className="mt-1 flex items-start justify-between text-[13px]">
          <div className="text-left">
            <div>Invoice No: {invoice.invoiceNumber}</div>
            {invoice.company.gstNumber ? <div>GST No : {invoice.company.gstNumber}</div> : null}
          </div>
          <div>Date: {invoice.date}</div>
        </div>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-6 text-sm">
        <div>
          <h3 className="font-bold">Customer Details</h3>
          <p><span className="font-semibold">Name :</span> {invoice.customer.name || '—'}</p>
          <p><span className="font-semibold">Mail ID :</span> {invoice.customer.email || '—'}</p>
          <p><span className="font-semibold">Contact No :</span> {invoice.customer.phone || '—'}</p>
          <p><span className="font-semibold">Address :</span> {invoice.customer.address || ''}</p>
        </div>
        <div>
          <p><span className="font-semibold">Course :</span> {invoice.courseTitle || '—'}</p>
          <p className="mt-3"><span className="font-semibold">Payment method:</span> {invoice.paymentMethod}</p>
        </div>
      </section>

      <div className="mt-3 text-[13px] font-bold">Txn Details</div>
      <table className="mt-1 w-full border-collapse text-[13px]">
        <thead>
          <tr style={{ background: band }}>
            <th className="px-2 py-1 text-center font-semibold" style={{ border: `1px solid ${line}` }}>Purchased Course</th>
            <th className="px-2 py-1 text-center font-semibold" style={{ border: `1px solid ${line}` }}>Quantity</th>
            <th className="px-2 py-1 text-center font-semibold" style={{ border: `1px solid ${line}` }}>Price (₹)</th>
            <th className="px-2 py-1 text-center font-semibold" style={{ border: `1px solid ${line}` }}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((row, index) => (
            <tr key={`${row.title}-${index}`}>
              <td className="px-2 py-1" style={{ border: `1px solid ${line}` }}>{index + 1}.{row.title}</td>
              <td className="px-2 py-1 text-center" style={{ border: `1px solid ${line}` }}>{row.quantity}</td>
              <td className="px-2 py-1 text-center tabular-nums" style={{ border: `1px solid ${line}` }}>{inr(row.price)}</td>
              <td className="px-2 py-1 text-center tabular-nums" style={{ border: `1px solid ${line}` }}>{inr(row.amount)}</td>
            </tr>
          ))}
          <tr className="font-semibold" style={{ background: band }}>
            <td className="px-2 py-1 text-center" style={{ border: `1px solid ${line}` }}>Total</td>
            <td className="px-2 py-1 text-center" style={{ border: `1px solid ${line}` }}>{invoice.quantity}</td>
            <td style={{ border: `1px solid ${line}` }} />
            <td className="px-2 py-1 text-center tabular-nums" style={{ border: `1px solid ${line}` }}>{inr(invoice.taxable)}</td>
          </tr>
        </tbody>
      </table>

      <table className="mt-3 w-full border-collapse text-[13px]">
        <tbody>
          {[
            ['Sub Total (Taxable Value)', `₹${inr(invoice.taxable)}`, false],
            [`CGST(${rateLabel(invoice.cgstRate)}%)`, `₹${inr(invoice.cgst)}`, true],
            [`SGST(${rateLabel(invoice.sgstRate)}%)`, `₹${inr(invoice.sgst)}`, true],
            ['Round Off', `₹${inr(invoice.roundOff)}`, false],
            ['Total', `₹${inr(invoice.total)}`, true],
          ].map(([label, value, shaded]) => (
            <tr key={String(label)} className={label === 'Total' ? 'font-bold' : undefined} style={{ background: shaded ? band : '#fff' }}>
              <td className="w-[68%] px-2 py-1" style={{ border: '1px solid #d7d7d7' }}>{label}</td>
              <td className="px-2 py-1 text-right tabular-nums" style={{ border: '1px solid #d7d7d7' }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 px-3 py-2 text-[13px]" style={{ border: '1px solid #7eb6ea' }}>
        <p className="font-semibold">Total Amount in Words:</p>
        <p>{invoice.amountInWords}</p>
      </div>

      <div className="mt-4 text-sm">
        <p className="font-bold">Declaration :</p>
        <p className="mt-1 max-w-xl leading-5">{invoice.company.declaration}</p>
      </div>

      <div className="mt-6 flex justify-end">
        <div className="w-64 text-center text-sm">
          <p className="font-semibold">For {invoice.company.fullName}</p>
          <div className="relative mx-auto mt-2 h-24 w-56">
            {stamp ? (
              <img src={stamp} alt="" className="absolute bottom-1 right-2 h-20 w-20 bg-transparent object-contain" />
            ) : null}
            {signature ? (
              <img src={signature} alt="" className="absolute bottom-0 left-6 h-16 max-w-[9rem] bg-transparent object-contain" />
            ) : null}
          </div>
          <div className="mx-auto w-44 border-t border-slate-800" />
          <p className="mt-1">Authorized Signatory</p>
        </div>
      </div>

      <div className="invoice-foot relative mt-auto overflow-hidden pt-6">
        <svg className="block h-28 w-full" viewBox="0 0 1200 160" preserveAspectRatio="none" aria-hidden="true">
          <path fill="#e8f4fc" d="M0 70 C180 130 320 20 520 64 C740 112 900 24 1200 78 L1200 160 L0 160 Z" />
          <path fill="#d4ebf8" d="M0 100 C220 150 420 55 680 96 C880 128 1040 70 1200 108 L1200 160 L0 160 Z" />
          <path fill="#c5e4f6" d="M0 128 C260 150 480 100 760 132 C960 150 1080 120 1200 136 L1200 160 L0 160 Z" />
        </svg>
        <p className="absolute inset-x-0 bottom-6 text-center text-[12px] text-slate-700">
          Thank you for choosing {invoice.company.fullName}
        </p>
      </div>
      <p className="mt-2 text-left text-[13px] font-bold text-slate-900">Note: This is Digitally Signed Invoice</p>
    </article>
  );
};

export const TaxInvoiceModal: React.FC<{
  orderId: string | number | null;
  onClose: () => void;
}> = ({ orderId, onClose }) => {
  const [invoice, setInvoice] = useState<TaxInvoice | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setInvoice(null);
      setError('');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    orderService.getTaxInvoice(orderId)
      .then((data) => {
        if (!cancelled) setInvoice(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setInvoice(null);
          setError(err?.response?.data?.error || 'Could not open this invoice.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return (
    <Modal
      isOpen={Boolean(orderId)}
      onClose={onClose}
      size="xl"
    >
      {loading ? <p className="text-sm text-slate-500">Preparing invoice…</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {invoice ? <TaxInvoiceDocument invoice={invoice} /> : null}
      {invoice ? createPortal(
        <>
          <style>{PRINT_STYLE}</style>
          <div className="tax-invoice-print-host">
            <TaxInvoiceDocument invoice={invoice} />
          </div>
        </>,
        document.body,
      ) : null}
      <div className="no-print mt-4 flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!invoice}
          onClick={() => window.print()}
          leftIcon={<Printer className="w-3.5 h-3.5" />}
        >
          Save or print
        </Button>
      </div>
    </Modal>
  );
};
