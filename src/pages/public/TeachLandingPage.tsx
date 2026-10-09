import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Award,
  Video,
  FileCheck,
  ShieldCheck,
  Users,
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAdmin } from '../../context/AdminContext';
import { useAuth } from '../../context/AuthContext';
import { TEACH_IMAGE } from '../../data/mockData';

export const TeachLandingPage: React.FC = () => {
  const { submitInstructorApplication } = useAdmin();
  const { currentUser } = useAuth();

  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Earnings calculator state
  const [estimatedStudents, setEstimatedStudents] = useState<number>(500);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(1299);

  // Application form fields
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');
  const [expertise, setExpertise] = useState('');
  const [experienceBio, setExperienceBio] = useState('');
  const [sampleTopic, setSampleTopic] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');

  // Calculations: 85% revenue share
  const grossEarnings = estimatedStudents * estimatedPrice;
  const netEarnings = Math.round(grossEarnings * 0.85);

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    submitInstructorApplication({
      userId: currentUser?.id || `user-applicant-${Date.now()}`,
      applicantName,
      email: applicantEmail,
      expertise,
      experienceBio,
      sampleTopic,
      linkedinOrPortfolio: portfolioLink
    });
    setSubmittedSuccess(true);
  };

  return (
    <div className="w-full text-slate-900 text-left">
      {/* 1. Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">
                Prajnadhara Instructor Program
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display tracking-tight text-slate-950 leading-tight">
                Teach the tradecraft you practice every day.
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                Become a published instructor on Prajnadhara EDU. Create practical, project-based courses, set your own pricing in Indian Rupees, and keep 85% of every enrollment.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto justify-center"
                  onClick={() => setApplicationModalOpen(true)}
                >
                  Start Instructor Application
                </Button>
                <Link to="/instructor-terms" className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline-offset-4 hover:underline text-center sm:text-left py-2">
                  Review 85/15 Terms
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="border border-slate-200 rounded overflow-hidden bg-slate-50">
                <img
                  src={TEACH_IMAGE}
                  alt="Instructor teaching with dual monitor setup"
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Earnings Calculator */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Transparent Economics
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Calculate your estimated earnings
            </h2>
            <p className="mt-2 text-xs text-slate-600">
              Instructors keep 85% of net course revenue. The platform retains 15% to cover video hosting, payment gateway processing, customer support, and certificate verification.
            </p>
          </div>

          <div className="p-8 bg-white border border-slate-200 rounded grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 mb-2">
                  <span>Estimated Enrolled Learners</span>
                  <span className="tabular-nums text-emerald-900 text-sm">{estimatedStudents.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={estimatedStudents}
                  onChange={(e) => setEstimatedStudents(Number(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>50</span>
                  <span>5,000 learners</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 mb-2">
                  <span>Course Price (in INR)</span>
                  <span className="tabular-nums text-emerald-900 text-sm">₹{estimatedPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="499"
                  max="4999"
                  step="100"
                  value={estimatedPrice}
                  onChange={(e) => setEstimatedPrice(Number(e.target.value))}
                  className="w-full accent-emerald-800 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>₹499</span>
                  <span>₹4,999</span>
                </div>
              </div>
            </div>

            {/* Output Display */}
            <div className="p-6 bg-slate-900 text-white rounded text-center">
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold mb-1">
                Your Estimated Net Payout (85%)
              </div>
              <div className="text-3xl sm:text-4xl font-bold font-display text-white tabular-nums my-2">
                ₹{netEarnings.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400">
                Gross GMV: ₹{grossEarnings.toLocaleString('en-IN')} · Platform fee (15%): ₹{Math.round(grossEarnings * 0.15).toLocaleString('en-IN')}
              </div>
              <div className="mt-6">
                <Button
                  variant="primary"
                  size="md"
                  className="bg-emerald-600 hover:bg-emerald-700 border-emerald-600 w-full"
                  onClick={() => setApplicationModalOpen(true)}
                >
                  Apply to Teach &rarr;
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Three-Step Process */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Publishing Roadmap
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              From field experience to published masterclass
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 border border-slate-200 rounded bg-white">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded w-fit mb-4">
                <FileCheck className="w-5 h-5 text-emerald-800" />
              </div>
              <h3 className="font-bold text-base text-slate-900">1. Plan Your Practical Curriculum</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Outline 3 to 8 structured sections focusing on a real production project. Define tangible learner takeaways and prerequisites.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded bg-white">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded w-fit mb-4">
                <Video className="w-5 h-5 text-emerald-800" />
              </div>
              <h3 className="font-bold text-base text-slate-900">2. Record Screencasts & Exercises</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Record concise 10–25 minute lectures with clear audio. Add downloadable starter code repositories, architectural diagrams, and assessment quizzes.
              </p>
            </div>

            <div className="p-6 border border-slate-200 rounded bg-white">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded w-fit mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-800" />
              </div>
              <h3 className="font-bold text-base text-slate-900">3. Submit for Review & Launch</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Our review team audits the course within 48 hours. Once approved, your course goes live to over 184,000 learners on the marketplace.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Application Modal */}
      <Modal
        isOpen={applicationModalOpen}
        onClose={() => {
          setApplicationModalOpen(false);
          setSubmittedSuccess(false);
        }}
        title="Instructor Onboarding Application"
        description="Share your domain expertise and curriculum proposal with our editorial review board."
        size="md"
      >
        {submittedSuccess ? (
          <div className="p-6 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto" />
            <h4 className="text-base font-bold text-slate-900">Application Submitted Successfully!</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Thank you, <strong>{applicantName}</strong>. Our catalog administration team will review your topic proposal and respond to <strong>{applicantEmail}</strong> within 1-2 business days.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setApplicationModalOpen(false);
                setSubmittedSuccess(false);
              }}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
            <Input
              label="Full Name"
              required
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="e.g. Dr. Ananya Sharma"
            />
            <Input
              label="Email Address"
              type="email"
              required
              value={applicantEmail}
              onChange={(e) => setApplicantEmail(e.target.value)}
              placeholder="you@domain.com"
            />
            <Input
              label="Primary Area of Expertise"
              required
              value={expertise}
              onChange={(e) => setExpertise(e.target.value)}
              placeholder="e.g. Distributed Systems & Go Backend Architecture"
            />
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Professional Bio & Experience
              </label>
              <textarea
                required
                rows={3}
                value={experienceBio}
                onChange={(e) => setExperienceBio(e.target.value)}
                placeholder="Where have you worked? What systems or teams have you led?"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Proposed Course Topic & Target Audience
              </label>
              <textarea
                required
                rows={3}
                value={sampleTopic}
                onChange={(e) => setSampleTopic(e.target.value)}
                placeholder="What concrete skill will your students learn? What project will they build?"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
            <Input
              label="LinkedIn or GitHub Profile"
              value={portfolioLink}
              onChange={(e) => setPortfolioLink(e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setApplicationModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Submit Application
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
