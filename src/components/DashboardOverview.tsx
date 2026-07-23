import React from 'react';
import {
  Users,
  Building2,
  CalendarCheck,
  ShieldCheck,
  KeyRound,
  QrCode,
  ArrowUpRight,
  Sparkles,
  Download,
  Send,
  Lock,
  Network,
  Camera,
  HeartHandshake,
} from 'lucide-react';
import {
  SchoolProfile,
  Student,
  AttendanceRecord,
  FinancialRecord,
  User,
  AuditLog,
} from '../types';
import { TabKey } from './Sidebar';

interface OverviewProps {
  school: SchoolProfile;
  students: Student[];
  attendance: AttendanceRecord[];
  financials: FinancialRecord[];
  users: User[];
  auditLogs: AuditLog[];
  onNavigate: (tab: TabKey) => void;
  onExportPDF: () => void;
  onOpenParentAuth?: () => void;
}

export const DashboardOverview: React.FC<OverviewProps> = ({
  school,
  students,
  attendance,
  financials,
  users,
  auditLogs,
  onNavigate,
  onExportPDF,
  onOpenParentAuth,
}) => {
  const totalHadir = attendance.filter((a) => a.status === 'hadir').length;
  const presenceRate = students.length > 0 ? Math.round((totalHadir / students.length) * 100) : 100;

  const total2FA = users.filter((u) => u.isTwoFactorEnabled).length;
  const totalPulang = students.filter((s) => s.pickupStatus === 'sudah_pulang' || s.pickupStatus === 'menuju_sekolah').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md border border-white/15">
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin-slow" />
              <span>SIMPATI Dashboard Admin V2.0</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Selamat Datang di SIMPATI {school.name}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Sistem terpadu manajemen administrasi sekolah, absensi real-time, notifikasi penjemputan siswa, serta portal orang tua.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('smart_pickup')}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs md:text-sm font-bold text-white shadow-lg hover:bg-amber-600 transition"
            >
              <Send className="h-4 w-4" />
              Tandai Pulang ({totalPulang})
            </button>
            <button
              onClick={onExportPDF}
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 text-xs md:text-sm font-semibold text-white backdrop-blur-md transition"
            >
              <Download className="h-4 w-4" />
              Cetak Laporan PDF
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-sky-500/20 blur-3xl" />
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Siswa */}
        <div
          onClick={() => onNavigate('user_management')}
          className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-sky-500 transition duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Siswa Terdaftar</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{students.length}</span>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
              100% Aktif <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        {/* Kehadiran Realtime */}
        <div
          onClick={() => onNavigate('attendance')}
          className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-emerald-500 transition duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tingkat Kehadiran</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{presenceRate}%</span>
            <span className="text-xs font-medium text-emerald-600">{totalHadir} dari {students.length} Hadir</span>
          </div>
        </div>

        {/* Total Wali Murid / Orang Tua */}
        <div
          onClick={() => onNavigate('user_management')}
          className="group cursor-pointer rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500 transition duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Wali Murid Terdaftar</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition">
              <HeartHandshake className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {users.filter((u) => u.role === 'orang_tua').length} Wali
            </span>
            <span className="text-xs font-medium text-slate-500">Terhubung Siswa</span>
          </div>
        </div>
      </div>

      {/* Main Content Sections: Quick Actions & Live Security Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-sky-600" />
            Pintasan Fitur SIMPATI
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {onOpenParentAuth && (
              <button
                onClick={onOpenParentAuth}
                className="col-span-1 sm:col-span-2 flex items-center justify-between rounded-2xl border border-sky-300 dark:border-sky-800 bg-gradient-to-r from-sky-500 to-indigo-600 p-4 text-white shadow-md hover:opacity-95 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white shrink-0">
                    <HeartHandshake className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-sm font-extrabold">Portal Pendaftaran & Login Orang Tua</h4>
                    <p className="text-xs text-sky-100">
                      Akses mandiri wali murid: Daftar akun baru, login via WhatsApp OTP, dan pantau status penjemputan anak.
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white shrink-0">
                  <span>Masuk Portal</span>
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </button>
            )}

            <button
              onClick={() => onNavigate('class_structure')}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4 text-left hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Struktur Organisasi Kelas 7-2</h4>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Lihat & kelola susunan pengurus Wali Kelas, Ketua, Sekretaris & Seksi.
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('class_documentation')}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4 text-left hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-800 transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shrink-0">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Galeri Kegiatan & Momen 7-2</h4>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Foto-foto Pramuka, Gotong Royong, Classmeeting, & Pentas Seni 7-2.
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('school_data')}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4 text-left hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-800 transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Edit Data & Logo Sekolah</h4>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Ubah identitas sekolah, upload logo, dan perbarui data real-time.
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('smart_pickup')}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4 text-left hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-800 transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Smart Parent Pickup & QR</h4>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Kirim notifikasi WA ke ortu & verifikasi penjemputan via scan QR.
                </p>
              </div>
            </button>

            <button
              onClick={() => onNavigate('reports_pdf')}
              className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-4 text-left hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-slate-800 transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shrink-0">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ekspor Laporan PDF Formal</h4>
                <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Cetak rekap data profil, absensi & aktivitas sekolah.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Live Audit Trail */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="h-4 w-4 text-sky-500" />
            Log Aktivitas System
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-72 pr-1">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span className="font-mono text-[10px]">{log.timestamp.slice(11, 19)}</span>
                  <span className="rounded bg-sky-100 dark:bg-sky-950 px-1.5 py-0.5 text-[9px] font-bold text-sky-700 dark:text-sky-300">
                    Sistem
                  </span>
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{log.action}</div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 truncate">{log.details}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
