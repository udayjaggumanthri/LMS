import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
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
import { adminService } from '../../api/adminService';
const TEACH_IMAGE = '/src/assets/images/teach_instructor_studio_1791558529974.jpg';

export const TeachLandingPage: React.FC = () => {
  const { submitInstructorApplication } = useAdmin();
  const { currentUser } = useAuth();

  const [applicationModalOpen, setApplicationModalOpen] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(false);

  useEffect(() => {
    adminService.getPlatformSettings()
      .then((settings) => {
        if (settings && typeof settings.allowInstructorRegistration === 'boolean') {
          setAllowRegistration(settings.allowInstructorRegistration);
        } else if (settings && typeof settings.allow_instructor_registration === 'boolean') {
          setAllowRegistration(settings.allow_instructor_registration);
        }
      })
      .catch(() => {
        // default to false for strict faculty provisioning
        setAllowRegistration(false);
      });
  }, []);

  // Application form fields
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');
  const [expertise, setExpertise] = useState('');
  const [experienceBio, setExperienceBio] = useState('');
  const [sampleTopic, setSampleTopic] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');

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
                Deliver rigorous, semester-aligned curricula on Prajnadhara EDU. Create practical courses, organize modular lessons, attach project source code, and directly publish to thousands of enrolled students.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {allowRegistration ? (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto justify-center"
                    onClick={() => setApplicationModalOpen(true)}
                  >
                    Start Faculty Application &rarr;
                  </Button>
                ) : (
                  <div className="p-3 bg-slate-100 border border-slate-200 rounded text-xs text-slate-700">
                    <span className="font-semibold text-slate-900">Direct Faculty Provisioning:</span> Instructor accounts are managed directly by university administration. Contact <a href="mailto:support@prajnadhara.edu" className="text-emerald-700 underline font-medium">support@prajnadhara.edu</a> for access.
                  </div>
                )}
                <Link to="/signin" className="text-xs text-slate-600 hover:text-slate-900 font-semibold underline-offset-4 hover:underline text-center sm:text-left py-2">
                  Faculty Login &rarr;
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

      {/* 2. Faculty Teaching Capabilities & Infrastructure */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
              Curriculum & Teaching Infrastructure
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              Everything faculty need to teach and publish
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              A comprehensive academic workbench engineered for streamlined lecture delivery, organized semester taxonomies, and high-impact learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Structured Semester Syllabi</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Map each subject directly into Semester 1 through 8 or departmental electives. Organize lectures into modular units with clear academic objectives.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Media & Asset Publishing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Upload video lectures, PDF notes, laboratory guides, and starter code repositories using the integrated media storage platform.
              </p>
            </div>

            <div className="p-6 bg-white border border-slate-200 rounded-lg shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Instant Review & Publishing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Author courses in draft mode and publish immediately or submit for department editorial verification with a single click.
              </p>
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
