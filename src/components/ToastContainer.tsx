import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
      {toasts.map((toast) => {
        let bgStyle = 'bg-white border-cyan-200 text-slate-800';
        let Icon = Info;
        let iconColor = 'text-cyan-600';

        if (toast.type === 'success') {
          bgStyle = 'bg-white border-cyan-300 text-slate-800 shadow-cyan-100';
          Icon = CheckCircle2;
          iconColor = 'text-cyan-600';
        } else if (toast.type === 'warning') {
          bgStyle = 'bg-amber-50 border-amber-200 text-amber-900 shadow-amber-50';
          Icon = AlertCircle;
          iconColor = 'text-amber-600';
        } else if (toast.type === 'error') {
          bgStyle = 'bg-rose-50 border-rose-200 text-rose-900 shadow-rose-50';
          Icon = AlertCircle;
          iconColor = 'text-rose-600';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg transition-all duration-300 ${bgStyle}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="text-sm font-medium leading-relaxed flex-1">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 -mr-1 -mt-1 rounded-full transition-colors"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
