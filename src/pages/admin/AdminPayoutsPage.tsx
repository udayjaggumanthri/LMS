import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { PayoutRequest } from '../../types';

export const AdminPayoutsPage: React.FC = () => {
  const { payoutRequests, approvePayout, rejectPayout } = useAdmin();

  const columns: Column<PayoutRequest>[] = [
    {
      key: 'id',
      header: 'Request Ref',
      render: (p) => <span className="font-mono text-slate-500 font-bold">{p.id}</span>
    },
    {
      key: 'instructorName',
      header: 'Instructor',
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
      render: (p) => <span className="text-slate-700 font-medium">{p.method}</span>
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
      render: (p) => <span className="text-slate-500 text-[11px]">{p.requestedAt}</span>
    },
    {
      key: 'actions',
      header: 'Processing',
      align: 'right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          {p.status === 'pending' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => rejectPayout(p.id)}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-800 hover:bg-emerald-900"
                onClick={() => approvePayout(p.id)}
              >
                Approve & Transfer
              </Button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 capitalize">Transferred</span>
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

      <Table
        columns={columns}
        data={payoutRequests}
        keyExtractor={(p) => p.id}
        pageSize={10}
      />
    </div>
  );
};
