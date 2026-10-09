import React, { useState } from 'react';
import { MOCK_STUDENTS_LIST, COURSES } from '../../data/mockData';
import { Table, Column } from '../../components/ui/Table';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Search } from 'lucide-react';

interface StudentRecord {
  id: string;
  name: string;
  email: string;
  avatar: string;
  courseTitle: string;
  progressPercent: number;
  joinedDate: string;
  spentAmount: number;
}

export const InstructorStudentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const studentData: StudentRecord[] = MOCK_STUDENTS_LIST.map((s, idx) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    avatar: s.avatar,
    courseTitle: COURSES[idx % 3]?.title || 'Modern Full-Stack Architecture',
    progressPercent: ((idx * 17) % 100),
    joinedDate: s.joinedDate,
    spentAmount: s.spentAmount
  }));

  const filtered = studentData.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<StudentRecord>[] = [
    {
      key: 'name',
      header: 'Learner',
      render: (s) => (
        <div className="flex items-center gap-3">
          <img
            src={s.avatar}
            alt={s.name}
            className="w-8 h-8 rounded object-cover border border-slate-200"
          />
          <div>
            <div className="font-bold text-slate-900">{s.name}</div>
            <div className="text-[11px] text-slate-500">{s.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'courseTitle',
      header: 'Enrolled Course',
      render: (s) => <span className="font-medium text-slate-800 truncate max-w-xs block">{s.courseTitle}</span>
    },
    {
      key: 'progressPercent',
      header: 'Progress',
      sortable: true,
      render: (s) => (
        <div className="w-32">
          <ProgressBar value={s.progressPercent} size="sm" />
        </div>
      )
    },
    {
      key: 'joinedDate',
      header: 'Enrolled Date',
      render: (s) => <span className="text-slate-500">{s.joinedDate}</span>
    },
    {
      key: 'spentAmount',
      header: 'Paid (INR)',
      align: 'right',
      sortable: true,
      render: (s) => <span className="tabular-nums font-bold text-slate-900">₹{s.spentAmount.toLocaleString('en-IN')}</span>
    }
  ];

  return (
    <div className="text-left space-y-6">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
            Enrolled Learners Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track student retention, module completion percentages, and enrollment history
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search learners by name or email..."
            className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filtered}
        keyExtractor={(s) => s.id}
        pageSize={10}
      />
    </div>
  );
};
