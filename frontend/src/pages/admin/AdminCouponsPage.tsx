import React, { useState, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Tag,
  CheckCircle2,
  Copy,
  Check,
  Search,
  Sparkles,
  Calendar,
  Percent,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useNotifications } from '../../context/NotificationContext';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Coupon } from '../../types';

export const AdminCouponsPage: React.FC = () => {
  const { coupons, createCoupon, toggleCouponActive } = useAdmin();
  const { showToast } = useNotifications();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [maxUses, setMaxUses] = useState<number>(500);
  const [expiresAt, setExpiresAt] = useState('2026-12-31');

  // KPI Calculations
  const activeCount = useMemo(() => coupons.filter(c => c.active).length, [coupons]);
  const totalUses = useMemo(() => coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0), [coupons]);
  const avgDiscount = useMemo(() => {
    if (coupons.length === 0) return 0;
    return Math.round(coupons.reduce((sum, c) => sum + c.discountPercent, 0) / coupons.length);
  }, [coupons]);

  // Filtered List
  const filteredCoupons = useMemo(() => {
    if (!searchQuery.trim()) return coupons;
    return coupons.filter(c => c.code.toLowerCase().includes(searchQuery.toLowerCase().trim()));
  }, [coupons, searchQuery]);

  const handleCopyCode = (couponCode: string) => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(couponCode);
    showToast('success', `Coupon code "${couponCode}" copied to clipboard.`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = (coupon: Coupon) => {
    toggleCouponActive(coupon.id);
    const nextState = !coupon.active;
    showToast(nextState ? 'success' : 'info', `Coupon "${coupon.code}" is now ${nextState ? 'Active' : 'Disabled'}.`);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('error', 'Coupon code cannot be empty.');
      return;
    }
    if (discountPercent <= 0 || discountPercent > 95) {
      showToast('error', 'Discount must be between 1% and 95%.');
      return;
    }

    createCoupon({
      code: code.trim().toUpperCase(),
      discountPercent,
      maxUses,
      expiresAt,
      active: true
    });

    showToast('success', `Campaign coupon "${code.trim().toUpperCase()}" launched successfully!`);
    setCode('');
    setDiscountPercent(25);
    setMaxUses(500);
    setCreateModalOpen(false);
  };

  const columns: Column<Coupon>[] = [
    {
      key: 'code',
      header: 'Coupon Code',
      render: (c) => (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {c.code}
          </span>
          <button
            onClick={() => handleCopyCode(c.code)}
            title="Copy coupon code"
            className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
          >
            {copiedCode === c.code ? (
              <Check className="w-3.5 h-3.5 text-emerald-700" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )
    },
    {
      key: 'discountPercent',
      header: 'Discount',
      align: 'right',
      render: (c) => (
        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 tabular-nums">
          {c.discountPercent}% OFF
        </span>
      )
    },
    {
      key: 'usedCount',
      header: 'Redemptions',
      align: 'right',
      render: (c) => {
        const percent = Math.min(100, Math.round((c.usedCount / c.maxUses) * 100));
        return (
          <div className="text-right">
            <span className="tabular-nums font-semibold text-slate-900">
              {c.usedCount} <span className="text-slate-400 font-normal">/ {c.maxUses}</span>
            </span>
            <div className="w-20 bg-slate-100 rounded-full h-1 mt-1 ml-auto overflow-hidden">
              <div
                className={`h-full ${percent > 85 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      }
    },
    {
      key: 'expiresAt',
      header: 'Expiry Date',
      render: (c) => {
        const isExpired = new Date(c.expiresAt) < new Date();
        return (
          <span className={`text-xs ${isExpired ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
            {c.expiresAt} {isExpired && '(Expired)'}
          </span>
        );
      }
    },
    {
      key: 'active',
      header: 'Status & Action',
      align: 'right',
      render: (c) => (
        <button
          onClick={() => handleToggleActive(c)}
          className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase transition-colors ${
            c.active
              ? 'bg-emerald-100 text-emerald-950 border border-emerald-300 hover:bg-emerald-200'
              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
          }`}
        >
          {c.active ? 'Active' : 'Disabled'}
        </button>
      )
    }
  ];

  return (
    <div className="text-left space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Marketplace Promotions & Coupons
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create platform-wide promotional discounts and manage partner campaign voucher codes
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateModalOpen(true)}
        >
          Create New Coupon
        </Button>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Active Coupons</span>
            <Ticket className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{activeCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Of {coupons.length} total codes</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Redemptions</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{totalUses.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-0.5">Applied at checkout</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Avg Discount Rate</span>
            <Percent className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{avgDiscount}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across active campaigns</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Compliance Check</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-display text-emerald-800">100%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Anti-stacking enforced</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 border border-slate-200 rounded-lg">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupon code..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="text-xs text-slate-500 tabular-nums">
          Showing {filteredCoupons.length} of {coupons.length} coupons
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredCoupons}
        keyExtractor={(c) => c.id}
        pageSize={10}
      />

      {/* Create Coupon Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Campaign Discount Coupon"
        size="md"
      >
        <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
          <Input
            label="Coupon Code (Auto-converted to Uppercase)"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. MONSOON40"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Discount Percentage (1 to 90%)"
              type="number"
              min={1}
              max={90}
              required
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
            />
            <Input
              label="Maximum Redemption Cap"
              type="number"
              min={1}
              required
              value={maxUses}
              onChange={(e) => setMaxUses(Number(e.target.value))}
            />
          </div>
          <Input
            label="Expiration Date"
            type="date"
            required
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600 leading-relaxed">
            Prajnadhara policy limits promotional discounts to a maximum of 90% to protect instructor net royalty payouts.
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Publish Coupon &rarr;
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
