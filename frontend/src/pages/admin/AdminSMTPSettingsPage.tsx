import React, { useState, useEffect } from 'react';
import {
  Mail,
  Server,
  Lock,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  BellRing,
  RefreshCw,
  Info
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AdminSMTPSettingsPage: React.FC = () => {
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const [formData, setFormData] = useState({
    host: 'smtp.gmail.com',
    port: 587,
    username: '',
    password: '',
    fromEmail: 'noreply@prajnadhara.edu',
    senderName: 'Prajnadhara EDU',
    useTls: true,
    useSsl: false,
    isEnabled: false,
    sendWelcomeEmail: true,
    sendPurchaseReceipt: true,
    sendCourseUpdates: true,
    passwordMasked: false
  });

  useEffect(() => {
    adminService.getSMTPSettings()
      .then((data) => {
        if (data) {
          setFormData(prev => ({
            ...prev,
            ...data,
            port: Number(data.port) || 587
          }));
        }
      })
      .catch(() => {
        showToast('Failed to load SMTP settings', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTestResult(null);

    try {
      const res = await adminService.updateSMTPSettings(formData);
      setFormData(prev => ({ ...prev, ...res }));
      showToast('SMTP & notification settings updated successfully!', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save SMTP configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail.trim()) {
      showToast('Please enter a recipient email address for testing.', 'error');
      return;
    }
    setTesting(true);
    setTestResult(null);

    try {
      const res = await adminService.testSMTPEmail(testEmail.trim());
      if (res?.success) {
        setTestResult({ success: true, message: res.message || 'Test email dispatched successfully!' });
        showToast('Test email sent successfully!', 'success');
      } else {
        setTestResult({ success: false, message: res.message || 'SMTP server rejected connection.' });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Failed to send test email. Check server credentials.';
      setTestResult({ success: false, message: msg });
      showToast('SMTP Test Failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-800" />
        Loading Mail SMTP server configuration...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
              Mail SMTP & Transactional Engine
            </h1>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
              formData.isEnabled ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {formData.isEnabled ? 'Active' : 'Disabled'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure platform mail server for welcome emails, enrollment receipts, and administrative alerts
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Enable / Disable Switch */}
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-md text-emerald-800">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Enable Outbound Email Delivery</div>
              <div className="text-[11px] text-slate-600">
                When enabled, real emails are dispatched via the SMTP host below. When disabled, emails are safely simulated in backend logs.
              </div>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
          </label>
        </div>

        {/* Server Host & Port Card */}
        <div className="p-6 border border-slate-200 rounded-lg bg-white space-y-4 shadow-2xs">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Server className="w-4 h-4 text-emerald-800" />
            <span>SMTP Server Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="SMTP Host"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="e.g. smtp.gmail.com or smtp.sendgrid.net"
                required
              />
            </div>
            <div>
              <Input
                label="Port"
                type="number"
                value={formData.port}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 587 })}
                placeholder="587"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="SMTP Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="e.g. admin@yourdomain.com or apikey"
            />
            <Input
              label="SMTP Password / App Key"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={formData.passwordMasked ? '••••••••••••' : 'App-specific password'}
            />
          </div>

          {/* Encryption Protocol */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
              Encryption Protocol
            </label>
            <div className="flex items-center gap-6 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.useTls}
                  onChange={(e) => setFormData({ ...formData, useTls: e.target.checked, useSsl: e.target.checked ? false : formData.useSsl })}
                  className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                />
                <span className="font-medium text-slate-700">Use TLS (Recommended for Port 587)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.useSsl}
                  onChange={(e) => setFormData({ ...formData, useSsl: e.target.checked, useTls: e.target.checked ? false : formData.useTls })}
                  className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                />
                <span className="font-medium text-slate-700">Use SSL (Port 465)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sender Identity Card */}
        <div className="p-6 border border-slate-200 rounded-lg bg-white space-y-4 shadow-2xs">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-800" />
            <span>Sender Identity & Header</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="From Email Address"
              type="email"
              value={formData.fromEmail}
              onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
              placeholder="notifications@prajnadhara.edu"
              required
            />
            <Input
              label="Sender Display Name"
              value={formData.senderName}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
              placeholder="Prajnadhara EDU"
              required
            />
          </div>
        </div>

        {/* Automated Notification Triggers */}
        <div className="p-6 border border-slate-200 rounded-lg bg-white space-y-4 shadow-2xs">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <BellRing className="w-4 h-4 text-emerald-800" />
            <span>Automated Notification Triggers</span>
          </h2>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Welcome Email to New Users</div>
                <div className="text-slate-500 text-[11px]">Send welcome email with learning workspace link upon account registration</div>
              </div>
              <input
                type="checkbox"
                checked={formData.sendWelcomeEmail}
                onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
                className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Order Confirmation & Tax Receipt</div>
                <div className="text-slate-500 text-[11px]">Deliver itemized purchase invoice and curriculum access link to student upon checkout</div>
              </div>
              <input
                type="checkbox"
                checked={formData.sendPurchaseReceipt}
                onChange={(e) => setFormData({ ...formData, sendPurchaseReceipt: e.target.checked })}
                className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
              />
            </div>

            <div className="py-3 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Course Publishing & Updates</div>
                <div className="text-slate-500 text-[11px]">Notify enrolled learners when new lectures, assignments, or revisions are published</div>
              </div>
              <input
                type="checkbox"
                checked={formData.sendCourseUpdates}
                onChange={(e) => setFormData({ ...formData, sendCourseUpdates: e.target.checked })}
                className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={saving}
          >
            Save SMTP Settings
          </Button>
        </div>
      </form>

      {/* Test Email Verification Box */}
      <div className="p-6 border border-slate-200 rounded-lg bg-slate-50 space-y-4">
        <div>
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-800" />
            <span>Verify Live SMTP Handshake</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Send an instant test email to any inbox to verify that host, port, credentials, and TLS/SSL certificates are operational
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter destination email address (e.g. your email)..."
            className="flex-1 bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleTestEmail}
            isLoading={testing}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Send Test Email
          </Button>
        </div>

        {testResult && (
          <div className={`p-3 rounded text-xs flex items-start gap-2.5 ${
            testResult.success
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border border-rose-200 text-rose-900'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold">{testResult.success ? 'SMTP Connection Successful' : 'SMTP Handshake Error'}</div>
              <div className="mt-0.5 text-[11px] leading-relaxed">{testResult.message}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
