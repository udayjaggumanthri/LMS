import React from 'react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export const InstructorTermsPage: React.FC = () => {
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
          Instructor Partnership Agreement
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-slate-950">
          Instructor Terms & Revenue Sharing Agreement
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Last Updated: October 1, 2026 · Standard 85/15 Economics
        </p>
      </div>

      <div className="space-y-8 text-xs text-slate-700 leading-relaxed max-w-2xl">
        <section className="space-y-3">
          <h2 className="text-base font-bold font-display text-slate-900">1. Instructor Eligibility & Review</h2>
          <p>
            When you apply to become an instructor on Prajnadhara EDU, our editorial board conducts a review of your subject-matter credentials, past engineering or corporate experience, and course syllabus proposal. Approval is granted at the sole discretion of the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold font-display text-slate-900">2. Revenue Share & Platform Commission</h2>
          <p>
            Prajnadhara EDU operates with the most creator-favorable revenue split in the online learning sector:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li><strong>Instructor Share:</strong> You receive <strong>85%</strong> of net revenue on every course enrollment.</li>
            <li><strong>Platform Fee:</strong> Prajnadhara EDU retains <strong>15%</strong> to fund server bandwidth, video transcoding, payment gateway fees, fraud detection, and 24/7 student support.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold font-display text-slate-900">3. Pricing, Coupons & Promotions</h2>
          <p>
            You have complete autonomy to establish your base price in Indian Rupees (INR) from our approved tiers (ranging from free up to ₹4,999). You can generate customized promotion coupon codes at any time from your instructor portal.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold font-display text-slate-900">4. Payout Procedures & Schedule</h2>
          <p>
            Earnings accrue in your instructor balance upon expiration of the 30-day student refund window. Payouts can be requested at any time once your unpaid balance exceeds ₹1,000, and are transferred via UPI or NEFT/IMPS bank transfer within 2 business days.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold font-display text-slate-900">5. Intellectual Property & Content Quality</h2>
          <p>
            You retain all underlying intellectual property rights to your instructional videos, source code, and lesson plans. By publishing on Prajnadhara EDU, you grant the platform a worldwide, non-exclusive license to host, transcode, and stream your content to enrolled students.
          </p>
        </section>
      </div>
    </div>
  );
};
