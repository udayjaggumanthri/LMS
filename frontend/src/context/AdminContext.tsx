import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { InstructorApplication, PayoutRequest, Coupon } from '../types';
import { adminService } from '../api/adminService';

interface PlatformSettings {
  commissionPercent: number;
  platformName: string;
  supportEmail: string;
  minPayoutThreshold: number;
}

interface AdminContextType {
  instructorApplications: InstructorApplication[];
  payoutRequests: PayoutRequest[];
  coupons: Coupon[];
  settings: PlatformSettings;
  submitInstructorApplication: (app: Omit<InstructorApplication, 'id' | 'status' | 'submittedAt'>) => Promise<void>;
  approveInstructorApplication: (id: string) => Promise<void>;
  rejectInstructorApplication: (id: string, feedback?: string) => Promise<void>;
  requestPayout: (amount: number, method: string, instructorId: string, instructorName: string, instructorEmail: string) => Promise<void>;
  approvePayout: (id: string) => Promise<void>;
  rejectPayout: (id: string) => Promise<void>;
  createCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => Promise<void>;
  toggleCouponActive: (id: string) => Promise<void>;
  updateSettings: (newSettings: Partial<PlatformSettings>) => Promise<void>;
  reloadAdmin: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const EMPTY_SETTINGS: PlatformSettings = {
  commissionPercent: 30,
  platformName: 'PrajnadharaEdu',
  supportEmail: '',
  minPayoutThreshold: 0,
};

function mapApplication(a: any): InstructorApplication {
  return {
    id: String(a.id),
    userId: String(a.user || a.userId || ''),
    applicantName: a.applicant_name || a.applicantName || 'Applicant',
    email: a.email || '',
    expertise: a.expertise || '',
    experienceBio: a.experience_bio || a.experienceBio || '',
    sampleTopic: a.sample_topic || a.sampleTopic || '',
    linkedinOrPortfolio: a.linkedin_or_portfolio || a.linkedinOrPortfolio || '',
    status: a.status || 'pending',
    submittedAt: a.created_at ? String(a.created_at).slice(0, 10) : '',
    adminFeedback: a.admin_feedback || a.adminFeedback || '',
  };
}

function mapPayout(p: any): PayoutRequest {
  return {
    id: String(p.id),
    instructorId: String(p.instructorId || p.instructor_id || ''),
    instructorName: p.instructorName || '',
    instructorEmail: p.instructorEmail || '',
    amount: Number(p.amount),
    method: p.method,
    status: p.status,
    requestedAt: p.requestedAt || '',
    processedAt: p.processedAt || undefined,
  };
}

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instructorApplications, setInstructorApplications] = useState<InstructorApplication[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(EMPTY_SETTINGS);

  const reloadAdmin = useCallback(async () => {
    const token = localStorage.getItem('prajnadhara_token');
    if (!token) {
      setInstructorApplications([]);
      setPayoutRequests([]);
      setCoupons([]);
      return;
    }
    const [apps, payoutRows, couponRows, platform] = await Promise.all([
      adminService.getInstructorApplications().catch(() => []),
      adminService.getPayouts().catch(() => adminService.getMyPayouts().catch(() => [])),
      adminService.getCoupons().catch(() => []),
      adminService.getPlatformSettings().catch(() => null),
    ]);
    setInstructorApplications(Array.isArray(apps) ? apps.map(mapApplication) : []);
    setPayoutRequests(Array.isArray(payoutRows) ? payoutRows.map(mapPayout) : []);
    setCoupons(Array.isArray(couponRows) ? couponRows : []);
    if (platform) {
      setSettings({
        commissionPercent: Number(platform.platformFeePercent ?? platform.platform_fee_percent ?? 30),
        platformName: platform.platformName || platform.platform_name || 'PrajnadharaEdu',
        supportEmail: platform.supportEmail || platform.support_email || '',
        minPayoutThreshold: 0,
      });
    }
  }, []);

  useEffect(() => {
    ['prajnadhara_instructor_apps_v1', 'prajnadhara_payouts_v1', 'prajnadhara_coupons_admin_v1', 'prajnadhara_settings_v1'].forEach((key) => {
      localStorage.removeItem(key);
    });
    reloadAdmin().catch(() => undefined);
  }, [reloadAdmin]);

  const submitInstructorApplication = async (appData: Omit<InstructorApplication, 'id' | 'status' | 'submittedAt'>) => {
    const saved = await adminService.submitInstructorApplication({
      applicant_name: appData.applicantName,
      email: appData.email,
      expertise: appData.expertise,
      experience_bio: appData.experienceBio,
      sample_topic: appData.sampleTopic,
      linkedin_or_portfolio: appData.linkedinOrPortfolio || '',
    });
    setInstructorApplications((prev) => [mapApplication(saved), ...prev]);
  };

  const approveInstructorApplication = async (id: string) => {
    await adminService.updateApplicationStatus(id, 'approved', 'Approved by administrator.');
    setInstructorApplications((prev) => prev.map((a) => (String(a.id) === String(id) ? { ...a, status: 'approved' } : a)));
  };

  const rejectInstructorApplication = async (id: string, feedback?: string) => {
    const note = feedback || 'Application does not meet current criteria.';
    await adminService.updateApplicationStatus(id, 'rejected', note);
    setInstructorApplications((prev) => prev.map((a) => (String(a.id) === String(id) ? { ...a, status: 'rejected', adminFeedback: note } : a)));
  };

  const requestPayout = async (amount: number, method: string) => {
    const saved = await adminService.requestPayout({ amount, method });
    setPayoutRequests((prev) => [mapPayout(saved), ...prev]);
  };

  const approvePayout = async (id: string) => {
    const saved = await adminService.actOnPayout(id, 'approve');
    setPayoutRequests((prev) => prev.map((p) => (String(p.id) === String(id) ? mapPayout(saved) : p)));
  };

  const rejectPayout = async (id: string) => {
    const saved = await adminService.actOnPayout(id, 'reject');
    setPayoutRequests((prev) => prev.map((p) => (String(p.id) === String(id) ? mapPayout(saved) : p)));
  };

  const createCoupon = async (couponData: Omit<Coupon, 'id' | 'usedCount'>) => {
    const saved = await adminService.createCoupon({
      code: couponData.code,
      discountPercent: couponData.discountPercent,
      maxUses: couponData.maxUses,
      expiresAt: couponData.expiresAt,
      active: couponData.active,
    });
    setCoupons((prev) => [saved, ...prev]);
  };

  const toggleCouponActive = async (id: string) => {
    const current = coupons.find((c) => String(c.id) === String(id));
    if (!current) return;
    const saved = await adminService.updateCoupon(id, { active: !current.active });
    setCoupons((prev) => prev.map((c) => (String(c.id) === String(id) ? saved : c)));
  };

  const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
    const saved = await adminService.updatePlatformSettings({
      platformName: newSettings.platformName ?? settings.platformName,
      supportEmail: newSettings.supportEmail ?? settings.supportEmail,
      platformFeePercent: newSettings.commissionPercent ?? settings.commissionPercent,
    });
    setSettings((prev) => ({
      ...prev,
      ...newSettings,
      platformName: saved.platformName || prev.platformName,
      supportEmail: saved.supportEmail || prev.supportEmail,
      commissionPercent: Number(saved.platformFeePercent ?? prev.commissionPercent),
    }));
  };

  return (
    <AdminContext.Provider
      value={{
        instructorApplications,
        payoutRequests,
        coupons,
        settings,
        submitInstructorApplication,
        approveInstructorApplication,
        rejectInstructorApplication,
        requestPayout,
        approvePayout,
        rejectPayout,
        createCoupon,
        toggleCouponActive,
        updateSettings,
        reloadAdmin,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};
