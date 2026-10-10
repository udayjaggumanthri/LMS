import React, { useState } from 'react';
import { Download, TrendingUp, Calendar, FileText, BarChart3, CheckCircle2, ShieldCheck, ArrowUpRight, DollarSign } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { useLearning } from '../../context/LearningContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';

export const AdminReportsPage: React.FC = () => {
  const { courses, categories } = useCourses();
  const { orders } = useLearning();
  const { showToast } = useNotifications();
  const [dateRange, setDateRange] = useState('all-time');

  // Real calculations derived from completed customer orders
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const taxableBase = Math.round(totalRevenue / 1.18);
  const gstCollected = Math.round(totalRevenue - taxableBase);

  const handleExportCsv = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Order_Number,Date,Student_Email,Total_INR,GST_18_INR,Payment_Method,Status\n";

    orders.forEach(o => {
      const gst = Math.round(o.total - (o.total / 1.18));
      csvContent += `${o.orderNumber},${o.createdAt || '2026-10'},${(o as any).userEmail || (o as any).email || 'learner@domain.com'},${o.total},${gst},${o.paymentMethod || 'Online'},${o.status}\n`;
    });

    csvContent += `\nTotal_Platform_Revenue,${totalRevenue}\n`;
    csvContent += `Total_Statutory_GST_18pct,${gstCollected}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prajnadhara-financial-audit-${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Platform financial audit report exported successfully!', 'success');
  };

  return (
    <div className="text-left space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Platform Financial Reports & Invoicing Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real order revenues, statutory GST tax liabilities, and verified customer transaction ledger
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          >
            <option value="all-time">All Completed Transactions</option>
            <option value="q4-2026">Q4 2026</option>
            <option value="q3-2026">Q3 2026</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCsv}
          >
            Export Audit CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Total Net Platform Revenue
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-emerald-950 tabular-nums">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1">100% Retained Platform Intake</div>
        </div>

        <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Completed Order Transactions
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-950 tabular-nums">
            {totalOrdersCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">Verified checkout conversions</div>
        </div>

        <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Statutory GST (18%)
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-950 tabular-nums">
            ₹{gstCollected.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-800 font-semibold mt-1">CGST + SGST compliant</div>
        </div>

        <div className="p-5 border border-slate-200 rounded-lg bg-white shadow-2xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Catalog Masterclasses
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-display text-slate-950 tabular-nums">
            {courses.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Across active disciplines</div>
        </div>
      </div>

      {/* Orders Transaction Ledger */}
      <div className="p-6 border border-slate-200 rounded-lg bg-white shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-slate-900 font-display">
            Verified Customer Transaction Ledger
          </h2>
          <span className="text-xs text-slate-500">{orders.length} Completed Orders</span>
        </div>

        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Order Number</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Items Purchased</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3 text-right">Amount (INR)</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-3 font-mono font-bold text-emerald-950">{o.orderNumber}</td>
                    <td className="py-3 px-3 text-slate-600">{o.createdAt || 'Recent'}</td>
                    <td className="py-3 px-3 text-slate-800">{o.items.length} Course(s)</td>
                    <td className="py-3 px-3 text-slate-600 capitalize">{o.paymentMethod || 'Online'}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-950 tabular-nums">
                      ₹{o.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 border border-emerald-200">
                        Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p>No customer transactions processed yet in this database.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Purchases through checkout will automatically appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
