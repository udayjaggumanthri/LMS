import React, { useState } from 'react';
import { Download, TrendingUp, Calendar, FileText } from 'lucide-react';
import { useCourses } from '../../context/CourseContext';
import { Button } from '../../components/ui/Button';

export const AdminReportsPage: React.FC = () => {
  const { courses } = useCourses();
  const [dateRange, setDateRange] = useState('q3-2026');

  const totalGMV = courses.reduce((sum, c) => sum + (c.studentCount * c.price), 0);
  const platformRevenue = Math.round(totalGMV * 0.15);
  const instructorPayouts = Math.round(totalGMV * 0.85);

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Metric,Amount_INR,Notes\n"
      + `Gross_Marketplace_Volume,${totalGMV},Total learner course spend\n`
      + `Instructor_Net_Disbursements,${instructorPayouts},85% earned by creators\n`
      + `Platform_Commission_Revenue,${platformRevenue},15% marketplace margin\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prajnadhara-financial-report-${dateRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="text-left space-y-8">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Marketplace Financial Reports & Audits
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile GMV, commission margins, GST tax liabilities, and export audit sheets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          >
            <option value="q3-2026">Q3 2026 (July – September)</option>
            <option value="q2-2026">Q2 2026 (April – June)</option>
            <option value="fy-2026">Full Fiscal Year 2026</option>
          </select>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Total Gross GMV
          </div>
          <div className="text-3xl font-bold font-display text-slate-900 tabular-nums">
            ₹{totalGMV.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Gross student volume processed</div>
        </div>

        <div className="p-6 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Instructor Payout Obligation (85%)
          </div>
          <div className="text-3xl font-bold font-display text-emerald-950 tabular-nums">
            ₹{instructorPayouts.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Credited to approved instructor balances</div>
        </div>

        <div className="p-6 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Net Platform Retained (15%)
          </div>
          <div className="text-3xl font-bold font-display text-slate-900 tabular-nums">
            ₹{platformRevenue.toLocaleString('en-IN')}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Gross operational margin</div>
        </div>
      </div>

      <div className="p-6 border border-slate-200 rounded bg-white space-y-3 text-xs text-slate-600">
        <h3 className="font-bold uppercase tracking-wider text-slate-900 text-[11px]">
          Statutory Compliance & GST Reconciliation Note
        </h3>
        <p className="leading-relaxed">
          Prajnadhara EDU collects and remits 18% Goods & Services Tax (GST) under Indian electronic marketplace operator obligations (CGST Act Section 9(5)). Tax invoices and TDS certificates (Form 16A) for instructors are computed automatically at month-end settlement.
        </p>
      </div>
    </div>
  );
};
