import React, { useState } from 'react';
import {
  Award,
  Download,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Printer,
  ExternalLink,
  Copy,
  Linkedin,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Logo } from '../../components/common/Logo';
import { Certificate } from '../../types';

export const CertificatesPage: React.FC = () => {
  const { certificates } = useLearning();
  const { showToast } = useNotifications();

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [sharingCert, setSharingCert] = useState<Certificate | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    showToast('success', 'Cryptographic verification link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleLinkedInShare = (cert: Certificate) => {
    const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      cert.courseTitle
    )}&organizationName=Prajnadhara+EDU&issueYear=2025&certId=${encodeURIComponent(
      cert.certificateNumber
    )}&certUrl=${encodeURIComponent(cert.verifyUrl)}`;
    window.open(linkedInUrl, '_blank', 'noopener,noreferrer');
    showToast('info', 'Opening LinkedIn Certification form in new tab.');
  };

  const totalHours = certificates.reduce((acc, c) => acc + (c.totalHours || 0), 0);

  return (
    <div className="text-left space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Official Certificates of Completion
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically verifiable certificates for masterclasses you have completed with distinction
        </p>
      </div>

      {/* Distinction & Accreditation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-display text-slate-900">{certificates.length}</div>
            <div className="text-xs text-slate-500">Earned Credentials</div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-display text-slate-900">{totalHours}h</div>
            <div className="text-xs text-slate-500">Accredited Hours</div>
          </div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold font-display text-emerald-800">100% Verified</div>
            <div className="text-xs text-slate-500">Tamper-Proof Ledger</div>
          </div>
        </div>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-6 border border-slate-200 rounded-lg bg-white flex flex-col justify-between space-y-4 hover:border-emerald-300 hover:shadow-xs transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-[11px] font-bold text-slate-500">{cert.certificateNumber}</span>
                  <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    Verified
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 font-display leading-snug">{cert.courseTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">Issued to {cert.userName} on {cert.issueDate}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                  <span>Graduation Grade: <strong className="text-slate-900 font-bold">{cert.grade}</strong></span>
                  <span aria-hidden="true">&bull;</span>
                  <span>Accreditation: <strong className="text-slate-900">{cert.totalHours} Practical Hours</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Award className="w-3.5 h-3.5" />}
                  onClick={() => setSelectedCert(cert)}
                >
                  View Credential
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Share2 className="w-3 h-3 text-slate-600" />}
                    onClick={() => setSharingCert(cert)}
                  >
                    Share
                  </Button>
                  <button
                    onClick={() => handleCopyLink(cert.verifyUrl)}
                    title="Copy verification link"
                    className="p-2 border border-slate-200 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center border border-dashed border-slate-200 rounded-lg bg-white max-w-md mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 font-display">No Certificates Earned Yet</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Complete 100% of lectures and achieve an 80%+ passing score on technical assessments to earn your official verifiable credential.
          </p>
        </div>
      )}

      {/* Official Certificate Presentation Modal */}
      {selectedCert && (
        <Modal
          isOpen={!!selectedCert}
          onClose={() => setSelectedCert(null)}
          title="Certificate of Completion"
          size="lg"
        >
          <div className="border-4 border-slate-900 p-8 bg-white text-center space-y-6 relative text-slate-900 print:border-none">
            {/* Header Lockup */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <Logo size="md" />
              <div className="text-right text-[10px] text-slate-500 font-mono">
                <div>SERIAL: {selectedCert.certificateNumber}</div>
                <div>SECURE HASH: 9a7b...4f8c</div>
              </div>
            </div>

            {/* Certificate Proclamation */}
            <div className="space-y-2 py-4">
              <div className="text-xs uppercase tracking-widest font-bold text-emerald-900 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CERTIFICATE OF COMPLETION & EXCELLENCE</span>
              </div>
              <p className="text-xs text-slate-500">This officially certifies that</p>
              <div className="text-2xl sm:text-3xl font-bold font-display text-slate-950 underline decoration-slate-300 decoration-1 underline-offset-8">
                {selectedCert.userName}
              </div>
              <p className="text-xs text-slate-600 max-w-lg mx-auto pt-2">
                has successfully fulfilled all rigorous curriculum requirements and passed the evaluated technical examinations for
              </p>
              <div className="text-lg font-bold font-display text-slate-900 pt-1">
                {selectedCert.courseTitle}
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Completed with {selectedCert.grade} &bull; {selectedCert.totalHours} Accredited Practical Hours
              </p>
            </div>

            {/* Signature & Seal Block */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
              <div className="text-left">
                <div className="font-serif italic text-base text-slate-800">Neha Deshmukh</div>
                <div className="border-t border-slate-400 w-36 mt-1 pt-1 font-bold text-[11px] text-slate-900">
                  Lead Instructor
                </div>
                <div className="text-[10px] text-slate-500">PrajnadharaEdu Faculty</div>
              </div>
              <div className="text-right">
                <div className="font-serif italic text-base text-slate-800">Kavita Ramanathan</div>
                <div className="border-t border-slate-400 w-36 ml-auto mt-1 pt-1 font-bold text-[11px] text-slate-900">
                  Academic Administrator
                </div>
                <div className="text-[10px] text-slate-500">Issued on {selectedCert.issueDate}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-mono text-[11px]">
              Verifiable at: {selectedCert.verifyUrl}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
                onClick={() => {
                  setSharingCert(selectedCert);
                }}
              >
                Share Credential
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
                onClick={handlePrint}
              >
                Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Share Credential Modal */}
      {sharingCert && (
        <Modal
          isOpen={!!sharingCert}
          onClose={() => setSharingCert(null)}
          title="Share Verified Credential"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Share your achievement for <strong>{sharingCert.courseTitle}</strong> with peers, hiring managers, and professional networks.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Public Verification Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={sharingCert.verifyUrl}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs font-mono text-slate-800 select-all"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(sharingCert.verifyUrl)}
                  leftIcon={copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                >
                  {copiedLink ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1 bg-[#0A66C2] hover:bg-[#084e96] text-white"
                onClick={() => handleLinkedInShare(sharingCert)}
                leftIcon={<Linkedin className="w-3.5 h-3.5" />}
              >
                Add to LinkedIn Profile
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `I just graduated from ${sharingCert.courseTitle} on @PrajnadharaEDU! Check out my official certificate: ${sharingCert.verifyUrl}`
                    )}`,
                    '_blank'
                  );
                }}
              >
                Post on X (Twitter)
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
