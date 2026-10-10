import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/common/Logo';
import { UserRole } from '../../types';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { adminService } from '../../api/adminService';

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [allowInstructorReg, setAllowInstructorReg] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminService.getPlatformSettings()
      .then((settings) => {
        if (settings && typeof settings.allowInstructorRegistration === 'boolean') {
          setAllowInstructorReg(settings.allowInstructorRegistration);
        } else if (settings && typeof settings.allow_instructor_registration === 'boolean') {
          setAllowInstructorReg(settings.allow_instructor_registration);
        }
      })
      .catch(() => {
        setAllowInstructorReg(false);
      });
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to proceed.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const activeRole = allowInstructorReg ? role : 'student';
      const success = await register(name.trim(), email.trim(), activeRole, password);
      if (success) {
        if (redirectUrl) {
          navigate(redirectUrl);
          return;
        }
        if (activeRole === 'instructor') navigate('/instructor/dashboard');
        else navigate('/student/my-learning');
      } else {
        setError('Registration could not be completed. The email may already be in use.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.email?.[0] || err?.response?.data?.username?.[0] || 'Registration failed. Please verify your details.';
      setError(msg);
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
            Create Your Account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Join practical engineering tracks and masterclasses on Prajnadhara EDU
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4 text-xs">
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
            placeholder="Minimum 8 characters"
          />

          {allowInstructorReg ? (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Account Track
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
                  Student / Learner
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
                  Instructor / Author
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Account Type:</span> Student &amp; Professional Learner. Faculty accounts are provisioned directly by institution administration.
            </div>
          )}

          <label className="flex items-start gap-2 pt-2 text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
            />
            <span className="text-[11px] leading-tight">
              I agree to the{' '}
              <Link to="/terms" className="underline hover:text-slate-900">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="underline hover:text-slate-900">
                Privacy Policy
              </Link>
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account &rarr;
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Already have an account?</span>
          <Link
            to={redirectUrl ? `/signin?redirect=${encodeURIComponent(redirectUrl)}` : '/signin'}
            className="text-emerald-800 font-semibold hover:underline"
          >
            Sign In &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};
