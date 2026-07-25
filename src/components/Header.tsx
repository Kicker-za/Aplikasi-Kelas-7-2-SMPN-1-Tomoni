import React, { useState } from 'react';
import {
  Bell,
  Sun,
  Moon,
  ShieldCheck,
  RefreshCw,
  User as UserIcon,
  ChevronDown,
  Lock,
  CheckCircle,
  HeartHandshake,
  Users,
} from 'lucide-react';
import { User, SchoolProfile, NotificationItem } from '../types';

interface HeaderProps {
  school: SchoolProfile;
  currentUser: User;
  users: User[];
  onSelectUser: (user: User) => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  lastSyncTime: string;
  onOpenParentAuth: () => void;
  onNavigate?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  school,
  currentUser,
  users,
  onSelectUser,
  notifications,
  onOpenNotifications,
  isDarkMode,
  onToggleDarkMode,
  lastSyncTime,
  onOpenParentAuth,
  onNavigate,
}) => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 md:px-6 backdrop-blur transition-colors">
      {/* Left: Branding & School Title */}
      <div className="flex items-center gap-3">
        {school.logoUrl ? (
          <img
            src={school.logoUrl}
            alt={school.name}
            className="h-10 w-10 rounded-lg object-cover ring-2 ring-slate-200 dark:ring-slate-800 shadow-sm"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600 font-bold text-white shadow-sm">
            SM
          </div>
        )}

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              {school.name}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
            Sistem Informasi Manajemen Pelayanan Administrasi Terpadu Sekolah
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Realtime Sync Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 text-xs text-slate-600 dark:text-slate-300">
          <RefreshCw className="h-3.5 w-3.5 text-emerald-500 animate-spin-slow" />
          <span>Sync Terhubung ({lastSyncTime})</span>
        </div>

        {/* Dark Mode Toggle Button */}
        <button
          onClick={onToggleDarkMode}
          title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
        </button>

        {/* Portal Orang Tua Button */}
        <button
          onClick={onOpenParentAuth}
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 shadow-sm transition"
          title="Daftar & Login Portal Orang Tua"
        >
          <HeartHandshake className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <span>Portal Orang Tua</span>
        </button>

        {/* Notifications Trigger */}
        <button
          onClick={onOpenNotifications}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          title="Notifikasi Realtime"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 p-1.5 pr-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-300 dark:ring-slate-700"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-600 text-xs font-bold text-white">
                {currentUser.name.charAt(0)}
              </div>
            )}

            <div className="text-left hidden md:block">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 max-w-[120px] truncate">
                {currentUser.name}
              </div>
              <div className="text-[10px] capitalize text-sky-600 dark:text-sky-400 font-medium">
                {currentUser.role.replace('_', ' ')}
              </div>
            </div>

            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* User Selector Dropdown */}
          {isUserDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl ring-1 ring-black/5 z-50">
              <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Simulasi Ganti Role User:</p>
              </div>

              <div className="mt-1 space-y-0.5 max-h-60 overflow-y-auto">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      setIsUserDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs transition ${
                      currentUser.id === u.id
                        ? 'bg-sky-50 dark:bg-sky-950/60 font-semibold text-sky-700 dark:text-sky-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <img
                      src={u.avatarUrl}
                      alt={u.name}
                      className="h-6 w-6 rounded-md object-cover shrink-0"
                    />
                    <div className="flex-1 truncate">
                      <div className="truncate font-medium">{u.name}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{u.role.replace('_', ' ')}</div>
                    </div>
                    {u.isTwoFactorEnabled && (
                      <Lock className="h-3 w-3 text-emerald-500 shrink-0" title="2FA Aktif" />
                    )}
                    {currentUser.id === u.id && (
                      <CheckCircle className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
