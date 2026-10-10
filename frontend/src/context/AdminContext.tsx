import React, { createContext, useContext, useState, useEffect } from 'react';
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
  submitInstructorApplication: (app: Omit<InstructorApplication, 'id' | 'status' | 'submittedAt'>) => void;
  approveInstructorApplication: (id: string) => void;
  rejectInstructorApplication: (id: string, feedback?: string) => void;
  requestPayout: (amount: number, method: string, instructorId: string, instructorName: string, instructorEmail: string) => void;
  approvePayout: (id: string) => void;
  rejectPayout: (id: string) => void;
  createCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount'>) => void;
  toggleCouponActive: (id: string) => void;
  updateSettings: (newSettings: Partial<PlatformSettings>) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const APPS_STORAGE_KEY = 'prajnadhara_instructor_apps_v1';
const PAYOUTS_STORAGE_KEY = 'prajnadhara_payouts_v1';
const COUPONS_STORAGE_KEY = 'prajnadhara_coupons_admin_v1';
const SETTINGS_STORAGE_KEY = 'prajnadhara_settings_v1';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [instructorApplications, setInstructorApplications] = useState<InstructorApplication[]>(() => {
    try {
      const saved = localStorage.getItem(APPS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>(() => {
    try {
      const saved = localStorage.getItem(PAYOUTS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem(COUPONS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  const [settings, setSettings] = useState<PlatformSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      commissionPercent: 15,
      platformName: 'PrajnadharaEdu',
      supportEmail: 'support@prajnadhara.edu',
      minPayoutThreshold: 1000
    };
  });

  // Fetch real applications from backend
  useEffect(() => {
    adminService.getInstructorApplications()
      .then((data) => {
        if (data && Array.isArray(data)) {
          const mapped: InstructorApplication[] = data.map((a: any) => ({
            id: String(a.id),
            userId: String(a.user || a.userId || a.id),
            applicantName: a.applicant_name || a.applicantName || (a.user_details ? `${a.user_details.first_name} ${a.user_details.last_name}` : 'Applicant'),
            email: a.email || a.user_details?.email || '',
            expertise: a.expertise || a.sample_topic || 'Engineering',
            experienceBio: a.experience_bio || a.experienceBio || '',
            sampleTopic: a.sample_topic || a.sampleTopic || '',
            linkedinOrPortfolio: a.portfolio_url || a.portfolioUrl,
            status: a.status || 'pending',
            submittedAt: a.created_at ? new Date(a.created_at).toISOString().split('T')[0] : '2026-10-09',
            adminFeedback: a.admin_feedback || a.adminFeedback
          }));
          setInstructorApplications(mapped);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(instructorApplications));
  }, [instructorApplications]);

  useEffect(() => {
    localStorage.setItem(PAYOUTS_STORAGE_KEY, JSON.stringify(payoutRequests));
  }, [payoutRequests]);

  useEffect(() => {
    localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const submitInstructorApplication = (appData: Omit<InstructorApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApp: InstructorApplication = {
      ...appData,
      id: `app-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0]
    };
    setInstructorApplications(prev => [newApp, ...prev]);
  };

  const approveInstructorApplication = (id: string) => {
    setInstructorApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    adminService.updateApplicationStatus(id, 'approved', 'Approved by administrator.').catch(() => {});
  };

  const rejectInstructorApplication = (id: string, feedback?: string) => {
    setInstructorApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected', adminFeedback: feedback } : a));
    adminService.updateApplicationStatus(id, 'rejected', feedback || 'Application does not meet current criteria.').catch(() => {});
  };

  const requestPayout = (amount: number, method: string, instructorId: string, instructorName: string, instructorEmail: string) => {
    const newPayout: PayoutRequest = {
      id: `pay-${Date.now()}`,
      instructorId,
      instructorName,
      instructorEmail,
      amount,
      method,
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0]
    };
    setPayoutRequests(prev => [newPayout, ...prev]);
  };

  const approvePayout = (id: string) => {
    setPayoutRequests(prev => prev.map(p => p.id === id ? { ...p, status: 'completed', processedAt: new Date().toISOString().split('T')[0] } : p));
  };

  const rejectPayout = (id: string) => {
    setPayoutRequests(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected', processedAt: new Date().toISOString().split('T')[0] } : p));
  };

  const createCoupon = (couponData: Omit<Coupon, 'id' | 'usedCount'>) => {
    const newCoupon: Coupon = {
      ...couponData,
      id: `coup-${Date.now()}`,
      usedCount: 0
    };
    setCoupons(prev => [newCoupon, ...prev]);
  };

  const toggleCouponActive = (id: string) => {
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const updateSettings = (newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
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
        updateSettings
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
