import React, { useState } from 'react';
import { CheckCircle2, XCircle, FileText, ExternalLink, Eye, Check, X, Search, ShieldCheck } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table, Column } from '../../components/ui/Table';
import { InstructorApplication } from '../../types';

export const AdminInstructorApplicationsPage: React.FC = () => {
  const { instructorApplications, approveInstructorApplication, rejectInstructorApplication } = useAdmin();
  const { showToast } = useNotifications();

  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectApp, setInspectApp] = useState<InstructorApplication | null>(null);
  const [rejectingApp, setRejectingApp] = useState<InstructorApplication | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState('');

  const pendingCount = instructorApplications.filter(a => a.status === 'pending').length;
  const approvedCount = instructorApplications.filter(a => a.status === 'approved').length;
  const rejectedCount = instructorApplications.filter(a => a.status === 'rejected').length;

  const filtered = instructorApplications.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        a.applicantName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.expertise.toLowerCase().includes(q) ||
        a.sampleTopic.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleApprove = (app: InstructorApplication) => {
    approveInstructorApplication(app.id);
    showToast('success', `Approved application for ${app.applicantName}. Instructor studio privileges unlocked.`);
    if (inspectApp?.id === app.id) setInspectApp(null);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingApp) return;
    rejectInstructorApplication(rejectingApp.id, rejectionFeedback.trim() || undefined);
    showToast('info', `Application for ${rejectingApp.applicantName} marked as rejected.`);
    setRejectingApp(null);
    setRejectionFeedback('');
    if (inspectApp?.id === rejectingApp.id) setInspectApp(null);
  };

  const columns: Column<InstructorApplication>[] = [
    {
      key: 'applicantName',
      header: 'Applicant',
      render: (a) => (
        <div>
          <div className="font-bold text-slate-900">{a.applicantName}</div>
          <div className="text-[11px] text-slate-500">{a.email}</div>
        </div>
      )
    },
    {
      key: 'expertise',
      header: 'Domain Expertise',
      render: (a) => (
        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-medium text-slate-800 text-[11px]">
          {a.expertise}
        </span>
      )
    },
    {
      key: 'sampleTopic',
      header: 'Proposed Masterclass',
      render: (a) => (
        <div className="max-w-xs">
          <div className="font-semibold text-slate-900 truncate">{a.sampleTopic}</div>
          <div className="text-[11px] text-slate-500 line-clamp-1">{a.experienceBio}</div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (a) => (
        <Badge
          variant={
            a.status === 'approved'
              ? 'success'
              : a.status === 'pending'
              ? 'warning'
              : 'danger'
          }
        >
          {a.status}
        </Badge>
      )
    },
    {
      key: 'submittedAt',
      header: 'Date',
      render: (a) => <span className="text-slate-500 text-[11px] tabular-nums">{a.submittedAt}</span>
    },
    {
      key: 'actions',
      header: 'Decision & Audit',
      align: 'right',
      render: (a) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setInspectApp(a)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Review
          </Button>

          {a.status === 'pending' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRejectingApp(a);
                  setRejectionFeedback('');
                }}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-800 hover:bg-emerald-900"
                onClick={() => handleApprove(a)}
              >
                Approve
              </Button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 capitalize px-2">Processed</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="text-left space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Instructor Onboarding Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant domain backgrounds, evaluate sample proposals, and grant verified publishing rights
          </p>
        </div>
      </div>

      {/* Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 border border-slate-200 rounded bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Review</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 tabular-nums">{pendingCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Awaiting editorial assessment</div>
        </div>
        <div className="p-4 border border-slate-200 rounded bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Approved Creators</div>
          <div className="text-2xl font-bold font-display text-emerald-950 mt-1 tabular-nums">{approvedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Granted course creation privileges</div>
        </div>
        <div className="p-4 border border-slate-200 rounded bg-white">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Applications</div>
          <div className="text-2xl font-bold font-display text-slate-900 mt-1 tabular-nums">{instructorApplications.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Lifetime applicant submissions</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded capitalize transition-colors ${
                filter === st ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st} {st === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
            </button>
          ))}
        </div>

        <div className="w-full sm:w-72 relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by applicant, email, topic..."
            className="w-full bg-white border border-slate-300 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(a) => a.id}
        pageSize={10}
      />

      {/* Application Dossier Review Modal */}
      {inspectApp && (
        <Modal
          isOpen={!!inspectApp}
          onClose={() => setInspectApp(null)}
          title={`Applicant Dossier: ${inspectApp.applicantName}`}
          size="lg"
        >
          <div className="space-y-5 text-xs text-slate-800">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-950">{inspectApp.applicantName}</h3>
                <p className="text-slate-500">{inspectApp.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    inspectApp.status === 'approved'
                      ? 'success'
                      : inspectApp.status === 'pending'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {inspectApp.status}
                </Badge>
                <span className="text-slate-400 text-[11px] tabular-nums">Submitted {inspectApp.submittedAt}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Domain Expertise
                </span>
                <span className="font-semibold text-slate-900">{inspectApp.expertise}</span>
              </div>
              <div className="p-3 border border-slate-200 rounded bg-white">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Portfolio / LinkedIn
                </span>
                {inspectApp.linkedinOrPortfolio ? (
                  <a
                    href={inspectApp.linkedinOrPortfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-800 hover:underline flex items-center gap-1 font-medium truncate"
                  >
                    <span>{inspectApp.linkedinOrPortfolio}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-slate-400">Not provided</span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Proposed Course Topic
              </span>
              <div className="p-3 bg-white border border-slate-200 rounded font-semibold text-slate-900">
                {inspectApp.sampleTopic}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Professional Experience & Background
              </span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded text-slate-700 leading-relaxed whitespace-pre-line">
                {inspectApp.experienceBio}
              </div>
            </div>

            {inspectApp.adminFeedback && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
                <strong>Reviewer Feedback:</strong> {inspectApp.adminFeedback}
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setInspectApp(null)}>
                Close
              </Button>
              {inspectApp.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setRejectingApp(inspectApp);
                      setRejectionFeedback('');
                    }}
                  >
                    Reject Application
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-emerald-800 hover:bg-emerald-900"
                    onClick={() => handleApprove(inspectApp)}
                  >
                    Approve & Grant Rights
                  </Button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Reject Application Modal */}
      {rejectingApp && (
        <Modal
          isOpen={!!rejectingApp}
          onClose={() => setRejectingApp(null)}
          title={`Reject Application: ${rejectingApp.applicantName}`}
          size="md"
        >
          <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Provide constructive guidance or rationale explaining why this application was not approved at this time:
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Feedback for Applicant (Optional)
              </label>
              <textarea
                rows={4}
                value={rejectionFeedback}
                onChange={(e) => setRejectionFeedback(e.target.value)}
                placeholder="e.g. Please provide additional industry verification or a detailed syllabus outline for your proposed topic..."
                className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRejectingApp(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm">
                Confirm Rejection
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
