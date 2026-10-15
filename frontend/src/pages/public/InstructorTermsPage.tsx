import React, { useEffect, useState } from 'react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { cmsService } from '../../api/cmsService';

export const InstructorTermsPage: React.FC = () => {
  const [heading, setHeading] = useState({
    badge: 'Instructor Partnership Agreement',
    title: 'Instructor Terms',
    subtitle: 'Last Updated: October 1, 2026',
  });

  useEffect(() => {
    cmsService.getPage('instructor-terms').then((data) => {
      const hero = data?.sectionMap?.hero || data?.sections?.find((section) => section.sectionKey === 'hero');
      if (!hero) return;
      setHeading((prev) => ({
        badge: hero.badgeText || prev.badge,
        title: hero.title || prev.title,
        subtitle: hero.subtitle || prev.subtitle,
      }));
    }).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-left text-slate-900">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Teach', href: '/teach' },
          { label: 'Instructor Terms' }
        ]}
        className="mb-6"
      />

      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
          {heading.badge}
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-slate-950">
          {heading.title}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {heading.subtitle}
        </p>
      </div>

      <div className="space-y-8 text-xs text-slate-700 leading-relaxed max-w-2xl">
        <section className="space-y-3">
          <h2 className="text-base font-bold font-display text-slate-900">1. Instructor Eligibility & Review</h2>
          <p>
            When you apply to become an instructor on PrajnadharaEdu, our editorial board conducts a review of your subject-matter credentials, past engineering or corporate experience, and course syllabus proposal. Approval is granted at the sole discretion of the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold font-display text-slate-900">2. Course pricing</h2>
          <p>
            Course prices are set in Indian Rupees when the course is created. Promotional coupon codes are managed by the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold font-display text-slate-900">3. Intellectual Property & Content Quality</h2>
          <p>
            You retain all underlying intellectual property rights to your instructional videos, source code, and lesson plans. By publishing on PrajnadharaEdu, you grant the platform a worldwide, non-exclusive license to host, transcode, and stream your content to enrolled students.
          </p>
        </section>
      </div>
    </div>
  );
};
