import React, { useState } from 'react';
import { Ticket, Plus, Tag, CheckCircle2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Coupon } from '../../types';

export const AdminCouponsPage: React.FC = () => {
  const { coupons, createCoupon, toggleCouponActive } = useAdmin();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [maxUses, setMaxUses] = useState<number>(500);
  const [expiresAt, setExpiresAt] = useState('2026-12-31');

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    createCoupon({
      code: code.trim().toUpperCase(),
      discountPercent,
      maxUses,
      expiresAt,
      active: true
    });
    setCode('');
    setCreateModalOpen(false);
  };

  const columns: Column<Coupon>[] = [
    {
      key: 'code',
      header: 'Coupon Code',
      render: (c) => (
        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {c.code}
        </span>
      )
    },
    {
      key: 'discountPercent',
      header: 'Discount',
      align: 'right',
      render: (c) => <span className="font-bold text-emerald-800 tabular-nums">{c.discountPercent}% OFF</span>
    },
    {
      key: 'usedCount',
      header: 'Usage Count',
      align: 'right',
      render: (c) => <span className="tabular-nums font-medium">{c.usedCount} / {c.maxUses}</span>
    },
    {
      key: 'expiresAt',
      header: 'Expiry Date',
      render: (c) => <span className="text-slate-500">{c.expiresAt}</span>
    },
    {
      key: 'active',
      header: 'Status',
      align: 'right',
      render: (c) => (
        <button
          onClick={() => toggleCouponActive(c.id)}
          className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase transition-colors ${
            c.active
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-slate-100 text-slate-500 border border-slate-200'
          }`}
        >
          {c.active ? 'Active' : 'Disabled'}
        </button>
      )
    }
  ];

  return (
    <div className="text-left space-y-6">
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

      <Table
        columns={columns}
        data={coupons}
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
            label="Coupon Code (Auto Uppercase)"
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. FLASH30"
          />
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
            label="Maximum Uses Cap"
            type="number"
            min={1}
            required
            value={maxUses}
            onChange={(e) => setMaxUses(Number(e.target.value))}
          />
          <Input
            label="Expiry Date (YYYY-MM-DD)"
            type="date"
            required
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />

          <div className="pt-2 flex justify-end gap-2">
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
