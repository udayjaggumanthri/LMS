import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/common/Logo';
import { UserRole } from '../../types';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }
    const success = register(name, email, role);
    if (success) {
      if (role === 'instructor') navigate('/instructor/dashboard');
      else navigate('/student/my-learning');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded p-5 sm:p-8 text-left shadow-sm">
        <div className="text-center mb-6">
          <Logo size="md" className="justify-center" />
          <h1 className="mt-4 text-xl font-bold font-display text-slate-950">
            Create Your Account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Join over 184,000 learners and practitioners on Prajnadhara EDU
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-4 text-xs">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded font-medium">
              {error}
            </div>
          )}

          <Input
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Diya Sen"
          />

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Primary Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-2 px-3 rounded border text-xs font-medium transition-colors ${
                  role === 'student'
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-800 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                I want to Learn
              </button>
              <button
                type="button"
                onClick={() => setRole('instructor')}
                className={`py-2 px-3 rounded border text-xs font-medium transition-colors ${
                  role === 'instructor'
                    ? 'bg-emerald-50 text-emerald-950 border-emerald-800 font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                I want to Teach
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
            />
            <label htmlFor="terms" className="text-[11px] text-slate-600">
              I agree to the{' '}
              <Link to="/terms" className="text-emerald-800 underline">Terms of Service</Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-emerald-800 underline">Privacy Policy</Link>.
            </label>
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full">
            Create Account &rarr;
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/signin" className="text-emerald-800 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
