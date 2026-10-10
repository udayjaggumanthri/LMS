import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { cmsService } from '../../api/cmsService';

export const PrivacyPage: React.FC = () => {
  const [privacyCMS, setPrivacyCMS] = useState({
    badge: 'Policy',
    title: 'Privacy Policy',
    subtitle: 'Last Updated: 2026 · PrajnadharaEdu',
    content: ''
  });

  useEffect(() => {
    cmsService.getPage('privacy').then(data => {
      const hero = data?.sectionMap?.['hero'] || data?.sections?.find(s => s.sectionKey === 'hero');
      if (hero) {
        setPrivacyCMS(prev => ({
          badge: hero.badgeText || prev.badge,
          title: hero.title || prev.title,
          subtitle: hero.subtitle || prev.subtitle,
          content: hero.content || prev.content
        }));
      }
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-left text-slate-900">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Policy', href: '/privacy' },
          { label: 'Privacy Policy' }
        ]}
        className="mb-6"
      />

      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
          {privacyCMS.badge}
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-slate-950">
          {privacyCMS.title}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {privacyCMS.subtitle}
        </p>
      </div>

      {privacyCMS.content && (
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm leading-relaxed whitespace-pre-line">
          {privacyCMS.content}
        </div>
      )}

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed max-w-3xl">
        {/* 1. Introduction */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            1. Introduction :
          </h2>
          <p>
            PrajnadharaEdu ("we", "our", or "us") is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you access our learning platform and courses.
          </p>
        </section>

        {/* 2. Information We Collect */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            2. Information We Collect :
          </h2>
          <p>We collect information that you provide directly, including:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Personal details (name, email address, phone number)</li>
            <li>Account login credentials</li>
            <li>Payment details (processed securely via payment gateways)</li>
            <li>Course enrolments and learning progress</li>
            <li>Communication with support team</li>
            <li>Profile details provided by users</li>
          </ul>
        </section>

        {/* 3. How We Use Your Information */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            3. How We Use Your Information :
          </h2>
          <p>We use your data to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Provide and improve our LMS platform</li>
            <li>Manage course enrollments and user accounts</li>
            <li>Process payments and send confirmations</li>
            <li>Offer support and respond to queries</li>
            <li>Send updates about courses and offers (with your consent)</li>
            <li>Ensure platform security and prevent misuse</li>
          </ul>
        </section>

        {/* 4. Information Sharing */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            4. Information Sharing :
          </h2>
          <p>
            We do not sell your personal information. We may share data with trusted partners such as payment gateways, hosting providers, and tools required to operate our LMS platform.
          </p>
        </section>

        {/* 5. Data Security */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            5. Data Security :
          </h2>
          <p>
            We use industry-standard security measures to protect your data. However, no online system is completely secure, and users should take precautions to protect their login details.
          </p>
        </section>

        {/* 6. Your Rights */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            6. Your Rights :
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Access your personal data</li>
            <li>Update or correct your information</li>
            <li>Request deletion of your account</li>
            <li>Withdraw consent for communications</li>
          </ul>
        </section>

        {/* 7. Cookies */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            7. Cookies :
          </h2>
          <p>
            We use cookies to enhance your learning experience, track usage, and improve platform performance. You can disable cookies through your browser settings.
          </p>
        </section>

        {/* 8. Children's Privacy */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            8. Children's Privacy :
          </h2>
          <p>
            We use cookies to enhance your learning experience, track usage, and improve platform performance. You can disable cookies through your browser settings.
          </p>
        </section>

        {/* 9. Changes to This Policy */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            9. Changes to This Policy :
          </h2>
          <p>
            We may update this Privacy Policy periodically. Changes will be posted on this page with an updated date.
          </p>
        </section>

        {/* 10. Contact Us */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            10. Contact Us :
          </h2>
          <p>
            If you have any questions regarding this Privacy Policy, contact us at:{' '}
            <a href="mailto:support@prajnadharaedu.com" className="text-emerald-800 font-semibold hover:underline">
              support@prajnadharaedu.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
