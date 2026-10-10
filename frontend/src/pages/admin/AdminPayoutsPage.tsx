import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNotifications } from '../../context/NotificationContext';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { PayoutRequest } from '../../types';
import { CreditCard, DollarSign, CheckCircle2, Search, Eye, AlertCircle, Building2, Send } from 'lucide-react';

export const AdminPayoutsPage: React.FC = () => {
  const { payoutRequests, approvePayout, rejectPayout } = useAdmin();
  const { showToast } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectPayout, setInspectPayout] = useState<PayoutRequest | null>(null);
  const [rejectingPayout, setRejectingPayout] = useState<PayoutRequest | null>(null);

  const pendingCount = payoutRequests.filter(p => p.status === 'pending').length;
  const pendingTotal = payoutRequests
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const completedTotal = payoutRequests
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const filtered = payoutRequests.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        p.instructorName.toLowerCase().includes(q) ||
        p.instructorEmail.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.method.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (p: PayoutRequest) => {
    approvePayout(p.id);
    showToast('success', `Executed payout transfer of ₹${p.amount.toLocaleString('en-IN')} to ${p.instructorName}.`);
    if (inspectPayout?.id === p.id) setInspectPayout(null);
  };

  const handleConfirmReject = () => {
    if (!rejectingPayout) return;
    rejectPayout(rejectingPayout.id);
    showToast('info', `Payout request ${rejectingPayout.id} was rejected.`);
    setRejectingPayout(null);
    if (inspectPayout?.id === rejectingPayout.id) setInspectPayout(null);
  };

  const columns: Column<PayoutRequest>[] = [
    {
      key: 'id',
      header: 'Request Ref',
      render: (p) => <span className="font-mono text-slate-500 font-bold text-xs">{p.id}</span>
    },
    {
      key: 'instructorName',
      header: 'Instructor Account',
      render: (p) => (
        <div>
          <div className="font-bold text-slate-900">{p.instructorName}</div>
          <div className="text-[11px] text-slate-500">{p.instructorEmail}</div>
        </div>
      )
    },
    {
      key: 'amount',
      header: 'Payout Amount (INR)',
      align: 'right',
      sortable: true,
      render: (p) => <span className="font-bold text-slate-900 tabular-nums">₹{p.amount.toLocaleString('en-IN')}</span>
    },
    {
      key: 'method',
      header: 'Transfer Destination',
      render: (p) => <span className="text-slate-700 font-medium text-xs">{p.method}</span>
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge
          variant={
            p.status === 'completed'
              ? 'success'
              : p.status === 'pending'
              ? 'warning'
              : 'danger'
          }
        >
          {p.status}
        </Badge>
      )
    },
    {
      key: 'requestedAt',
      header: 'Date',
      render: (p) => <span className="text-slate-500 text-[11px] tabular-nums">{p.requestedAt}</span>
    },
    {
      key: 'actions',
      header: 'Moderation',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInspectPayout(p)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Inspect
          </Button>

          {p.status === 'pending' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectingPayout(p)}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-800 hover:bg-emerald-900"
                onClick={() => handleApprove(p)}
              >
                Approve & Transfer
              </Button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 capitalize px-2">Transferred</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Instructor Payouts Moderation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify matured course earnings, validate bank accounts & UPI VPAs, and execute 85% revenue distributions
        </p>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 border border-slate-200 rounded bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Approvals</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 tabular-nums">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting bank dispatch</div>
        </div>

        <div className="p-4 border border-slate-200 rounded bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Amount</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 tabular-nums">
            ₹{pendingTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Queued creator funds</div>
        </div>

        <div className="p-4 border border-slate-200 rounded bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Disbursed</div>
          <div className="text-2xl font-bold font-display text-emerald-950 mt-1 tabular-nums">
            ₹{completedTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Settled creator revenue</div>
        </div>

        <div className="p-4 border border-slate-200 rounded bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Platform Margin (15%)</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 tabular-nums">
            ₹{Math.round(completedTotal * 0.176).toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Marketplace gross fee share</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded">
          {(['all', 'pending', 'completed', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded capitalize transition-colors ${
                filter === st ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st} {st === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by instructor, email, ref..."
            className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(p) => p.id}
        pageSize={10}
      />

      {/* Inspect Payout Transfer Modal */}
      {inspectPayout && (
        <Modal
          isOpen={!!inspectPayout}
          onClose={() => setInspectPayout(null)}
          title={`Payout Dispatch: ${inspectPayout.id}`}
          size="md"
        >
          <div className="space-y-4 text-xs text-slate-800">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
              <div>
                <span className="text-slate-500 block text-[11px]">Instructor</span>
                <strong className="text-slate-900 text-sm block">{inspectPayout.instructorName}</strong>
                <span className="text-slate-500">{inspectPayout.instructorEmail}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block text-[11px]">Disbursement Sum</span>
                <span className="font-bold text-emerald-950 text-base tabular-nums">
                  ₹{inspectPayout.amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 border border-slate-200 rounded space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Banking / Transfer Coordinates
              </span>
              <div className="text-slate-900 font-semibold">{inspectPayout.method}</div>
              <p className="text-[11px] text-slate-500">
                Verified through NPCI payment gateway & Automated Clearing House (NACH/NEFT).
              </p>
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-500">
              <span>Requested: {inspectPayout.requestedAt}</span>
              <span>Status: <strong className="capitalize text-slate-900">{inspectPayout.status}</strong></span>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setInspectPayout(null)}>
                Close
              </Button>
              {inspectPayout.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setRejectingPayout(inspectPayout);
                    }}
                  >
                    Reject Payout
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-800 hover:bg-emerald-900"
                    onClick={() => handleApprove(inspectPayout)}
                  >
                    Confirm Bank Transfer &rarr;
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Confirmation Modal */}
      {rejectingPayout && (
        <Modal
          isOpen={!!rejectingPayout}
          onClose={() => setRejectingPayout(null)}
          title="Reject Payout Transfer"
          size="sm"
        >
          <div className="space-y-4 text-xs text-slate-800">
            <p className="text-slate-600">
              Are you sure you want to decline payout <strong>{rejectingPayout.id}</strong> (₹{rejectingPayout.amount.toLocaleString('en-IN')} for {rejectingPayout.instructorName})? The amount will revert to the instructor's available balance.
            </p>
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Button variant="outline" size="sm" onClick={() => setRejectingPayout(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReject}>
                Confirm Decline
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
