import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Wrench,
  Lock,
  LogIn,
  UserPlus,
  Mail,
  KeyRound,
  RefreshCw,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

interface AuthCardProps {
  portalType: 'customer' | 'technical' | 'admin';
  badgeText: string;
  title: string;
  description: string;
  googleButtonLabel?: string;
  helperFooter?: string;
  onBackHome?: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  portalType,
  badgeText,
  title,
  description,
  googleButtonLabel = 'Continue with Google',
  helperFooter,
  onBackHome
}) => {
  const {
    authError,
    clearAuthError,
    signInWithGoogle,
    signInWithEmail,
    createAccountWithEmail,
    sendPasswordReset
  } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const PortalIcon = portalType === 'admin' ? Lock : portalType === 'technical' ? Wrench : User;

  const handleTabSwitch = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    setInfoMessage(null);
    clearAuthError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMessage(null);
    clearAuthError();
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password, portalType);
      } else {
        const res = await createAccountWithEmail(fullName, email, password, portalType);
        if (res.success && res.message) {
          setInfoMessage(res.message);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setInfoMessage(null);
    clearAuthError();
    const res = await sendPasswordReset(email);
    if (res.success && res.message) {
      setInfoMessage(res.message);
    }
  };

  return (
    <div className="py-14 max-w-lg mx-auto px-4 sm:px-6 text-[#222222]">
      <div className="bg-white rounded-3xl p-8 border border-[#E8EEF1] shadow-sm space-y-5">
        <div className="text-center space-y-2.5">
          <div className="w-14 h-14 rounded-2xl bg-[#E8EEF1] text-[#263F50] mx-auto flex items-center justify-center">
            <PortalIcon className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E8EEF1] text-[#263F50]">
              {badgeText}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#222222]">{title}</h1>
          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">{description}</p>
        </div>

        {/* Sign In / Create Account Toggle */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#F8F9F7] border border-[#E8EEF1]">
          <button
            type="button"
            onClick={() => handleTabSwitch('signin')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'signin'
                ? 'bg-[#263F50] text-white shadow-2xs'
                : 'text-[#555555] hover:text-[#222222]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('signup')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#263F50] text-white shadow-2xs'
                : 'text-[#555555] hover:text-[#222222]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {authError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 text-left">
            {authError}
          </div>
        )}

        {infoMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 text-left flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-semibold text-[#555555] mb-1">Full Name *</label>
              <input
                type="text"
                required
                minLength={2}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Jordan Alvarez"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#263F50]"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#555555] mb-1">Email Address *</label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#263F50]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-[#555555]">
                Password *{mode === 'signup' ? ' (min 6 characters)' : ''}
              </label>
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => void handleForgotPassword()}
                  className="text-[11px] font-semibold text-[#263F50] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={mode === 'signup' ? 6 : 1}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Create a password (6+ chars)' : 'Enter your password'}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F8F9F7] border border-[#E8EEF1] text-xs sm:text-sm text-[#222222] focus:outline-none focus:border-[#263F50]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-rounded w-full py-3 px-6 bg-[#263F50] hover:bg-[#1A2E3D] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>
              {submitting
                ? mode === 'signin'
                  ? 'Signing In...'
                  : 'Creating Account...'
                : mode === 'signin'
                ? 'Sign In with Email'
                : 'Create Account'}
            </span>
          </button>
        </form>

        <div className="relative flex items-center py-0.5">
          <div className="flex-grow border-t border-[#E8EEF1]" />
          <span className="shrink mx-3 text-[11px] font-semibold text-[#777777] uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-[#E8EEF1]" />
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => void signInWithGoogle(portalType)}
            className="btn-rounded w-full py-2.5 px-6 bg-[#E8EEF1] hover:bg-[#DCE5EA] text-[#263F50] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{googleButtonLabel}</span>
          </button>

          {onBackHome && (
            <button
              type="button"
              onClick={onBackHome}
              className="btn-rounded w-full py-2.5 px-6 bg-[#F8F9F7] hover:bg-[#E8EEF1] text-[#555555] font-semibold text-xs border border-[#E8EEF1] cursor-pointer"
            >
              Return to Public Website
            </button>
          )}
        </div>

        {(portalType === 'admin' || portalType === 'technical') && (
          <div className="p-3 rounded-2xl bg-[#F8F9F7] border border-[#E8EEF1] text-[11px] text-[#555555] text-left">
            <strong className="text-[#263F50]">Role Access Note:</strong> Anyone can create an account above; full{' '}
            {portalType === 'admin' ? 'Administrator & Billing' : 'Field Dispatch Route'} permissions require signing in with an authorized staff/admin email (<span className="font-mono">mis161group8@gmail.com</span>).
          </div>
        )}

        {helperFooter && <p className="text-[11px] text-[#777777] text-center">{helperFooter}</p>}
      </div>
    </div>
  );
};

export const EmailVerificationBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { firebaseUser, isEmailVerified, resendVerificationEmail, refreshAuthUser } = useApp();
  const [busy, setBusy] = useState(false);

  if (!firebaseUser || isEmailVerified) {
    return null;
  }

  const handleRefresh = async () => {
    setBusy(true);
    try {
      await refreshAuthUser();
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    setBusy(true);
    try {
      await resendVerificationEmail();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`${
        compact ? 'p-3.5 rounded-2xl' : 'mt-6 p-4 rounded-2xl'
      } bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900`}
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Email Verification Required</div>
          <div className="mt-0.5 leading-relaxed">
            Click the verification link we sent to <strong>{firebaseUser.email}</strong> (check spam/junk too), then click{' '}
            <strong>I Verified — Refresh</strong> to unlock bookings, quotes, and profile saves.
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleRefresh()}
          className="btn-rounded px-3.5 py-2 bg-[#263F50] hover:bg-[#1A2E3D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
          <span>I Verified — Refresh</span>
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void handleResend()}
          className="btn-rounded px-3.5 py-2 bg-white hover:bg-[#E8EEF1] text-[#263F50] border border-amber-300 text-xs font-semibold cursor-pointer disabled:opacity-50"
        >
          Resend Email
        </button>
      </div>
    </div>
  );
};
