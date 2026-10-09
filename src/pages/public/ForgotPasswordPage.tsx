import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Logo } from '../../components/common/Logo';
import { CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded p-5 sm:p-8 text-left shadow-sm">
        <div className="text-center mb-6">
          <Logo size="md" className="justify-center" />
          <h1 className="mt-4 text-xl font-bold font-display text-slate-950">
            Reset Your Password
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Enter your account email to receive reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded text-center space-y-3 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Reset Link Dispatched</h3>
            <p className="text-slate-600">
              We sent a verification link to <strong>{email}</strong>. Please check your inbox and spam folder.
            </p>
            <div className="pt-2">
              <Link to="/signin">
                <Button variant="primary" size="sm">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
            />

            <Button type="submit" variant="primary" size="md" className="w-full">
              Send Password Reset Link &rarr;
            </Button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Remember your password?{' '}
          <Link to="/signin" className="text-emerald-800 font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
