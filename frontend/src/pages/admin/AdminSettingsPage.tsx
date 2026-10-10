import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  ShieldCheck,
  CreditCard,
  Building2,
  Mail,
  Users,
  CheckCircle2,
  ExternalLink,
  Lock
} from 'lucide-react';
import { adminService } from '../../api/adminService';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { MediaUploader } from '../../components/common/MediaUploader';
import { useBranding } from '../../context/BrandingContext';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useNotifications();
  const { updateBrandingState } = useBranding();

  const [activeTab, setActiveTab] = useState<'governance' | 'gateways' | 'identity' | 'compliance'>('governance');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    platformName: 'PrajnadharaEdu',
    siteTitle: 'PrajnadharaEdu – Enterprise Practical Engineering',
    logoUrl: '',
    faviconUrl: '',
    supportEmail: 'support@prajnadhara.edu',
    currency: 'INR',
    currencySymbol: '₹',
    gstRatePercent: 18,
    autoApproveInstructors: false,
    allowInstructorRegistration: false,
    maintenanceMode: false
  });

  const [supportHotline, setSupportHotline] = useState('+91 80 4718 2000');
  const [tagline, setTagline] = useState('Practical Skill-Based Online Learning Marketplace');
  const [gstNumber, setGstNumber] = useState('37AABCP1824M1Z8');
  const [upiEnabled, setUpiEnabled] = useState(true);

  useEffect(() => {
    adminService.getPlatformSettings()
      .then((data) => {
        if (data) {
          setFormData(prev => ({
            ...prev,
            ...data
          }));
        }
      })
      .catch(() => {
        showToast('Failed to load platform settings', 'error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await adminService.updatePlatformSettings(formData);
      updateBrandingState({
        platformName: formData.platformName,
        siteTitle: formData.siteTitle,
        logoUrl: formData.logoUrl,
        faviconUrl: formData.faviconUrl
      });
      showToast('Global platform settings updated successfully!', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Failed to save platform configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl text-left space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Platform Settings & Governance
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure instructor onboarding switches, payment gateway orchestration, GSTIN tax, and support channels
          </p>
        </div>

        <Link to="/admin/smtp">
          <Button variant="outline" size="sm" leftIcon={<Mail className="w-3.5 h-3.5 text-emerald-800" />}>
            Configure Mail SMTP &rarr;
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('governance')}
          className={`px-4 py-2.5 font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'governance'
              ? 'border-emerald-800 text-emerald-950'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Instructor & Platform Switches
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gateways')}
          className={`px-4 py-2.5 font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'gateways'
              ? 'border-emerald-800 text-emerald-950'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Payment Gateways & UPI
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('identity')}
          className={`px-4 py-2.5 font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'identity'
              ? 'border-emerald-800 text-emerald-950'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Brand & Communications
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2.5 font-semibold whitespace-nowrap border-b-2 transition-colors ${
            activeTab === 'compliance'
              ? 'border-emerald-800 text-emerald-950'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Tax & GST Compliance
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
        {/* Tab 1: Governance & Instructor Registration Toggle */}
        {activeTab === 'governance' && (
          <div className="space-y-4">
            <div className="p-6 border border-slate-200 rounded-lg bg-white space-y-4 shadow-2xs">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-800" />
                <span>Instructor Onboarding Control</span>
              </h3>

              {/* Toggle: Allow Public Instructor Registration */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    Allow Public Instructor Self-Registration & Application Form
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    When <strong>Disabled (Recommended)</strong>: Public registration for instructors is closed. Administrators create and assign instructors directly via the Users Directory, keeping faculty quality tightly curated.
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.allowInstructorRegistration}
                    onChange={(e) => setFormData({ ...formData, allowInstructorRegistration: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
                </label>
              </div>

              {/* Auto-Approve Created Instructors */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    Auto-Approve Instructors Added by Admin
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Immediately grant verified author permissions to new faculty accounts without requiring manual application review.
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.autoApproveInstructors}
                    onChange={(e) => setFormData({ ...formData, autoApproveInstructors: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
                </label>
              </div>

              {/* Maintenance Mode */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900 text-xs">
                    Platform Maintenance Mode
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Show maintenance splash screen to students during major database migrations or upgrades.
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.maintenanceMode}
                    onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Gateways */}
        {activeTab === 'gateways' && (
          <div className="p-6 border border-slate-200 rounded-lg bg-white space-y-4 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-800" />
              <span>Payment Gateway Orchestration</span>
            </h3>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-slate-700 text-xs leading-relaxed">
              Active Provider: <strong>Loosely Coupled Plug-and-Play Gateway Service</strong> with native support for UPI VPAs, Netbanking, Cards, and automated GST invoice issuance.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Primary Storefront Currency Code"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                required
              />
              <Input
                label="Currency Symbol"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                required
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">Unified Payments Interface (UPI) Instant Checkout</span>
                <span className="text-slate-500 text-[11px]">Allow Google Pay, PhonePe, Paytm, and BHIM QR scan checkout</span>
              </div>
              <input
                type="checkbox"
                checked={upiEnabled}
                onChange={(e) => setUpiEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-800 rounded border-slate-300 focus:ring-emerald-700"
              />
            </div>
          </div>
        )}

        {/* Tab 3: Identity & Branding */}
        {activeTab === 'identity' && (
          <div className="p-6 border border-slate-200 rounded-lg bg-white space-y-5 shadow-2xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Platform Brand Identity &amp; Communications
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Customize site title, logo icon, browser tab favicon, and platform naming.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Site Title (Browser Tab & SEO Title)"
                value={formData.siteTitle}
                onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
                placeholder="e.g. PrajnadharaEdu – Enterprise Practical Engineering"
                required
              />

              <Input
                label="Platform Brand Name"
                value={formData.platformName}
                onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                placeholder="e.g. PrajnadharaEdu"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <MediaUploader
                label="Storefront Header & Footer Logo"
                value={formData.logoUrl}
                onChange={(newUrl) => setFormData({ ...formData, logoUrl: newUrl })}
                helperText="Upload custom logo image or select from Media Library (PNG, SVG, WebP)"
              />

              <MediaUploader
                label="Browser Tab Favicon (ICO / PNG / SVG)"
                value={formData.faviconUrl}
                onChange={(newUrl) => setFormData({ ...formData, faviconUrl: newUrl })}
                helperText="Upload 32x32 or 64x64 favicon to display in browser tabs"
              />
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Input
                label="Marketplace Tagline / Slogan"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <Input
                label="Support Inbound Email"
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                required
              />
              <Input
                label="Support Customer Helpline"
                value={supportHotline}
                onChange={(e) => setSupportHotline(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {/* Tab 4: Compliance */}
        {activeTab === 'compliance' && (
          <div className="p-6 border border-slate-200 rounded-lg bg-white space-y-4 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
              Statutory Taxes & GST Invoicing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Marketplace Operator GSTIN"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                helper="Mandatory for statutory tax invoices and filing."
              />
              <Input
                label="Applicable GST Rate (%)"
                type="number"
                value={formData.gstRatePercent}
                onChange={(e) => setFormData({ ...formData, gstRatePercent: Number(e.target.value) })}
                helper="Standard Indian GST rate (18%)."
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={saving}
          >
            Save & Publish Settings &rarr;
          </Button>
        </div>
      </form>
    </div>
  );
};
