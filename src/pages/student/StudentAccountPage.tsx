import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { CheckCircle2, User as UserIcon } from 'lucide-react';

export const StudentAccountPage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [title, setTitle] = useState(currentUser?.title || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name, email, title, bio });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl text-left space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-slate-950">
          Account & Profile Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your student credential information, profile metadata, and notification preferences
        </p>
      </div>

      <div className="p-6 border border-slate-200 rounded bg-white space-y-6 text-xs">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-16 h-16 rounded object-cover border border-slate-200"
          />
          <div>
            <h3 className="font-bold text-sm text-slate-900">{currentUser?.name}</h3>
            <p className="text-slate-500">{currentUser?.email}</p>
            <span className="inline-block px-2 py-0.5 mt-1 rounded bg-slate-100 text-[10px] font-semibold text-slate-700 capitalize">
              Role: {currentUser?.role}
            </span>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Profile settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Professional Headline / Job Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Associate Backend Engineer"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Personal Bio
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A few sentences about your learning goals and engineering interests..."
              className="w-full bg-white border border-slate-300 rounded p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
