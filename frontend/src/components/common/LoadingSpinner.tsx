import React from 'react';
import { Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Loading Festiva AI...',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3 animate-fade-in">
      <div className="relative">
        <div
          className={`${sizeMap[size]} rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center text-brand-600">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        </div>
      </div>
      {text && <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};
