import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/common/Logo';

export const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { login } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      setError('Please provide your username or email address and password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const success = await login(usernameOrEmail.trim(), password);
      if (success) {
        if (redirectUrl) {
          navigate(redirectUrl);
          return;
        }
        // Hydrated from real backend profile
        const saved = localStorage.getItem('prajnadhara_auth_user');
        const role = saved ? JSON.parse(saved).role : 'student';
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'instructor') navigate('/instructor/dashboard');
        else navigate('/student/my-learning');
      } else {
        setError('Invalid credentials. Please verify your email/username and password.');
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message || 'Authentication failed. Please verify your credentials.';
      setError(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded p-6 sm:p-8 text-left shadow-sm">
        <div className="text-center mb-6">
          <Logo size="md" className="justify-center" />
          <h1 className="mt-4 text-xl font-bold font-display text-slate-950">
            Sign In to PrajnadharaEdu
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Sign in with your verified account credentials to access your workspace
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                placeholder="name@example.com or username"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link to="/forgot-password" className="text-[11px] text-emerald-800 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-white text-slate-900 border border-slate-300 rounded pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>New to PrajnadharaEdu?</span>
          <Link
            to={redirectUrl ? `/signup?redirect=${encodeURIComponent(redirectUrl)}` : '/signup'}
            className="text-emerald-800 font-semibold hover:underline"
          >
            Create an Account &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
