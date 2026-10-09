import React, { useState } from 'react';
import { Award, Download, Share2, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';
import { useLearning } from '../../context/LearningContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Logo } from '../../components/common/Logo';
import { Certificate } from '../../types';

export const CertificatesPage: React.FC = () => {
  const { certificates } = useLearning();
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Official Certificates of Completion
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Cryptographically verifiable certificates for masterclasses you have completed with distinction
        </p>
      </div>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="p-6 border border-slate-200 rounded bg-white flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-mono text-[11px] font-bold text-slate-500">{cert.certificateNumber}</span>
                  <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Verified
                  </span>
                </div>
                <h3 className="font-bold text-base text-slate-900 font-display">{cert.courseTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">Issued to {cert.userName} on {cert.issueDate}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                  <span>Grade: <strong className="text-slate-900">{cert.grade}</strong></span>
                  <span aria-hidden="true">·</span>
                  <span>Hours: <strong className="text-slate-900">{cert.totalHours}h</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Award className="w-3.5 h-3.5" />}
                  onClick={() => setSelectedCert(cert)}
                >
                  View Official Certificate
                </Button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(cert.verifyUrl);
                    alert('Verification link copied to clipboard!');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 font-medium"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-slate-200 rounded bg-white max-w-md mx-auto">
          <Award className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">No Certificates Earned Yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Complete 100% of lectures and achieve an 80%+ passing score on technical assessments to earn your official certificate.
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
              <div className="text-xs uppercase tracking-widest font-bold text-emerald-900">
                CERTIFICATE OF COMPLETION & EXCELLENCE
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
                Completed with {selectedCert.grade} · {selectedCert.totalHours} Accredited Practical Hours
              </p>
            </div>

            {/* Signature & Seal Block */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-200 text-xs">
              <div className="text-left">
                <div className="font-serif italic text-base text-slate-800">Neha Deshmukh</div>
                <div className="border-t border-slate-400 w-36 mt-1 pt-1 font-bold text-[11px] text-slate-900">
                  Lead Instructor
                </div>
                <div className="text-[10px] text-slate-500">Prajnadhara EDU Faculty</div>
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

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Verifiable at: {selectedCert.verifyUrl}
            </span>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              onClick={handlePrint}
            >
              Print / Save PDF
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
