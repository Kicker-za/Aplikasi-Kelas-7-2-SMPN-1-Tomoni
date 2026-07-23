import React from 'react';
import { X, CheckCheck, Info, CheckCircle2, AlertTriangle, BellRing } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md h-full border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-sky-600 dark:text-sky-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Notifikasi Realtime
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between py-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {notifications.filter((n) => !n.read).length} Notifikasi Belum Dibaca
          </span>
          <button
            onClick={onMarkAllRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Tandai Semua Dibaca
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {notifications.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-center text-slate-400">
              <Info className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-xs">Belum ada notifikasi.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-2xl border p-3.5 transition ${
                  n.read
                    ? 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30'
                    : 'border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/40 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {n.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />}
                  {n.type === 'info' && <Info className="h-4 w-4 text-sky-500 shrink-0 mt-0.5" />}
                  {n.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />}

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.message}
                    </p>
                    <span className="mt-2 inline-block rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      {n.category}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
