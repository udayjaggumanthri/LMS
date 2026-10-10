import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/ui/Breadcrumbs';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Course Purchase Support');
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      setSentSuccess(true);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-left text-slate-900">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Contact Us' }
        ]}
        className="mb-6"
      />

      <div className="pb-8 border-b border-slate-200">
        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
          Support & Communications
        </div>
        <h1 className="text-3xl font-bold font-display tracking-tight text-slate-950">
          Contact Prajnadhara EDU
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Have an inquiry regarding courses, instructor onboarding, or a 30-day refund? Our team responds within 24 hours.
        </p>
      </div>

      <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Contact Form */}
        <div className="md:col-span-7">
          {sentSuccess ? (
            <div className="p-8 border border-slate-200 rounded bg-slate-50 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
              <h3 className="font-bold text-base text-slate-900">Message Dispatched Successfully</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Thank you, <strong>{name}</strong>. A support ticket has been created and our team will respond to <strong>{email}</strong> shortly.
              </p>
              <Button variant="outline" size="sm" onClick={() => setSentSuccess(false)}>
                Send Another Inquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vikram Sharma"
                />
                <Input
                  label="Your Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Inquiry Topic
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                >
                  <option value="Course Purchase Support">Course Purchase & Payment Support</option>
                  <option value="Refund Request">30-Day Money-Back Guarantee Request</option>
                  <option value="Instructor Application">Instructor Application Inquiry</option>
                  <option value="Certificate Verification">Certificate Verification Assistance</option>
                  <option value="Enterprise Team Inquiries">Enterprise Team Licensing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Message Details
                </label>
                <textarea
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please describe your question or issue in detail..."
                  className="w-full bg-white border border-slate-300 rounded p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <Button type="submit" variant="primary" size="md">
                Send Message &rarr;
              </Button>
            </form>
          )}
        </div>

        {/* Operating Details */}
        <div className="md:col-span-5 space-y-6 text-xs text-slate-700">
          <div className="p-5 border border-slate-200 rounded bg-slate-50 space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Email Inquiries</strong>
                <a href="mailto:contact@prajnadharaedu.com" className="text-emerald-800 hover:underline block">
                  contact@prajnadharaedu.com
                </a>
                <a href="mailto:support@prajnadharaedu.com" className="text-slate-600 hover:underline block text-[11px] mt-0.5">
                  support@prajnadharaedu.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Operating Hours</strong>
                <span>Monday – Friday: 09:00 – 19:00 IST</span>
                <span className="block text-slate-500 text-[11px]">Weekend ticket response: &lt; 24h</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-slate-900">Office Location</strong>
                <span className="font-semibold block text-slate-800">Prajnadhara Infotech Pvt Ltd</span>
                <span className="block text-slate-600">1st Floor, 7-28-6, Tanvi Castle</span>
                <span className="block text-slate-600">Tyaga Raja Nagar, Rajahmundry</span>
                <span className="block text-slate-600">East Godavari, Andhra Pradesh, 533101</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
