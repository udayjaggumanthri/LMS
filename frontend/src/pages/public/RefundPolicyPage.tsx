import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { cmsService } from '../../api/cmsService';
import { Button } from '../../components/ui/Button';

export const RefundPolicyPage: React.FC = () => {
  const [refundCMS, setRefundCMS] = useState({
    badge: 'Statutory Student Protection',
    title: 'Refund & Cancellation Policy',
    subtitle: 'We offer a transparent 30-day money-back guarantee for eligible course purchases.',
    content: ''
  });

  useEffect(() => {
    cmsService.getPage('refund').then(data => {
      const hero = data?.sectionMap?.['hero'] || data?.sections?.find(s => s.sectionKey === 'hero');
      if (hero) {
        setRefundCMS(prev => ({
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
          { label: 'Policy', href: '/terms' },
          { label: 'Refund Policy' }
        ]}
        className="mb-6"
      />

      <div className="border-b border-slate-200 pb-6 mb-8">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
          {refundCMS.badge}
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-slate-950">
          {refundCMS.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {refundCMS.subtitle}
        </p>
      </div>

      {refundCMS.content && (
        <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm leading-relaxed whitespace-pre-line">
          {refundCMS.content}
        </div>
      )}

      <div className="space-y-8 text-sm text-slate-700 leading-relaxed max-w-3xl">
        {/* 1. 30-Day Guarantee */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>1. 30-Day Money-Back Guarantee</span>
          </h2>
          <p>
            At Prajnadhara EDU, we stand behind the pedagogical rigor and practical depth of our courses. If you are unsatisfied with a course you purchased, you may request a full refund within 30 days of the original purchase date, provided the course completion criteria have not been exceeded.
          </p>
        </section>

        {/* 2. Eligibility Criteria */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>2. Refund Eligibility Criteria</span>
          </h2>
          <p>To qualify for a refund, the following conditions must be met:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
            <li>The refund request is submitted within 30 calendar days from the date of payment.</li>
            <li>Less than 30% of total video lessons and downloadable course materials have been consumed.</li>
            <li>No course completion certificate has been generated or claimed for the enrolled course.</li>
            <li>The account has not exhibited fraudulent activity, multiple simultaneous refund abuses, or terms violations.</li>
          </ul>
        </section>

        {/* 3. Refund Processing */}
        <section className="space-y-2">
          <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>3. Processing Time &amp; Settlement</span>
          </h2>
          <p>
            Once approved by our academic audit team, refunds are processed within <strong>5 to 7 business days</strong>. The refunded amount will be credited back to your original source of payment (UPI VPA, Credit/Debit Card, Netbanking account).
          </p>
        </section>

        {/* 4. How to Request */}
        <section className="space-y-3 p-5 bg-slate-50 border border-slate-200 rounded-xl">
          <h2 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-700" />
            <span>4. How to Submit a Refund Request</span>
          </h2>
          <p className="text-xs text-slate-600">
            To initiate a cancellation or refund, email our student support team with your registered email ID and Order Invoice Number:
          </p>
          <div className="flex items-center gap-3">
            <a
              href="mailto:contact@prajnadharaedu.com?subject=Refund%20Request"
              className="text-xs font-bold text-emerald-800 hover:underline"
            >
              contact@prajnadharaedu.com
            </a>
            <span className="text-slate-300">|</span>
            <Link to="/contact">
              <Button variant="outline" size="sm">
                Open Support Ticket &rarr;
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
