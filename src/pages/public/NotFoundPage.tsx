import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/common/Logo';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-slate-900">
      <Compass className="w-12 h-12 text-slate-400 mb-4" />
      <h1 className="text-4xl font-bold font-display text-slate-950">404</h1>
      <h2 className="mt-2 text-base font-semibold text-slate-800">Page or Course Not Found</h2>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">
        The destination you requested may have been relocated, unpublished, or the URL might be mistyped.
      </p>
      <div className="mt-6 flex gap-3">
        <Link to="/">
          <Button variant="primary" size="sm">
            Go to Home
          </Button>
        </Link>
        <Link to="/courses">
          <Button variant="outline" size="sm">
            Explore Courses
          </Button>
        </Link>
      </div>
    </div>
  );
};
