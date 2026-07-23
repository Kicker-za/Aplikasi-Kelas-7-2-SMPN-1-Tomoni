import React from 'react';
import {
  FileSpreadsheet,
  Download,
  Building2,
  CalendarCheck,
  Wallet,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  SchoolProfile,
  Student,
  AttendanceRecord,
  FinancialRecord,
  AuditLog,
} from '../types';
import {
  exportSchoolProfilePDF,
  exportAttendancePDF,
  exportFinancialPDF,
  exportAuditLogsPDF,
} from '../lib/pdf';

interface ReportsProps {
  school: SchoolProfile;
  students: Student[];
  attendance: AttendanceRecord[];
  financials: FinancialRecord[];
  auditLogs: AuditLog[];
}

export const ReportsPDFExporter: React.FC<ReportsProps> = ({
  school,
  students,
  attendance,
  financials,
  auditLogs,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
            Pusat Ekspor Laporan Format PDF
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Unduh laporan resmi bertanda tangan digital dalam format PDF untuk keperluan arsip, laporan wali murid, dan laporan dinas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Report Card 1: Profil Sekolah */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-sky-500 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950 text-sky-600">
                <Building2 className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300">
                Laporan Profil Resmi
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Laporan Profil & Data Sekolah
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Dokumen berisi identitas lengkap {school.name}, NPSN {school.npsn}, Akreditasi, Alamat, serta Tanda Tangan Kepala Sekolah ({school.principalName}).
            </p>
          </div>

          <button
            onClick={() => exportSchoolProfilePDF(school)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 py-3 text-xs font-bold text-white shadow-sm transition"
          >
            <Download className="h-4 w-4" />
            <span>Unduh PDF Profil Sekolah</span>
          </button>
        </div>

        {/* Report Card 2: Kehadiran Siswa */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-500 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                <CalendarCheck className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {students.length} Siswa Terdaftar
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Laporan Rekapitulasi Absensi
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Daftar rekapitulasi presensi harian per siswa (Hadir, Sakit, Izin, Alpha) beserta ringkasan statistik persentase kehadiran kelas.
            </p>
          </div>

          <button
            onClick={() => exportAttendancePDF(school, students, attendance)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-sm transition"
          >
            <Download className="h-4 w-4" />
            <span>Unduh PDF Rekap Absensi</span>
          </button>
        </div>

        {/* Report Card 4: Audit Keamanan AES-256 */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-500 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                Enkripsi AES-256-GCM
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. Laporan Audit Keamanan & System
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Catatan audit log zero-trust, riwayat verifikasi 2FA, IP Address pengakses, dan bukti kriptografi hash SHA-256 integritas data.
            </p>
          </div>

          <button
            onClick={() => exportAuditLogsPDF(school, auditLogs)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-bold text-white shadow-sm transition"
          >
            <Download className="h-4 w-4" />
            <span>Unduh PDF Audit Keamanan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
