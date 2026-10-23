import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService, aiService } from '../services/api';
import toast from 'react-hot-toast';
import {
  User as UserIcon,
  Mail,
  Phone,
  Save,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Key,
  Shield,
  LogOut,
} from 'lucide-react';

export const ProfileSettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const [aiStatus, setAiStatus] = useState<{
    geminiConfigured: boolean;
    model: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    aiService
      .getStatus()
      .then((res) => {
        setAiStatus(res);
      })
      .catch(() => {});
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await authService.updateProfile({ name, phone });
      if (res.success) {
        updateUser({ name, phone });
        toast.success('Profile updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-slate-900">
          Profile & AI Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account details and review your Google Gemini AI engine configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Account Profile Form */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold font-display text-slate-900 border-b border-slate-100 pb-3">
            Personal Information
          </h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Email Address (Account Identifier)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl gradient-brand text-white text-xs font-bold shadow-md hover:shadow-glow flex items-center gap-1.5 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Engine & Security Info */}
        <div className="space-y-6">
          {/* Gemini AI Status Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-brand-600" />
              <h3 className="text-base font-bold font-display text-slate-900">
                Gemini AI Engine
              </h3>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${
                aiStatus?.geminiConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {aiStatus?.geminiConfigured ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Live Gemini AI Integration Connected</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Curated Template Mode</span>
                  </>
                )}
              </div>
              <p className="text-[11px] pt-1">
                Active Model: <code className="font-mono font-bold">{aiStatus?.model}</code>
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              To connect your real Google Gemini API key:
            </p>
            <ol className="text-xs text-slate-600 space-y-1.5 pl-4 list-decimal">
              <li>Get a key from Google AI Studio.</li>
              <li>
                Paste into <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">backend/.env</code>:
                <br />
                <code className="text-[11px] text-brand-600 font-mono block mt-0.5">
                  GEMINI_API_KEY=AIzaSy...
                </code>
              </li>
              <li>Restart the backend server.</li>
            </ol>
          </div>

          {/* Sign Out Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Festiva AI</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
