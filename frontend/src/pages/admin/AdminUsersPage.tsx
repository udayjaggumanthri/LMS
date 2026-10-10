import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  UserPlus,
  Upload,
  Search,
  Shield,
  GraduationCap,
  Award,
  Trash2,
  Edit2,
  AlertTriangle,
  Users,
  CheckCircle2,
  ArrowUpDown
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Table, Column } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { UserRole } from '../../types';
import { adminService } from '../../api/adminService';

interface UnifiedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  enrolledCount?: number;
  joinedDate: string;
}

export const AdminUsersPage: React.FC = () => {
  const { showToast } = useNotifications();

  const [usersList, setUsersList] = useState<UnifiedUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'instructor' | 'admin'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  React.useEffect(() => {
    adminService.getUsers().then((res: any[]) => {
      if (res && Array.isArray(res)) {
        const mapped: UnifiedUser[] = res.map((u: any) => ({
          id: String(u.id),
          name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username,
          email: u.email,
          role: u.role || 'student',
          avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
          enrolledCount: u.enrolled_count || 0,
          joinedDate: u.joinedAt || (u.date_joined ? new Date(u.date_joined).toISOString().split('T')[0] : '2026-10-09')
        }));
        setUsersList(mapped);
      }
    }).catch(() => {});
  }, []);

  // Modals
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [bulkCsvModalOpen, setBulkCsvModalOpen] = useState(false);
  const [editRoleUser, setEditRoleUser] = useState<UnifiedUser | null>(null);
  const [newRoleForUser, setNewRoleForUser] = useState<UserRole>('student');
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<UnifiedUser | null>(null);

  // Invite Form State
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('student');

  // Bulk CSV Import State
  const defaultCsvSample = `name,email,role\nRohit Sen,rohit.sen@example.com,student\nSneha Kapoor,sneha.kapoor@example.com,instructor\nTanmay Rao,tanmay.rao@example.com,student`;
  const [csvText, setCsvText] = useState(defaultCsvSample);
  const [csvPreviewRows, setCsvPreviewRows] = useState<any[]>([]);

  // KPI Calculations
  const totalCount = usersList.length;
  const studentCount = usersList.filter(u => u.role === 'student').length;
  const instructorCount = usersList.filter(u => u.role === 'instructor').length;
  const adminCount = usersList.filter(u => u.role === 'admin').length;

  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      }
      return true;
    });
  }, [usersList, roleFilter, searchTerm]);

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      showToast('error', 'Name and Email are required.');
      return;
    }
    const newUser: UnifiedUser = {
      id: `user-${Date.now()}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      enrolledCount: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setUsersList(prev => [newUser, ...prev]);
    showToast('success', `Created account for ${inviteName.trim()} (${inviteRole})`);
    setInviteName('');
    setInviteEmail('');
    setInviteModalOpen(false);
  };

  const handleParseCsv = () => {
    const lines = csvText.trim().split('\n');
    const rows: any[] = [];
    lines.slice(1).forEach((line, idx) => {
      const [name, email, role] = line.split(',').map(s => s.trim());
      const isValid = name && email && email.includes('@') && ['student', 'instructor', 'admin'].includes(role);
      rows.push({
        id: `row-${idx}`,
        name: name || '',
        email: email || '',
        role: (role as UserRole) || 'student',
        valid: isValid,
        error: !isValid ? 'Invalid format or email' : null
      });
    });
    setCsvPreviewRows(rows);
  };

  const handleConfirmCsvImport = () => {
    const validUsers: UnifiedUser[] = csvPreviewRows
      .filter(r => r.valid)
      .map(r => ({
        id: `user-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: r.name,
        email: r.email,
        role: r.role,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        joinedDate: new Date().toISOString().split('T')[0]
      }));

    setUsersList(prev => [...validUsers, ...prev]);
    showToast('success', `Successfully imported ${validUsers.length} users into directory.`);
    setBulkCsvModalOpen(false);
    setCsvPreviewRows([]);
  };

  const handleSaveRoleChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoleUser) return;
    setUsersList(prev => prev.map(u => u.id === editRoleUser.id ? { ...u, role: newRoleForUser } : u));
    adminService.updateUser(editRoleUser.id, { role: newRoleForUser }).catch(() => {});
    showToast('success', `Updated ${editRoleUser.name}'s role to ${newRoleForUser}.`);
    setEditRoleUser(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmUser) return;
    setUsersList(prev => prev.filter(u => u.id !== deleteConfirmUser.id));
    adminService.deleteUser(deleteConfirmUser.id).catch(() => {});
    showToast('info', `Account for ${deleteConfirmUser.name} removed.`);
    setDeleteConfirmUser(null);
  };

  const columns: Column<UnifiedUser>[] = [
    {
      key: 'name',
      header: 'User Account',
      render: (u) => (
        <div className="flex items-center gap-3">
          <img
            src={u.avatar}
            alt={u.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="font-bold text-slate-900">{u.name}</div>
            <div className="text-[11px] text-slate-500">{u.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      header: 'Role',
      render: (u) => (
        <button
          onClick={() => {
            setEditRoleUser(u);
            setNewRoleForUser(u.role);
          }}
          className="hover:opacity-80 transition-opacity"
          title="Click to modify role"
        >
          <Badge
            variant={
              u.role === 'admin'
                ? 'danger'
                : u.role === 'instructor'
                ? 'warning'
                : 'neutral'
            }
          >
            {u.role}
          </Badge>
        </button>
      )
    },
    {
      key: 'enrolledCount',
      header: 'Activity Metric',
      align: 'right',
      render: (u) => (
        <span className="tabular-nums font-semibold text-slate-700">
          {u.role === 'instructor'
            ? `${(u.enrolledCount || 0).toLocaleString('en-IN')} students`
            : `${u.enrolledCount || 1} courses`}
        </span>
      )
    },
    {
      key: 'joinedDate',
      header: 'Joined Date',
      render: (u) => <span className="text-slate-500">{u.joinedDate}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => {
              setEditRoleUser(u);
              setNewRoleForUser(u.role);
            }}
            className="text-slate-400 hover:text-slate-900 p-1.5 rounded transition-colors"
            title="Edit Role"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteConfirmUser(u)}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
            title="Remove User"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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
            Platform Users Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage students, instructors, and system administrators across the marketplace
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => {
              setBulkCsvModalOpen(true);
              handleParseCsv();
            }}
          >
            Bulk CSV Import
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            onClick={() => setInviteModalOpen(true)}
          >
            Onboard User
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Accounts</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all roles</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Enrolled Students</span>
            <GraduationCap className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{studentCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Active learners</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Faculty Instructors</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-display text-amber-600">{instructorCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Approved publishers</div>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Administrators</span>
            <Shield className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900">{adminCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Full governance rights</div>
        </div>
      </div>

      {/* Role Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {(['all', 'student', 'instructor', 'admin'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded capitalize whitespace-nowrap transition-colors ${
                roleFilter === r
                  ? 'bg-emerald-800 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {r === 'all' ? `All Users (${usersList.length})` : `${r}s (${usersList.filter(u => u.role === r).length})`}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredUsers}
        keyExtractor={(u) => u.id}
        pageSize={12}
      />

      {/* Onboard User Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Onboard or Invite User"
        size="md"
      >
        <form onSubmit={handleInviteUser} className="space-y-4 text-xs">
          <Input
            label="Full Name"
            required
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            placeholder="e.g. Anand Murthy"
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="anand@example.com"
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Assigned Platform Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            >
              <option value="student">Student (Learner)</option>
              <option value="instructor">Instructor (Course Publisher)</option>
              <option value="admin">Administrator (Full Rights)</option>
            </select>
          </div>
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Account &rarr;
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk CSV Import Modal */}
      <Modal
        isOpen={bulkCsvModalOpen}
        onClose={() => setBulkCsvModalOpen(false)}
        title="Bulk CSV Import with Validation Preview"
        size="lg"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Raw CSV Input (name, email, role)
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              className="w-full font-mono bg-slate-50 border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex justify-between items-center">
            <Button variant="secondary" size="sm" onClick={handleParseCsv}>
              Validate & Preview Rows
            </Button>
            <span className="text-slate-500">
              {csvPreviewRows.length} rows parsed
            </span>
          </div>

          {/* Validation Preview Table */}
          {csvPreviewRows.length > 0 && (
            <div className="border border-slate-200 rounded overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Role</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {csvPreviewRows.map((r, i) => (
                    <tr key={i} className={r.valid ? 'bg-white' : 'bg-rose-50/50'}>
                      <td className="p-2 font-medium">{r.name}</td>
                      <td className="p-2 text-slate-600">{r.email}</td>
                      <td className="p-2 capitalize">{r.role}</td>
                      <td className="p-2">
                        {r.valid ? (
                          <span className="text-emerald-700 font-bold text-[10px]">Valid</span>
                        ) : (
                          <span className="text-rose-700 font-bold text-[10px]">{r.error}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setBulkCsvModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={csvPreviewRows.filter(r => r.valid).length === 0}
              onClick={handleConfirmCsvImport}
            >
              Import {csvPreviewRows.filter(r => r.valid).length} Valid Users &rarr;
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      {editRoleUser && (
        <Modal
          isOpen={!!editRoleUser}
          onClose={() => setEditRoleUser(null)}
          title={`Update Role for ${editRoleUser.name}`}
          size="sm"
        >
          <form onSubmit={handleSaveRoleChange} className="space-y-4 text-xs">
            <p className="text-slate-600">
              Current role: <strong className="capitalize">{editRoleUser.role}</strong> ({editRoleUser.email})
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                New Assigned Role
              </label>
              <select
                value={newRoleForUser}
                onChange={(e) => setNewRoleForUser(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                <option value="student">Student (Learner)</option>
                <option value="instructor">Instructor (Course Publisher)</option>
                <option value="admin">Administrator (Full Rights)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setEditRoleUser(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Role
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteConfirmUser && (
        <Modal
          isOpen={!!deleteConfirmUser}
          onClose={() => setDeleteConfirmUser(null)}
          title="Remove User Account"
          size="sm"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-amber-900 leading-relaxed">
                Are you sure you want to remove <strong>{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})? This action will revoke their login access.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setDeleteConfirmUser(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="bg-rose-700 hover:bg-rose-800 text-white"
                onClick={handleConfirmDelete}
              >
                Confirm Remove
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
