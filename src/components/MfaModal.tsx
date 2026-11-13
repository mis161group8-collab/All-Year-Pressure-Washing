import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, KeyRound } from 'lucide-react';

export const MfaModal: React.FC = () => {
  const { mfaModalOpen, setMfaModalOpen, currentUser, toggleAdminMFA } = useApp();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!mfaModalOpen) return null;

  const isEnabled = !!currentUser.mfaEnabled;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Verify 6-digit code
    if (code.trim().length !== 6) {
      setError('Please enter a 6-digit verification code.');
      return;
    }

    toggleAdminMFA(!isEnabled);
    setMfaModalOpen(false);
    setCode('');
  };

  const handleQuickFill = () => {
    setCode('842190');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-cyan-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEnabled ? 'Multi-Factor Authentication Active' : 'Enable Multi-Factor Authentication'}
              </h3>
              <p className="text-xs text-slate-500">Feature 9: Security & System Administration</p>
            </div>
          </div>
          <button
            onClick={() => setMfaModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full cursor-pointer"
            aria-label="Close MFA modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs text-slate-600">
          <p>
            {isEnabled
              ? 'Multi-Factor Authentication (MFA) is currently protecting your administrative console. To disable or reconfigure authentication, confirm your security token below.'
              : 'Add an extra security layer to protect dispatch routes, financial transactions, and customer records from unauthorized access.'}
          </p>

          <div className="bg-cyan-50/70 p-3 rounded-2xl border border-cyan-100 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Current Status:</span>
              <span className="font-bold text-slate-800 text-sm">{isEnabled ? 'MFA Enabled (2FA)' : 'MFA Disabled'}</span>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="text-[11px] text-cyan-700 hover:text-cyan-900 underline font-semibold cursor-pointer"
            >
              Demo Code: 842190
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Enter 6-Digit Authenticator Token
            </label>
            <input
              type="text"
              placeholder="e.g. 842190"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={6}
              className="w-full text-center tracking-widest font-mono text-xl py-2.5 rounded-2xl border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-cyan-50/20"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className={`btn-rounded flex-1 py-3 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors ${
                isEnabled ? 'bg-amber-600 hover:bg-amber-700' : 'bg-cyan-500 hover:bg-cyan-600'
              }`}
            >
              {isEnabled ? 'Confirm & Disable MFA' : 'Verify & Enable MFA'}
            </button>
            <button
              type="button"
              onClick={() => setMfaModalOpen(false)}
              className="btn-rounded px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
