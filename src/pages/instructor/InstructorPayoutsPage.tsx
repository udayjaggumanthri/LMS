import React, { useState } from 'react';
import { CreditCard, DollarSign, ArrowUpRight, CheckCircle2, Clock, Plus } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { PayoutRequest } from '../../types';

export const InstructorPayoutsPage: React.FC = () => {
  const { payoutRequests, requestPayout } = useAdmin();
  const { currentUser } = useAuth();

  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(45000);
  const [payoutMethodChoice, setPayoutMethodChoice] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState(currentUser?.payoutMethod?.upiId || 'neha.ts@paytm');
  const [bankAcc, setBankAcc] = useState(currentUser?.payoutMethod?.accountNumber || '918237461928');
  const [ifsc, setIfsc] = useState(currentUser?.payoutMethod?.ifsc || 'HDFC0001824');
  const [requestSuccessMsg, setRequestSuccessMsg] = useState(false);

  const myPayouts = payoutRequests.filter(p => p.instructorId === currentUser?.id || p.instructorId === 'inst-7');

  const lifetimeEarnings = currentUser?.totalEarnings || 980000;
  const availableBalance = 142000;
  const platformFeeCovered = Math.round(lifetimeEarnings * 0.176);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const methodStr = payoutMethodChoice === 'upi' ? `UPI (${upiId})` : `Bank Transfer (A/C: ${bankAcc}, IFSC: ${ifsc})`;
    requestPayout(
      payoutAmount,
      methodStr,
      currentUser?.id || 'inst-7',
      currentUser?.name || 'Neha Deshmukh',
      currentUser?.email || 'instructor@prajnadhara.edu'
    );
    setRequestSuccessMsg(true);
  };

  const columns: Column<PayoutRequest>[] = [
    {
      key: 'id',
      header: 'Payout ID',
      render: (p) => <span className="font-mono text-slate-500 font-bold">{p.id}</span>
    },
    {
      key: 'requestedAt',
      header: 'Requested Date',
      render: (p) => <span className="text-slate-600">{p.requestedAt}</span>
    },
    {
      key: 'amount',
      header: 'Amount (INR)',
      align: 'right',
      render: (p) => <span className="font-bold text-slate-900 tabular-nums">₹{p.amount.toLocaleString('en-IN')}</span>
    },
    {
      key: 'method',
      header: 'Destination Account',
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
    }
  ];

  return (
    <div className="text-left space-y-8">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Revenue & Payouts Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your 85% instructor earnings, review platform fee transparency, and withdraw funds
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setPayoutModalOpen(true);
            setRequestSuccessMsg(false);
          }}
        >
          Request Payout Transfer
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Available Balance for Withdrawal
          </div>
          <div className="text-3xl font-bold font-display text-emerald-950 tabular-nums">
            ₹{availableBalance.toLocaleString('en-IN')}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Matured past the 30-day refund guarantee window</p>
        </div>

        <div className="p-6 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Lifetime Net Earnings (85%)
          </div>
          <div className="text-3xl font-bold font-display text-slate-900 tabular-nums">
            ₹{lifetimeEarnings.toLocaleString('en-IN')}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Cumulative payouts & active balance</p>
        </div>

        <div className="p-6 border border-slate-200 rounded bg-white">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
            Platform Retained Fee (15%)
          </div>
          <div className="text-3xl font-bold font-display text-slate-500 tabular-nums">
            ₹{platformFeeCovered.toLocaleString('en-IN')}
          </div>
          <p className="mt-2 text-[11px] text-slate-500">Video streaming, payment gateway & fraud protection</p>
        </div>
      </div>

      {/* Payout Requests History */}
      <div className="p-6 border border-slate-200 rounded bg-white space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-900">
          Payout Withdrawal History
        </h3>
        <Table
          columns={columns}
          data={myPayouts}
          keyExtractor={(p) => p.id}
          pageSize={6}
        />
      </div>

      {/* Payout Request Modal */}
      <Modal
        isOpen={payoutModalOpen}
        onClose={() => setPayoutModalOpen(false)}
        title="Request Earnings Withdrawal"
        size="md"
      >
        {requestSuccessMsg ? (
          <div className="p-6 text-center space-y-3 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">Payout Request Submitted</h4>
            <p className="text-slate-600">
              Your transfer of <strong>₹{payoutAmount.toLocaleString('en-IN')}</strong> has been submitted to platform administration for approval and execution within 2 business days.
            </p>
            <Button variant="outline" size="sm" onClick={() => setPayoutModalOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 flex justify-between items-center">
              <span>Available to withdraw:</span>
              <strong className="text-emerald-950 font-bold text-sm tabular-nums">
                ₹{availableBalance.toLocaleString('en-IN')}
              </strong>
            </div>

            <Input
              label="Withdrawal Amount (in INR ₹)"
              type="number"
              min={1000}
              max={availableBalance}
              required
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(Number(e.target.value))}
              helper="Minimum withdrawal threshold is ₹1,000."
            />

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Payout Destination
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setPayoutMethodChoice('upi')}
                  className={`py-2 px-3 rounded border text-xs font-medium transition-colors ${
                    payoutMethodChoice === 'upi' ? 'bg-emerald-50 text-emerald-950 border-emerald-800 font-bold' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  UPI VPA (Instant)
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutMethodChoice('bank')}
                  className={`py-2 px-3 rounded border text-xs font-medium transition-colors ${
                    payoutMethodChoice === 'bank' ? 'bg-emerald-50 text-emerald-950 border-emerald-800 font-bold' : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Bank Account (NEFT/IMPS)
                </button>
              </div>

              {payoutMethodChoice === 'upi' ? (
                <Input
                  label="UPI VPA Address"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. name@okhdfcbank"
                  required
                />
              ) : (
                <div className="space-y-3">
                  <Input
                    label="Bank Account Number"
                    value={bankAcc}
                    onChange={(e) => setBankAcc(e.target.value)}
                    required
                  />
                  <Input
                    label="IFSC Code"
                    value={ifsc}
                    onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                    required
                  />
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPayoutModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Transfer Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
