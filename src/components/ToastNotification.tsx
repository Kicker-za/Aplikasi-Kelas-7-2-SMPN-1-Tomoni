import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'error';
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 max-w-md rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl transition-all duration-300 animate-slide-up">
      {type === 'success' && <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />}
      {type === 'info' && <Info className="h-6 w-6 text-sky-500 shrink-0" />}
      {type === 'error' && <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0" />}

      <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-100">
        {message}
      </div>

      <button
        onClick={onClose}
        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
