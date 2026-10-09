import React, { useState } from 'react';
import { CheckCircle2, XCircle, FileText, ExternalLink } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, Column } from '../../components/ui/Table';
import { InstructorApplication } from '../../types';

export const AdminInstructorApplicationsPage: React.FC = () => {
  const { instructorApplications, approveInstructorApplication, rejectInstructorApplication } = useAdmin();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filtered = instructorApplications.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false;
    return true;
  });

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
      render: (a) => <span className="font-medium text-slate-800">{a.expertise}</span>
    },
    {
      key: 'sampleTopic',
      header: 'Proposed Course Topic',
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
      render: (a) => <span className="text-slate-500 text-[11px]">{a.submittedAt}</span>
    },
    {
      key: 'actions',
      header: 'Decision',
      align: 'right',
      render: (a) => (
        <div className="flex items-center justify-end gap-2">
          {a.status === 'pending' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const feedback = prompt('Feedback for rejection:') || undefined;
                  rejectInstructorApplication(a.id, feedback);
                }}
              >
                Reject
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => approveInstructorApplication(a.id)}
              >
                Approve
              </Button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400 capitalize">Processed ({a.status})</span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Instructor Onboarding Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant domain backgrounds, sample course proposals, and grant publishing rights
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded text-xs">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded capitalize transition-colors ${
                filter === st ? 'bg-emerald-800 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(a) => a.id}
        pageSize={10}
      />
    </div>
  );
};
