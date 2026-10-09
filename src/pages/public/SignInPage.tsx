import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, GraduationCap, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/common/Logo';
import { UserRole } from '../../types';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginAsDemo } = useAuth();

  const [email, setEmail] = useState('student@prajnadhara.edu');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email address and password.');
      return;
    }
    const success = login(email, password);
    if (success) {
      navigate('/student/my-learning');
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    loginAsDemo(role);
    if (role === 'student') navigate('/student/my-learning');
    else if (role === 'instructor') navigate('/instructor/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded p-5 sm:p-8 text-left shadow-sm">
        <div className="text-center mb-6">
          <Logo size="md" className="justify-center" />
          <h1 className="mt-4 text-xl font-bold font-display text-slate-950">
            Sign In to Prajnadhara EDU
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Access your courses, certificates, or instructor dashboard
          </p>
        </div>

        {/* 1-Click Demo Accounts Strip */}
        <div className="mb-6 p-4 bg-emerald-50/50 border border-emerald-200 rounded">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 mb-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Instant 1-Click Demo Roles</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="p-2 bg-white border border-emerald-300 rounded text-center hover:bg-emerald-50 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-emerald-800 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-900 block">Student</span>
              <span className="text-[10px] text-slate-500 block">Learner view</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('instructor')}
              className="p-2 bg-white border border-emerald-300 rounded text-center hover:bg-emerald-50 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-800 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-900 block">Instructor</span>
              <span className="text-[10px] text-slate-500 block">Studio & Q&A</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin')}
              className="p-2 bg-white border border-emerald-300 rounded text-center hover:bg-emerald-50 transition-colors"
            >
              <Lock className="w-4 h-4 text-emerald-800 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-900 block">Admin</span>
              <span className="text-[10px] text-slate-500 block">Full rights</span>
            </button>
          </div>
        </div>

        {/* Traditional Email / Password Form */}
        <form onSubmit={handleSignIn} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded font-medium">
              {error}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@prajnadhara.edu"
          />

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-[11px] text-emerald-800 hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full">
            Sign In with Email &rarr;
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link to="/signup" className="text-emerald-800 font-semibold hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
