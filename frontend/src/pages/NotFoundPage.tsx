import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full bg-white p-10 rounded-3xl border border-slate-200/80 shadow-premium animate-fade-in space-y-5">
        <div className="w-16 h-16 rounded-3xl gradient-brand text-white flex items-center justify-center mx-auto shadow-glow">
          <Sparkles className="w-8 h-8" />
        </div>
        <div>
          <span className="text-4xl font-extrabold font-display text-brand-600 block">404</span>
          <h1 className="text-2xl font-bold font-display text-slate-900 mt-1">
            Celebration Page Not Found
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Oops! The page you were looking for seems to have ended or moved to a different venue.
          </p>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:shadow-glow hover:scale-[1.02] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
