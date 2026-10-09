import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CheckCircle2, Settings } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings } = useAdmin();

  const [commission, setCommission] = useState(settings.commissionPercent);
  const [platformName, setPlatformName] = useState(settings.platformName);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [refundDays, setRefundDays] = useState(settings.refundWindowDays);
  const [minPayout, setMinPayout] = useState(settings.minPayoutThreshold);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      commissionPercent: commission,
      platformName,
      supportEmail,
      refundWindowDays: refundDays,
      minPayoutThreshold: minPayout
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl text-left space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Global Marketplace Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure default platform economics, refund windows, and support routing parameters
        </p>
      </div>

      <div className="p-6 border border-slate-200 rounded bg-white space-y-6 text-xs">
        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Settings saved and synchronized across the platform!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <Input
            label="Platform Marketplace Name"
            value={platformName}
            onChange={(e) => setPlatformName(e.target.value)}
            required
          />

          <Input
            label="Support Desk Email Address"
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Platform Fee Commission Rate (%)"
              type="number"
              min={5}
              max={50}
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
              helper="Standard is 15% (instructor keeps 85%)."
            />
            <Input
              label="Student Refund Window Guarantee (Days)"
              type="number"
              min={7}
              max={60}
              value={refundDays}
              onChange={(e) => setRefundDays(Number(e.target.value))}
              helper="Standard is 30 days."
            />
          </div>

          <Input
            label="Minimum Payout Transfer Threshold (INR ₹)"
            type="number"
            min={500}
            value={minPayout}
            onChange={(e) => setMinPayout(Number(e.target.value))}
            helper="Minimum amount an instructor must accumulate to request withdrawal."
          />

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md">
              Save Platform Configuration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
