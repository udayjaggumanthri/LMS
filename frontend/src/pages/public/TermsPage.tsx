import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { cmsService } from '../../api/cmsService';
import { RichContentViewer } from '../../components/common/RichContentViewer';

export const TermsPage: React.FC = () => {
  const [termsCMS, setTermsCMS] = useState({
    badge: 'Policy',
    title: 'Terms & Conditions',
    subtitle: 'Please read these terms carefully before using our website and services.',
    content: ''
  });

  useEffect(() => {
    cmsService.getPage('terms').then(data => {
      const hero = data?.sectionMap?.['hero'] || data?.sections?.find(s => s.sectionKey === 'hero');
      if (hero) {
        setTermsCMS(prev => ({
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
          { label: 'Terms & Conditions' }
        ]}
        className="mb-6"
      />

      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
          {termsCMS.badge}
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-slate-950">
          {termsCMS.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {termsCMS.subtitle}
        </p>
      </div>

      {termsCMS.content && (
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
          <RichContentViewer content={termsCMS.content} />
        </div>
      )}

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed max-w-3xl">
        {/* 1. Acceptance of Terms */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the services of Prajnadhara Infotech Pvt Ltd, you acknowledge that you have read, understood, and agreed to comply with these Terms &amp; Conditions. If you do not agree with any part of these terms, kindly discontinue the use of our website and services.
          </p>
        </section>

        {/* 2. Our Services */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            2. Our Services
          </h2>
          <p>
            Prajnadhara Infotech Pvt Ltd provides educational and technology-based learning solutions, including online courses, training programs, certifications, live sessions, assessments, study materials, and other learning-related services across various domains.
          </p>
        </section>

        {/* 3. User Accounts */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            3. User Accounts
          </h2>
          <p>To access certain features or enroll in courses, users may need to create an account. By registering, you agree to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Provide accurate and complete information</li>
            <li>Maintain the confidentiality of your login credentials</li>
            <li>Update your account information whenever necessary</li>
            <li>Accept responsibility for activities under your account</li>
            <li>Notify us immediately in case of unauthorized access</li>
          </ul>
        </section>

        {/* 4. Course Enrollment & Access */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            4. Course Enrollment &amp; Access
          </h2>
          <p>Upon successful enrollment in a course or program:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>You receive a limited, non-transferable license to access course content</li>
            <li>Access is intended for personal and educational use only</li>
            <li>Sharing, reproducing, or reselling course materials is prohibited</li>
            <li>Course access duration may vary depending on the program details</li>
          </ul>
        </section>

        {/* 5. Payment Terms */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            5. Payment Terms
          </h2>
          <p>
            All payments must be completed at the time of enrollment or purchase. Prices displayed on the platform are generally in Indian Rupees (INR) unless otherwise specified. We reserve the right to modify pricing, offers, or discounts without prior notice.
          </p>
        </section>

        {/* 6. Intellectual Property Rights */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            6. Intellectual Property Rights
          </h2>
          <p>
            All content available on this website, including videos, documents, graphics, logos, software, and learning materials, are the intellectual property of Prajnadhara Infotech Pvt Ltd or respective content creators. Unauthorized copying, distribution, or commercial use is strictly prohibited.
          </p>
        </section>

        {/* 7. User Conduct */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            7. User Conduct
          </h2>
          <p>Users agree not to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Violate applicable laws or regulations</li>
            <li>Attempt unauthorized access to our systems</li>
            <li>Share account credentials with others</li>
            <li>Upload harmful or malicious content</li>
            <li>Disrupt or misuse the platform functionality</li>
            <li>Use bots or automated tools to access services</li>
          </ul>
        </section>

        {/* 8. Certificates */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            8. Certificates
          </h2>
          <p>
            Certificates may be issued upon successful completion of eligible courses or programs based on the instructor’s or institution’s evaluation criteria. Certificates are intended solely for skill recognition and do not represent formal degree accreditations unless specifically stated.
          </p>
        </section>

        {/* 9. Termination */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            9. Termination
          </h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate our policies or terms.
          </p>
        </section>

        {/* 10. Contact Us */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900">
            10. Contact Us
          </h2>
          <p>
            If you have any questions regarding these Terms &amp; Conditions, reach out to:{' '}
            <a href="mailto:contact@prajnadharaedu.com" className="text-emerald-800 font-semibold hover:underline">
              contact@prajnadharaedu.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
