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
  const [applications, setApplications] = useState<any[]>([]);
  const [credentialNotice, setCredentialNotice] = useState('');

  const [config, setConfig] = useState({
    providerName: 'ToucanPay',
    isEnabled: true,
    environment: '',
    merchantName: '',
    loginId: '',
    mid: '',
    tid: '',
    password: '',
    macToken: '',
    checkoutSessionUrl: '',
    statusCheckUrl: '',
    merchantPortalUrl: '',
    merchantRegionUrl: '',
    successUrl: '',
    failureUrl: '',
    callbackUrl: '',
    whitelistedIp: '',
    allowSandboxSimulationOnTimeout: false
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
    adminService.getPaymentApplications()
      .then((rows) => setApplications(Array.isArray(rows) ? rows : []))
      .catch(() => setApplications([]));
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

  const fillReturnUrlsFromThisSite = () => {
    const { protocol, hostname, port, origin } = window.location;
    const apiOrigin = port === '3010' ? `${protocol}//${hostname}:8010` : origin;
    setConfig({
      ...config,
      successUrl: `${origin}/order-confirmation`,
      failureUrl: `${origin}/checkout?status=failed`,
      callbackUrl: `${apiOrigin}/api/payments/toucan/callback/`,
    });
    showToast('Return addresses filled from this website. Save to keep them.', 'info');
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
            One set of credentials and addresses. Replace them here when the gateway profile changes.
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
              These are the system coordinates required by Toucan Payments Operations (Prashanth Nuka) to whitelist and connect PrajnadharaEdu to the gateway network:
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
              <span className="truncate">{config.callbackUrl || 'Not set'}</span>
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
              <span className="truncate">{config.successUrl || 'Not set'}</span>
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

          <div className="p-3 bg-white/10 rounded border border-white/10 space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-300">Failure Redirect URL</div>
            <div className="font-mono text-[11px] text-white truncate flex items-center justify-between">
              <span className="truncate">{config.failureUrl || 'Not set'}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(config.failureUrl, 'Failure URL')}
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
              <h2 className="text-sm font-bold text-slate-900">Gateway status</h2>
              <p className="text-xs text-slate-500">Checkout calls only the addresses saved on this page.</p>
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
              placeholder="Enter Merchant Login ID"
            />

            <Input
              label="Merchant ID (MID)"
              required
              value={config.mid}
              onChange={(e) => setConfig({ ...config, mid: e.target.value })}
              placeholder="Enter Merchant ID (MID)"
            />

            <Input
              label="Terminal ID (TID)"
              required
              value={config.tid}
              onChange={(e) => setConfig({ ...config, tid: e.target.value })}
              placeholder="Enter Terminal ID (TID)"
            />

            <div>
              <Input
                label="Merchant Portal Password"
                type="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                placeholder="Enter Password (leave blank to keep unchanged)"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Stored encrypted with AES at rest in database</span>
            </div>

            <Input
              label="Merchant region URL"
              required
              value={config.merchantRegionUrl}
              onChange={(e) => setConfig({ ...config, merchantRegionUrl: e.target.value })}
              placeholder="https://merchant.example/"
              helper="Sent with every checkout exactly as saved."
            />

            <Input
              label="Merchant portal URL"
              value={config.merchantPortalUrl}
              onChange={(e) => setConfig({ ...config, merchantPortalUrl: e.target.value })}
              placeholder="https://merchant.example"
              helper="Opens from the merchant portal link on this page."
            />

            <Input
              label="Server IP shared with the gateway"
              value={config.whitelistedIp}
              onChange={(e) => setConfig({ ...config, whitelistedIp: e.target.value })}
              placeholder="Public IP ToucanPay should allow"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Mac Token (RS256 JWT Authorization Key - Encrypted at Rest)</span>
              {config.macToken && !config.macToken.startsWith('••••') && (
                <button
                  type="button"
                  onClick={() => copyToClipboard(config.macToken, 'Mac Token')}
                  className="text-emerald-700 hover:text-emerald-900 text-[11px] font-medium flex items-center gap-1 normal-case"
                >
                  <Copy className="w-3 h-3" /> Copy Token
                </button>
              )}
            </label>
            <textarea
              required
              rows={3}
              value={config.macToken}
              onChange={(e) => setConfig({ ...config, macToken: e.target.value })}
              placeholder="Paste RSA256 MAC JWT Token here..."
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
            <h2 className="text-sm font-bold text-slate-900">Gateway addresses</h2>
            <p className="text-xs text-slate-500">Checkout and status checks call these addresses. Change them when you replace the gateway profile.</p>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <Input
              label="Checkout session URL"
              required
              value={config.checkoutSessionUrl}
              onChange={(e) => setConfig({ ...config, checkoutSessionUrl: e.target.value })}
              placeholder="https://pay.example/api/auth/getpaymentsession"
              helper="Where a new payment session is created."
            />

            <Input
              label="Status check URL"
              required
              value={config.statusCheckUrl}
              onChange={(e) => setConfig({ ...config, statusCheckUrl: e.target.value })}
              placeholder="https://pay.example/api/pay/v1/checkStatus"
              helper="Where this site asks whether a payment succeeded."
            />
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Shopper return addresses</h2>
              <p className="text-xs text-slate-500">
                Checkout uses these saved addresses. Change them here when the site domain changes. Nothing in the payment flow is fixed to one domain.
              </p>
            </div>
            <Button type="button" variant="secondary" size="sm" onClick={fillReturnUrlsFromThisSite}>
              Use this website
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 text-xs">
            <Input
              label="Success URL"
              value={config.successUrl}
              onChange={(e) => setConfig({ ...config, successUrl: e.target.value })}
              placeholder="https://your-domain/order-confirmation"
              helper="Where the shopper returns after a completed payment."
            />
            <Input
              label="Failure URL"
              value={config.failureUrl}
              onChange={(e) => setConfig({ ...config, failureUrl: e.target.value })}
              placeholder="https://your-domain/checkout?status=failed"
              helper="Where the shopper returns when the payment is declined or cancelled."
            />
            <Input
              label="Callback URL"
              value={config.callbackUrl}
              onChange={(e) => setConfig({ ...config, callbackUrl: e.target.value })}
              placeholder="https://your-domain/api/payments/toucan/callback/"
              helper="The address to give ToucanPay so their server can confirm a payment."
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
              <span>{testResult.success ? 'Checkout session opened' : (testResult.message || 'Gateway did not open a checkout session')}</span>
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

      <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Registered applications</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Each application has its own credential, return addresses, and provider profile. Turn one off here to stop new checkouts for that application. Checkout is refused until that application's provider profile is approved.
          </p>
        </div>
        {credentialNotice && (
          <p className="text-xs font-mono bg-amber-50 border border-amber-200 text-amber-950 rounded p-3 break-all">
            {credentialNotice}
          </p>
        )}
        <div className="space-y-4">
          {applications.map((app) => (
            <form
              key={`${app.id}-${app.enabled}-${app.successUrl}`}
              className="grid gap-3 border border-slate-100 rounded-lg p-4"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                try {
                  const saved = await adminService.updatePaymentApplication(app.id, {
                    enabled: form.get('enabled') === 'on',
                    baseUrl: String(form.get('baseUrl') || ''),
                    successUrl: String(form.get('successUrl') || ''),
                    failureUrl: String(form.get('failureUrl') || ''),
                    resultEndpoint: String(form.get('resultEndpoint') || ''),
                  });
                  setApplications((current) => current.map((row) => (row.id === saved.id ? saved : row)));
                  showToast(`${saved.name} saved`, 'success');
                } catch (err: any) {
                  showToast(err?.message || 'Could not save the application', 'error');
                }
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{app.name}</p>
                  <p className="text-[11px] font-mono text-slate-500">{app.applicationId} · key {app.keyPrefix || 'none'}</p>
                  <p className={`text-[11px] mt-1 ${app.providerApproved ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {app.providerApproved
                      ? `Provider ${app.providerProfileName || 'profile'} is approved`
                      : `Provider ${app.providerProfileName || 'profile'} is not approved, so checkout is refused`}
                  </p>
                </div>
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                  <input name="enabled" type="checkbox" defaultChecked={app.enabled} />
                  Enabled
                </label>
              </div>
              <input name="baseUrl" defaultValue={app.baseUrl || ''} placeholder="Base URL" className="w-full rounded border border-slate-200 px-3 py-2 text-xs" />
              <input name="successUrl" defaultValue={app.successUrl || ''} placeholder="Success URL" className="w-full rounded border border-slate-200 px-3 py-2 text-xs" />
              <input name="failureUrl" defaultValue={app.failureUrl || ''} placeholder="Failure URL" className="w-full rounded border border-slate-200 px-3 py-2 text-xs" />
              <input name="resultEndpoint" defaultValue={app.resultEndpoint || ''} placeholder="Result endpoint" className="w-full rounded border border-slate-200 px-3 py-2 text-xs" />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm">Save application</Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const rotated = await adminService.rotatePaymentCredential(app.id);
                      setCredentialNotice(`New credential for ${rotated.applicationId}. Copy it now. API key: ${rotated.apiKey}  HMAC secret: ${rotated.hmacSecret}`);
                    } catch (err: any) {
                      showToast(err?.message || 'Could not rotate the credential', 'error');
                    }
                  }}
                >
                  Rotate credential
                </Button>
              </div>
            </form>
          ))}
          {applications.length === 0 && (
            <p className="text-xs text-slate-500">No applications loaded.</p>
          )}
        </div>
      </section>
    </div>
  );
};
