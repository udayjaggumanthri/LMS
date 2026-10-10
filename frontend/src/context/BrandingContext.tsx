import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminService } from '../api/adminService';
import { apiClient } from '../api/client';

export interface BrandingData {
  platformName: string;
  siteTitle: string;
  logoUrl: string;
  faviconUrl: string;
}

interface BrandingContextType {
  branding: BrandingData;
  refreshBranding: () => Promise<void>;
  updateBrandingState: (newData: Partial<BrandingData>) => void;
}

const defaultBranding: BrandingData = {
  platformName: 'Prajnadhara EDU',
  siteTitle: 'Prajnadhara EDU – Enterprise Practical Engineering',
  logoUrl: '',
  faviconUrl: ''
};

const BrandingContext = createContext<BrandingContextType>({
  branding: defaultBranding,
  refreshBranding: async () => {},
  updateBrandingState: () => {}
});

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingData>(defaultBranding);

  const applyBrandingToDOM = (data: BrandingData) => {
    // Dynamic site title
    if (data.siteTitle) {
      document.title = data.siteTitle;
    }

    // Dynamic favicon
    if (data.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = data.faviconUrl;
    }
  };

  const fetchBranding = async () => {
    try {
      // Use public /settings/ or /admin/settings/
      const res = await apiClient.get('/settings/');
      const data = res.data;
      if (data) {
        const updated: BrandingData = {
          platformName: data.platformName || defaultBranding.platformName,
          siteTitle: data.siteTitle || defaultBranding.siteTitle,
          logoUrl: data.logoUrl || '',
          faviconUrl: data.faviconUrl || ''
        };
        setBranding(updated);
        applyBrandingToDOM(updated);
      }
    } catch (err) {
      // Fallback silently if offline or initial load
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const updateBrandingState = (newData: Partial<BrandingData>) => {
    setBranding(prev => {
      const next = { ...prev, ...newData };
      applyBrandingToDOM(next);
      return next;
    });
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        refreshBranding: fetchBranding,
        updateBrandingState
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => useContext(BrandingContext);
