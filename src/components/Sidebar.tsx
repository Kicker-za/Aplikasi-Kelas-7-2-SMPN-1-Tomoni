import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  MessageSquareText,
  CalendarCheck2,
  ShieldCheck,
  Webhook,
  Sparkles,
  Network,
  Camera,
  HeartHandshake,
} from 'lucide-react';

export type TabKey =
  | 'overview'
  | 'class_structure'
  | 'class_documentation'
  | 'school_data'
  | 'user_management'
  | 'smart_pickup'
  | 'attendance'
  | 'security_vault'
  | 'api_integrations';

interface SidebarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  unreadNotifCount: number;
  unreadPickupCount: number;
  onOpenParentAuth?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  unreadNotifCount,
  unreadPickupCount,
  onOpenParentAuth,
}) => {
  const navItems: {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    { key: 'overview', label: 'Dashboard Utama', icon: LayoutDashboard },
    { key: 'attendance', label: 'Absensi & Kehadiran', icon: CalendarCheck2 },
    {
      key: 'smart_pickup',
      label: 'Notifikasi Pulang Sekolah',
      icon: MessageSquareText,
      badge: unreadPickupCount > 0 ? unreadPickupCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { key: 'user_management', label: 'User dan Foto Profil', icon: Users },
    {
      key: 'class_structure',
      label: 'Struktur Kelas 7-2',
      icon: Network,
      badge: '7-2',
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      key: 'class_documentation',
      label: 'Galeri Kegiatan 7-2',
      icon: Camera,
      badge: 'Foto',
      badgeColor: 'bg-sky-500 text-white',
    },
    { key: 'school_data', label: 'Profil & Data Sekolah', icon: Building2 },
    { key: 'api_integrations', label: 'Integrasi API & WA', icon: Webhook },
  ];


  return (
    <aside className="w-full md:w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-colors">
      <div className="mb-4 px-2 hidden md:block">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Modul SIMPATI Admin
        </p>
      </div>

      <nav className="space-y-1.5 flex md:flex-col overflow-x-auto md:overflow-x-visible py-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition shrink-0 md:shrink ${
                isActive
                  ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="whitespace-nowrap">{item.label}</span>

              {item.badge && (
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    item.badgeColor || 'bg-sky-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Portal Orang Tua & User Banner Card */}
      {onOpenParentAuth && (
        <div className="mt-6 hidden md:block rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/80 dark:bg-sky-950/40 p-3.5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-200">
            <HeartHandshake className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>Portal & Akun User</span>
          </div>
          <p className="text-[11px] text-sky-700 dark:text-sky-300 leading-snug">
            Akses portal wali murid & kelola foto profil pengguna dari HP.
          </p>
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              onClick={onOpenParentAuth}
              className="rounded-xl bg-sky-600 hover:bg-sky-700 py-1.5 px-2 text-[11px] font-bold text-white shadow-xs transition text-center"
            >
              Portal Ortu
            </button>
            <button
              onClick={() => onSelectTab('user_management')}
              className="rounded-xl border border-sky-300 dark:border-sky-800 bg-white dark:bg-sky-900/60 hover:bg-sky-100 dark:hover:bg-sky-800 py-1.5 px-2 text-[11px] font-bold text-sky-800 dark:text-sky-200 shadow-xs transition text-center"
            >
              User & Foto
            </button>
          </div>
        </div>
      )}

      {/* System Status Info Card */}
      <div className="mt-8 hidden md:block rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3.5">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Sistem Terintegrasi</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Data tersimpan aman & disinkronkan otomatis antar perangkat sekolah dan orang tua.
        </p>
      </div>
    </aside>
  );
};
