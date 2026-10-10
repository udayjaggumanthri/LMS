import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Lock,
  Globe,
  Radio,
  Server,
  Zap,
  Activity,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export const AdminPaymentGatewayPage: React.FC = () => {
  const { showToast } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testAmount, setTestAmount] = useState('10');
  const [testResult, setTestResult] = useState<any>(null);

  const [config, setConfig] = useState({
    providerName: 'ToucanPay',
    isEnabled: true,
    environment: 'uat',
    merchantName: 'Prajnadhara Infotech Private Limited',
    loginId: 'prajnadhar',
    mid: '962042872713381',
    tid: '78183008',
    password: '',
    macToken: '',
    apiEndpointUat: 'https://pay.testtoucanpay.in/api/auth/getpaymentsession',
    apiEndpointProd: 'https://pay.toucanpay.in/api/auth/getpaymentsession',
    statusCheckEndpointUat: 'https://pay.testtoucanpay.in/api/pay/v1/checkStatus',
    statusCheckEndpointProd: 'https://pay.toucanpay.in/api/pay/v1/checkStatus',
    merchantPortalUrl: 'https://merchant.testtoucanpay.in',
    merchantRegionUrl: 'https://merchant.testtoucanpay.in/',
    successUrl: 'http://localhost:3000/order-confirmation',
    failureUrl: 'http://localhost:3000/checkout?status=failed',
    callbackUrl: 'http://localhost:8000/api/payments/toucan/callback/',
    whitelistedIp: '117.99.201.162',
    allowSandboxSimulationOnTimeout: true
  });

  useEffect(() => {
    adminService.getPaymentGatewaySettings()
      .then((data) => {
        if (data) {
          setConfig(prev => ({
            ...prev,
            ...data
          }));
        }
      })
      .catch(() => {
        showToast('Failed to load payment gateway settings', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updatePaymentGatewaySettings(config);
      showToast('ToucanPay gateway settings saved successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update payment settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await adminService.testPaymentGatewayConnection(testAmount);
      setTestResult(res);
      if (res.success) {
        showToast('ToucanPay gateway connection test succeeded!', 'success');
      } else {
        showToast(res.notice || 'Test executed. Review diagnostic logs.', 'info');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        status: 'ERROR',
        error: err?.message || 'Connection test failed'
      });
      showToast('Connection test failed', 'error');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-500">
        Loading ToucanPay configuration...
      </div>
    );
  }

  return (
    <div className="max-w-5xl text-left space-y-8">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              Payment Gateway Architecture
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300">
              ToucanPay Official
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            ToucanPay Gateway Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage UAT &amp; Production credentials, merchant terminal keys, server IP whitelisting, and webhook callbacks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={config.merchantPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 text-slate-700 bg-white text-xs font-semibold hover:bg-slate-50"
          >
            <span>Toucan Merchant Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Integration Coordinates Notice Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-lg shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white font-display">
                Toucan Payments Partner Integration Coordinates
              </h3>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              These are the system coordinates required by Toucan Payments Operations (Prashanth Nuka) to whitelist and connect Prajnadhara EDU to the gateway network:
            </p>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            MID: {config.mid}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-white/10 rounded border border-white/10 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-300">Server IP for Whitelisting</div>
            <div className="font-mono text-white font-semibold flex items-center justify-between">
              <span>{config.whitelistedIp}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(config.whitelistedIp, 'Server IP')}
                className="text-emerald-400 hover:text-emerald-300 p-1"
                title="Copy IP"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-white/10 rounded border border-white/10 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-300">Terminal ID (TID)</div>
            <div className="font-mono text-white font-semibold flex items-center justify-between">
              <span>{config.tid}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(config.tid, 'TID')}
                className="text-emerald-400 hover:text-emerald-300 p-1"
                title="Copy TID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-white/10 rounded border border-white/10 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-300">Callback / Webhook URL</div>
            <div className="font-mono text-[11px] text-white truncate flex items-center justify-between">
              <span className="truncate">{config.callbackUrl}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(config.callbackUrl, 'Callback URL')}
                className="text-emerald-400 hover:text-emerald-300 p-1 shrink-0 ml-1"
                title="Copy URL"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-white/10 rounded border border-white/10 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-300">Success Redirect URL</div>
            <div className="font-mono text-[11px] text-white truncate flex items-center justify-between">
              <span className="truncate">{config.successUrl}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(config.successUrl, 'Success URL')}
                className="text-emerald-400 hover:text-emerald-300 p-1 shrink-0 ml-1"
                title="Copy URL"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Gateway State & Environment */}
        <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Gateway Status &amp; Execution Environment</h2>
              <p className="text-xs text-slate-500">Toggle live routing and switch between UAT testing and production</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.isEnabled}
                onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              <span className="ml-3 text-xs font-bold text-slate-900">
                {config.isEnabled ? 'Gateway Enabled' : 'Disabled'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setConfig({ ...config, environment: 'uat' })}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                config.environment === 'uat'
                  ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">UAT / Sandbox Mode</span>
                <span className={`w-2 h-2 rounded-full ${config.environment === 'uat' ? 'bg-emerald-600' : 'bg-slate-300'}`} />
              </div>
              <p className="text-[11px] text-slate-500">
                Routes transactions to <code>pay.testtoucanpay.in</code> for testing checkout flows and status checks without real bank debits.
              </p>
            </div>

            <div
              onClick={() => setConfig({ ...config, environment: 'production' })}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                config.environment === 'production'
                  ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900">Production Live Mode</span>
                <span className={`w-2 h-2 rounded-full ${config.environment === 'production' ? 'bg-emerald-600' : 'bg-slate-300'}`} />
              </div>
              <p className="text-[11px] text-slate-500">
                Live transactional payments via ToucanPay production cluster. Real UPI &amp; card authorization.
              </p>
            </div>
          </div>
        </div>

        {/* Merchant Credentials */}
        <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Merchant Account Credentials</h2>
            <p className="text-xs text-slate-500">Issued by Toucan Payments Operations team</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Input
              label="Merchant Legal Name"
              required
              value={config.merchantName}
              onChange={(e) => setConfig({ ...config, merchantName: e.target.value })}
              placeholder="e.g. Prajnadhara Infotech Private Limited"
            />

            <Input
              label="Merchant Login ID"
              required
              value={config.loginId}
              onChange={(e) => setConfig({ ...config, loginId: e.target.value })}
              placeholder="prajnadhar"
            />

            <Input
              label="Merchant ID (MID)"
              required
              value={config.mid}
              onChange={(e) => setConfig({ ...config, mid: e.target.value })}
              placeholder="962042872713381"
            />

            <Input
              label="Terminal ID (TID)"
              required
              value={config.tid}
              onChange={(e) => setConfig({ ...config, tid: e.target.value })}
              placeholder="78183008"
            />

            <div>
              <Input
                label="Merchant Portal Password"
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="Password@123"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Stored securely for dashboard login</span>
            </div>

            <div>
              <Input
                label="Merchant Region URL (murl)"
                required
                value={config.merchantRegionUrl}
                onChange={(e) => setConfig({ ...config, merchantRegionUrl: e.target.value })}
                placeholder="https://merchant.testtoucanpay.in/"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Sent in transaction session request body</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Mac Token (RS256 JWT Authorization Key)</span>
              <button
                type="button"
                onClick={() => copyToClipboard(config.macToken, 'Mac Token')}
                className="text-emerald-700 hover:text-emerald-900 text-[11px] font-medium flex items-center gap-1 normal-case"
              >
                <Copy className="w-3 h-3" /> Copy Token
              </button>
            </label>
            <textarea
              required
              rows={3}
              value={config.macToken}
              onChange={(e) => setConfig({ ...config, macToken: e.target.value })}
              placeholder="eyJhbGciOiJSUzI1NiJ9..."
              className="w-full bg-slate-50 text-slate-900 border border-slate-300 rounded p-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Passed in session initialization and Authorization: Bearer header for Status Check API.
            </p>
          </div>
        </div>

        {/* API Endpoints Configuration */}
        <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">API Gateway Endpoints &amp; Routing</h2>
            <p className="text-xs text-slate-500">Configured according to ToucanPay Check Out and Status Check specifications</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Input
              label="Checkout Session API (UAT)"
              required
              value={config.apiEndpointUat}
              onChange={(e) => setConfig({ ...config, apiEndpointUat: e.target.value })}
            />

            <Input
              label="Checkout Session API (Production)"
              required
              value={config.apiEndpointProd}
              onChange={(e) => setConfig({ ...config, apiEndpointProd: e.target.value })}
            />

            <Input
              label="Status Check API (UAT)"
              required
              value={config.statusCheckEndpointUat}
              onChange={(e) => setConfig({ ...config, statusCheckEndpointUat: e.target.value })}
            />

            <Input
              label="Status Check API (Production)"
              required
              value={config.statusCheckEndpointProd}
              onChange={(e) => setConfig({ ...config, statusCheckEndpointProd: e.target.value })}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={saving}
          >
            Save ToucanPay Configuration
          </Button>
        </div>
      </form>

      {/* Live Connectivity Diagnostic Section */}
      <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-800" />
              Live Gateway Diagnostic &amp; Session Test
            </h2>
            <p className="text-xs text-slate-500">
              Dispatches a test transaction to verify authorization token, SHA-512 hashing, and network firewall state.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded px-2.5 py-1">
              <span className="text-[11px] font-bold text-slate-500">Test Amount ₹</span>
              <input
                type="number"
                min="1"
                value={testAmount}
                onChange={(e) => setTestAmount(e.target.value)}
                className="w-14 bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={testing}
              onClick={handleTestConnection}
              leftIcon={<Zap className="w-3.5 h-3.5 text-emerald-700" />}
            >
              Test Gateway Connectivity
            </Button>
          </div>
        </div>

        {testResult && (
          <div className={`p-4 rounded-lg border text-xs font-mono space-y-2 ${
            testResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span>Status: {testResult.status}</span>
              <span>{testResult.success ? '✓ Gateway Session Responsive' : '⚠ Firewall Response'}</span>
            </div>
            {testResult.locationHeader && (
              <p className="text-[11px]">
                <strong>Redirect Location:</strong> {testResult.locationHeader}
              </p>
            )}
            {testResult.notice && (
              <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
                {testResult.notice}
              </p>
            )}
            {testResult.error && (
              <p className="text-[11px] text-rose-700">
                <strong>Error Detail:</strong> {testResult.error}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
