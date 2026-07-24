import React, { useState } from 'react';
import {
  CalendarCheck2,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Camera,
  QrCode,
  Download,
  Calendar,
  Search,
  Check,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ChevronRight,
  UserCheck,
  FileText,
  UserX,
} from 'lucide-react';
import { Student, AttendanceRecord, SchoolProfile } from '../types';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { StudentCardsModal } from './StudentCardsModal';
import {
  exportDailyAttendancePDF,
  exportWeeklyAttendancePDF,
  exportMonthlyAttendancePDF,
  exportStudentQRCardsPDF,
} from '../lib/pdf';

interface AttendanceProps {
  students: Student[];
  attendance: AttendanceRecord[];
  profile: SchoolProfile;
  onUpdateAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AttendanceManager: React.FC<AttendanceProps> = ({
  students,
  attendance,
  profile,
  onUpdateAttendance,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'hari_ini' | 'harian' | 'mingguan' | 'bulanan'>('hari_ini');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isCardsModalOpen, setIsCardsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Date filters
  const todayStr = new Date().toISOString().slice(0, 10);
  const [selectedDailyDate, setSelectedDailyDate] = useState(todayStr);
  const [selectedMonth, setSelectedMonth] = useState('2026-07');

  // Helper for generating dates of current week (Monday to Friday)
  const getDatesOfWeek = (baseDateStr: string) => {
    const curr = new Date(baseDateStr);
    const day = curr.getDay(); // 0 is Sunday, 1 is Monday
    const firstDay = new Date(curr);
    firstDay.setDate(curr.getDate() - (day === 0 ? 6 : day - 1));

    const dates: string[] = [];
    for (let i = 0; i < 5; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  };

  const currentWeekDates = getDatesOfWeek(selectedDailyDate);

  // Status Change Handler
  const handleStatusChange = (
    student: Student,
    newStatus: AttendanceRecord['status'],
    dateStr: string = todayStr,
    notes?: string
  ) => {
    onUpdateAttendance((prev) => {
      const existingIdx = prev.findIndex(
        (a) => a.studentId === student.id && a.date === dateStr
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status: newStatus,
          notes: notes !== undefined ? notes : updated[existingIdx].notes,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            studentId: student.id,
            studentName: student.name,
            className: student.className,
            date: dateStr,
            status: newStatus,
            notes: notes || (newStatus === 'hadir' ? 'Pindai/Input Manual' : ''),
          },
        ];
      }
    });
  };

  // Barcode scan callback
  const handleScanSuccess = (student: Student) => {
    handleStatusChange(
      student,
      'hadir',
      todayStr,
      `Pindai Barcode (${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA)`
    );
    showToast(`Presensi HADIR dikonfirmasi untuk ${student.name}`, 'success');
  };

  // Daily records for selected date
  const selectedDateRecords = attendance.filter((a) => a.date === selectedDailyDate);
  const totalHadirToday = selectedDateRecords.filter((a) => a.status === 'hadir').length;
  const totalSakitToday = selectedDateRecords.filter((a) => a.status === 'sakit').length;
  const totalIzinToday = selectedDateRecords.filter((a) => a.status === 'izin').length;
  const totalAlphaToday = selectedDateRecords.filter((a) => a.status === 'alpha').length;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery)
  );

  return (
    <div className="space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider">
              Kelas 7-2 SMPN 1 Tomoni
            </span>
            <span className="text-xs text-slate-400">| Wali Kelas: Ibu Nurhayati, S.Pd.</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-1">
            <CalendarCheck2 className="h-6 w-6 text-emerald-600" />
            Sistem Absensi & Barcode Kehadiran Siswa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Presensi instan dengan pemindaian Barcode/QR HP Guru dan laporan resmi harian, mingguan, serta bulanan SMP Negeri 1 Tomoni.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-md"
          >
            <Camera className="h-4 w-4" />
            Pindai Barcode HP Guru
          </button>

          <button
            onClick={() => setIsCardsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-sm"
          >
            <QrCode className="h-4 w-4" />
            Cetak Kartu Siswa
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/70 dark:bg-emerald-950/40 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalHadirToday}
            </div>
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              Hadir ({students.length > 0 ? ((totalHadirToday / students.length) * 100).toFixed(0) : 0}%)
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalSakitToday}
            </div>
            <div className="text-xs font-bold text-amber-700 dark:text-amber-300">Sakit</div>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/70 dark:bg-sky-950/40 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalIzinToday}
            </div>
            <div className="text-xs font-bold text-sky-700 dark:text-sky-300">Izin</div>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white shrink-0">
            <XCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalAlphaToday}
            </div>
            <div className="text-xs font-bold text-rose-700 dark:text-rose-300">Alpha</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('hari_ini')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'hari_ini'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Presensi Hari Ini
          </button>

          <button
            onClick={() => setActiveTab('harian')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'harian'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            Laporan Harian
          </button>

          <button
            onClick={() => setActiveTab('mingguan')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'mingguan'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Laporan Mingguan
          </button>

          <button
            onClick={() => setActiveTab('bulanan')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'bulanan'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Laporan Bulanan
          </button>
        </div>

        {/* Date Filter Control */}
        {(activeTab === 'hari_ini' || activeTab === 'harian' || activeTab === 'mingguan') && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Pilih Tanggal:</span>
            <input
              type="date"
              value={selectedDailyDate}
              onChange={(e) => setSelectedDailyDate(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
            />
          </div>
        )}

        {activeTab === 'bulanan' && (
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
            <span>Pilih Bulan:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* TAB 1: PRESENSI HARI INI */}
      {activeTab === 'hari_ini' && (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          {/* Table Header Controls */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama atau NISN siswa Kelas 7-2..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  students.forEach((st) => handleStatusChange(st, 'hadir', selectedDailyDate));
                  showToast('Semua siswa ditandai HADIR hari ini', 'success');
                }}
                className="rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 text-xs font-bold hover:bg-emerald-100 transition"
              >
                Tandai Semua Hadir
              </button>
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/20">
                  <th className="p-4">Siswa & NISN</th>
                  <th className="p-4">L/P</th>
                  <th className="p-4">Status Kehadiran</th>
                  <th className="p-4">Keterangan / Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredStudents.map((st) => {
                  const attRecord = attendance.find(
                    (a) => a.studentId === st.id && a.date === selectedDailyDate
                  );
                  const currentStatus = attRecord ? attRecord.status : 'hadir';
                  const currentNotes = attRecord?.notes || '';

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          {st.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          NISN: {st.nisn} | Token: {st.qrToken || `SIMPATI-72-${st.nisn}`}
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                        {st.gender}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          {(['hadir', 'sakit', 'izin', 'alpha'] as const).map((stt) => {
                            const isSelected = currentStatus === stt;
                            return (
                              <button
                                key={stt}
                                onClick={() => handleStatusChange(st, stt, selectedDailyDate)}
                                className={`rounded-xl px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition ${
                                  isSelected
                                    ? stt === 'hadir'
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : stt === 'sakit'
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : stt === 'izin'
                                      ? 'bg-sky-600 text-white shadow-xs'
                                      : 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                              >
                                {stt}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-4">
                        <input
                          type="text"
                          value={currentNotes}
                          onChange={(e) =>
                            handleStatusChange(st, currentStatus, selectedDailyDate, e.target.value)
                          }
                          placeholder="Catatan..."
                          className="w-full max-w-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs text-slate-900 dark:text-white focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LAPORAN HARIAN */}
      {activeTab === 'harian' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Laporan Kehadiran Harian Format SMP Negeri 1 Tomoni
              </h3>
              <p className="text-xs text-slate-500">
                Tanggal: {new Date(selectedDailyDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => {
                exportDailyAttendancePDF(profile, students, attendance, selectedDailyDate);
                showToast('Laporan Kehadiran Harian berhasil diunduh (PDF)!', 'success');
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
            >
              <Download className="h-4 w-4" />
              Download Laporan PDF Harian
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/30">
              Pratinjau Tabel Laporan Harian Kelas 7-2
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
                    <th className="p-3">No</th>
                    <th className="p-3">NISN</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">L/P</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Catatan / Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((st, idx) => {
                    const rec = selectedDateRecords.find((a) => a.studentId === st.id);
                    const stt = rec ? rec.status : 'hadir';
                    return (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3 font-mono">{st.nisn}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                        <td className="p-3">{st.gender}</td>
                        <td className="p-3">
                          <span
                            className={`inline-block rounded-md px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                              stt === 'hadir'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                                : stt === 'sakit'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                                : stt === 'izin'
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            }`}
                          >
                            {stt}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{rec?.notes || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LAPORAN MINGGUAN */}
      {activeTab === 'mingguan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Laporan Rekapitulasi Presensi Mingguan Kelas 7-2
              </h3>
              <p className="text-xs text-slate-500">
                Periode Mingguan: {currentWeekDates[0]} s.d. {currentWeekDates[currentWeekDates.length - 1]}
              </p>
            </div>
            <button
              onClick={() => {
                exportWeeklyAttendancePDF(profile, students, attendance, currentWeekDates);
                showToast('Laporan Kehadiran Mingguan berhasil diunduh (PDF)!', 'success');
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
            >
              <Download className="h-4 w-4" />
              Download Laporan PDF Mingguan
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/30">
              Matriks Presensi 5 Hari Sekolah (Senin - Jumat)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
                    <th className="p-3">No</th>
                    <th className="p-3">NISN</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">L/P</th>
                    <th className="p-3 text-center">Sen</th>
                    <th className="p-3 text-center">Sel</th>
                    <th className="p-3 text-center">Rab</th>
                    <th className="p-3 text-center">Kam</th>
                    <th className="p-3 text-center">Jum</th>
                    <th className="p-3 text-center">H / S / I / A</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((st, idx) => {
                    let cntH = 0;
                    let cntS = 0;
                    let cntI = 0;
                    let cntA = 0;

                    const dayStatuses = currentWeekDates.map((dStr) => {
                      const rec = attendance.find((a) => a.studentId === st.id && a.date === dStr);
                      if (!rec || rec.status === 'hadir') {
                        cntH++;
                        return 'H';
                      } else if (rec.status === 'sakit') {
                        cntS++;
                        return 'S';
                      } else if (rec.status === 'izin') {
                        cntI++;
                        return 'I';
                      } else {
                        cntA++;
                        return 'A';
                      }
                    });

                    return (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3 font-mono">{st.nisn}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                        <td className="p-3">{st.gender}</td>

                        {dayStatuses.map((stt, dIdx) => (
                          <td key={dIdx} className="p-3 text-center font-bold">
                            <span
                              className={
                                stt === 'H'
                                  ? 'text-emerald-600'
                                  : stt === 'S'
                                  ? 'text-amber-500'
                                  : stt === 'I'
                                  ? 'text-sky-600'
                                  : 'text-rose-600'
                              }
                            >
                              {stt}
                            </span>
                          </td>
                        ))}

                        <td className="p-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                          {cntH} / {cntS} / {cntI} / {cntA}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LAPORAN BULANAN */}
      {activeTab === 'bulanan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Laporan Rekapitulasi Presensi Bulanan SMP Negeri 1 Tomoni
              </h3>
              <p className="text-xs text-slate-500">
                Bulan Rekapitulasi: {new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button
              onClick={() => {
                exportMonthlyAttendancePDF(profile, students, attendance, selectedMonth);
                showToast('Laporan Kehadiran Bulanan berhasil diunduh (PDF)!', 'success');
              }}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
            >
              <Download className="h-4 w-4" />
              Download Laporan PDF Bulanan
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800/30">
              Rekap Akumulasi Kehadiran & Persentase Kelas 7-2
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
                    <th className="p-3">No</th>
                    <th className="p-3">NISN</th>
                    <th className="p-3">Nama Siswa</th>
                    <th className="p-3">L/P</th>
                    <th className="p-3 text-emerald-600 font-bold">Hadir (H)</th>
                    <th className="p-3 text-amber-500 font-bold">Sakit (S)</th>
                    <th className="p-3 text-sky-600 font-bold">Izin (I)</th>
                    <th className="p-3 text-rose-600 font-bold">Alpha (A)</th>
                    <th className="p-3 text-right font-bold">% Kehadiran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((st, idx) => {
                    const monthRecs = attendance.filter(
                      (a) => a.studentId === st.id && a.date.startsWith(selectedMonth)
                    );
                    const cntH = monthRecs.filter((a) => a.status === 'hadir').length;
                    const cntS = monthRecs.filter((a) => a.status === 'sakit').length;
                    const cntI = monthRecs.filter((a) => a.status === 'izin').length;
                    const cntA = monthRecs.filter((a) => a.status === 'alpha').length;

                    const displayH = monthRecs.length === 0 ? 22 : cntH;
                    const displayS = cntS;
                    const displayI = cntI;
                    const displayA = cntA;
                    const totalDays = displayH + displayS + displayI + displayA;
                    const pct = totalDays > 0 ? ((displayH / totalDays) * 100).toFixed(1) : '100.0';

                    return (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="p-3">{idx + 1}</td>
                        <td className="p-3 font-mono">{st.nisn}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{st.name}</td>
                        <td className="p-3">{st.gender}</td>
                        <td className="p-3 font-bold text-emerald-600">{displayH} hari</td>
                        <td className="p-3 text-amber-500 font-semibold">{displayS}</td>
                        <td className="p-3 text-sky-600 font-semibold">{displayI}</td>
                        <td className="p-3 text-rose-600 font-semibold">{displayA}</td>
                        <td className="p-3 text-right font-black text-slate-900 dark:text-white">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        students={students}
        onScanSuccess={handleScanSuccess}
        showToast={showToast}
      />

      {/* Student Printable Cards Modal */}
      <StudentCardsModal
        isOpen={isCardsModalOpen}
        onClose={() => setIsCardsModalOpen(false)}
        students={students}
        profile={profile}
        showToast={showToast}
      />
    </div>
  );
};
