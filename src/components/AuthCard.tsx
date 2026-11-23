import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Mail,
  Lock,
  User as UserIcon,
  LogIn,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  ShieldAlert
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

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (nextMode: 'signin' | 'signup' | 'reset') => {
    setMode(nextMode);
    setLocalError(null);
    setInfoMessage(null);
    clearAuthError();
  };

  // Call signInWithGoogle directly inside button onClick so browsers never treat it as an async blocked popup
  const handleGoogleClick = () => {
    setLocalError(null);
    setInfoMessage(null);
    clearAuthError();
    void signInWithGoogle(portalType);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setInfoMessage(null);
    clearAuthError();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    if (mode === 'reset') {
      setSubmitting(true);
      try {
        const res = await sendPasswordReset(trimmedEmail);
        if (res.success) {
          setInfoMessage(
            `Password reset instructions have been sent to ${trimmedEmail}. Check your inbox and spam folder.`
          );
        } else {
          setLocalError(res.error || 'Unable to send password reset email.');
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim() || name.trim().length < 2) {
        setLocalError('Please enter your full name.');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
      setSubmitting(true);
      try {
        const res = await createAccountWithEmail(name.trim(), trimmedEmail, password);
        if (!res.success) {
          setLocalError(res.error || 'Could not create your account.');
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await signInWithEmail(trimmedEmail, password);
      if (!res.success) {
        setLocalError(res.error || 'Invalid email or password.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const displayedError = localError || authError;

  return (
    <div className="py-12 max-w-md mx-auto px-4 sm:px-6 text-[#222222]">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8EEF1] shadow-sm space-y-6">
        <div className="space-y-2 text-center">
          <span className="inline-block text-[11px] font-bold px-3 py-0.5 rounded-full bg-[#E8EEF1] text-[#263F50] border border-[#D5E0E6]">
            {badgeText}
          </span>
          <h1 className="text-2xl font-bold text-[#222222]">{title}</h1>
          <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">{description}</p>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleClick}
          className="btn-rounded w-full py-2.5 px-4 bg-[#263F50] hover:bg-[#1A2E3D] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>{googleButtonLabel}</span>
        </button>

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-[#E8EEF1]" />
          <span className="shrink mx-3 text-[11px] font-semibold uppercase tracking-wider text-[#888888]">
            or use email &amp; password
          </span>
          <div className="flex-grow border-t border-[#E8EEF1]" />
        </div>

        {/* Mode Switcher */}
        {mode !== 'reset' && (
          <div className="grid grid-cols-2 bg-[#F8F9F7] p-1 rounded-2xl border border-[#E8EEF1] text-xs font-bold">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`py-2 rounded-xl transition-colors cursor-pointer ${
                mode === 'signin' ? 'bg-white text-[#263F50] shadow-2xs' : 'text-[#555555] hover:text-[#222222]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`py-2 rounded-xl transition-colors cursor-pointer ${
                mode === 'signup' ? 'bg-white text-[#263F50] shadow-2xs' : 'text-[#555555] hover:text-[#222222]'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {displayedError && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{displayedError}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('reset')}
                    className="text-[11px] font-semibold text-[#263F50] hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] font-bold text-[#222222] uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#777777] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-[#E8EEF1] bg-[#F8F9F7] text-xs text-[#222222] focus:outline-none focus:border-[#263F50]"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-rounded w-full py-2.5 px-4 bg-[#E8EEF1] hover:bg-[#DCE5EA] text-[#263F50] border border-[#D5E0E6] font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {submitting
              ? 'Please wait...'
              : mode === 'signin'
              ? 'Sign In with Email'
              : mode === 'signup'
              ? 'Create Account & Send Verification Email'
              : 'Send Password Reset Email'}
          </button>

          {mode === 'reset' && (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="w-full text-center text-xs font-semibold text-[#555555] hover:text-[#263F50] pt-1 cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          )}
        </form>

        {(portalType === 'admin' || portalType === 'technical') && (
          <div className="p-3 rounded-2xl bg-[#F8F9F7] border border-[#E8EEF1] text-[11px] text-[#555555] leading-relaxed">
            <strong>Role-Based Security:</strong> Only verified owner/admin and authorized technician accounts registered in Firestore can access {portalType === 'admin' ? 'administrator' : 'field dispatch'} records.
          </div>
        )}

        {helperFooter && (
          <p className="text-[11px] text-center text-[#777777] leading-relaxed">{helperFooter}</p>
        )}

        {onBackHome && (
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={onBackHome}
              className="text-xs font-semibold text-[#555555] hover:text-[#263F50] underline cursor-pointer"
            >
              Return to Home Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const EmailVerificationBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { firebaseUser, isEmailVerified, resendVerificationEmail, refreshAuthUser } = useApp();
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!firebaseUser || isEmailVerified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerificationEmail();
    } finally {
      setSending(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAuthUser();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div
      className={`${compact ? 'p-3.5' : 'mt-6 p-4'} rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900`}
    >
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold">Email Verification Required</div>
          <div className="mt-0.5 leading-relaxed">
            A verification link was sent to <strong>{firebaseUser.email}</strong>. Click the link in your inbox, then refresh below to unlock saving profiles, quotes, and bookings.
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        <button
          type="button"
          disabled={sending}
          onClick={() => void handleResend()}
          className="btn-rounded px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-[11px] cursor-pointer disabled:opacity-50"
        >
          {sending ? 'Sending...' : 'Resend Verification'}
        </button>
        <button
          type="button"
          disabled={refreshing}
          onClick={() => void handleRefresh()}
          className="btn-rounded px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Checking...' : "I've Verified"}</span>
        </button>
      </div>
    </div>
  );
};
