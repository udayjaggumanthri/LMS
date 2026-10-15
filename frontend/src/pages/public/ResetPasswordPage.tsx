import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { Logo } from '../../components/common/Logo';
import { CheckCircle2 } from 'lucide-react';
import { authService } from '../../api/authService';

export const ResetPasswordPage: React.FC = () => {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await authService.resetPassword({
        uid: params.get('uid') || '',
        token: params.get('token') || '',
        password,
      });
      setDone(true);
    } catch (err: any) {
      const data = err?.response?.data;
      setError(data?.error || data?.password?.[0] || 'This reset link is not valid. Request a new one.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 sm:py-12 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded p-5 sm:p-8 text-left shadow-sm">
        <div className="text-center mb-6">
          <Logo size="md" className="justify-center" />
          <h1 className="mt-4 text-xl font-bold font-display text-slate-950">Choose a new password</h1>
        </div>

        {done ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded text-center space-y-3 text-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto" />
            <h3 className="font-bold text-slate-900 text-sm">Password updated</h3>
            <p className="text-slate-600">You can sign in with the new password.</p>
            <Link to="/signin">
              <Button variant="primary" size="sm">Return to Sign In</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <PasswordInput
              label="New password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <PasswordInput
              label="Confirm password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {error && <p className="text-rose-700">{error}</p>}
            <Button type="submit" variant="primary" size="md" className="w-full" isLoading={busy}>
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
