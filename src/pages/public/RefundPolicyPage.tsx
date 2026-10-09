import React from 'react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 text-left text-slate-900">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Legal & Policies', href: '/terms' },
          { label: '30-Day Refund Policy' }
        ]}
        className="mb-6"
      />

      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
          Consumer Protection Contract
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-slate-950">
          30-Day Money-Back Guarantee Policy
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Last Updated: October 4, 2026 · Effective across all purchases globally
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Table of Contents */}
        <aside className="md:col-span-4 sticky top-20 text-xs space-y-2 p-4 bg-slate-50 border border-slate-200 rounded">
          <div className="font-bold uppercase tracking-wider text-slate-900 text-[11px] mb-2">
            Table of Contents
          </div>
          <a href="#overview" className="block text-slate-600 hover:text-emerald-800">1. Overview & Guarantee</a>
          <a href="#eligibility" className="block text-slate-600 hover:text-emerald-800">2. Eligibility Criteria</a>
          <a href="#exceptions" className="block text-slate-600 hover:text-emerald-800">3. Non-Refundable Scenarios</a>
          <a href="#how-to-request" className="block text-slate-600 hover:text-emerald-800">4. How to Request a Refund</a>
          <a href="#timelines" className="block text-slate-600 hover:text-emerald-800">5. Processing & Bank Timelines</a>
        </aside>

        {/* Policy Body */}
        <div className="md:col-span-8 space-y-8 text-xs text-slate-700 leading-relaxed">
          <section id="overview" className="space-y-3">
            <h2 className="text-base font-bold font-display text-slate-900">1. Overview & Guarantee</h2>
            <p>
              At Prajnadhara EDU, we believe student satisfaction is fundamental to our marketplace integrity. We want you to be completely satisfied with every course you purchase. If you are dissatisfied with a course for any valid reason, you may request a refund within thirty (30) calendar days of the initial purchase date.
            </p>
          </section>

          <section id="eligibility" className="space-y-3">
            <h2 className="text-base font-bold font-display text-slate-900">2. Eligibility Criteria</h2>
            <p>
              A course is eligible for a full refund if the following reasonable conditions are met:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>The request is initiated within 30 days from the date of the completed transaction.</li>
              <li>Less than 50% of the course lectures have been consumed or completed.</li>
              <li>The official course completion certificate has not yet been generated or downloaded.</li>
            </ul>
          </section>

          <section id="exceptions" className="space-y-3">
            <h2 className="text-base font-bold font-display text-slate-900">3. Non-Refundable Scenarios</h2>
            <p>
              To protect our instructors from bad-faith exploitation of downloadable codebases and proprietary materials, refunds may be denied under the following limited conditions:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>A student has consumed more than 50% of the video material prior to requesting the refund.</li>
              <li>Multiple refund requests have been submitted across multiple courses within a 30-day window indicating system abuse.</li>
              <li>The user account has been flagged for violating marketplace community standards.</li>
            </ul>
          </section>

          <section id="how-to-request" className="space-y-3">
            <h2 className="text-base font-bold font-display text-slate-900">4. How to Request a Refund</h2>
            <p>
              Requesting a refund takes less than sixty seconds:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2">
              <li>Log in to your account and navigate to <strong>Purchase History</strong> under the student menu.</li>
              <li>Locate the specific order receipt and click <strong>Request Refund</strong>.</li>
              <li>Select your primary reason (e.g., technical difficulty, mismatched expectations) and submit.</li>
            </ol>
            <p>
              Our automated system will inspect the consumption threshold and immediately process the refund request.
            </p>
          </section>

          <section id="timelines" className="space-y-3">
            <h2 className="text-base font-bold font-display text-slate-900">5. Processing & Bank Timelines</h2>
            <p>
              Once approved, refunds are credited back to your original payment method:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>UPI (Google Pay, PhonePe, Paytm):</strong> 2 to 24 hours.</li>
              <li><strong>Credit/Debit Cards:</strong> 3 to 5 business days depending on your issuing bank.</li>
              <li><strong>Net Banking:</strong> 2 to 4 business days.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
