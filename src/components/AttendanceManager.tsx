import React from 'react';
import { CalendarCheck2, CheckCircle, AlertCircle, Clock, XCircle, Save } from 'lucide-react';
import { Student, AttendanceRecord } from '../types';

interface AttendanceProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onUpdateAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const AttendanceManager: React.FC<AttendanceProps> = ({
  students,
  attendance,
  onUpdateAttendance,
  showToast,
}) => {
  const dateToday = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleStatusChange = (student: Student, newStatus: AttendanceRecord['status']) => {
    onUpdateAttendance((prev) => {
      const existingIdx = prev.findIndex((a) => a.studentId === student.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], status: newStatus };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: 'att-' + Date.now(),
            studentId: student.id,
            studentName: student.name,
            className: student.className,
            date: new Date().toISOString().slice(0, 10),
            status: newStatus,
          },
        ];
      }
    });
    showToast(`Status kehadiran ${student.name} diperbarui ke '${newStatus.toUpperCase()}'`, 'info');
  };

  const totalHadir = attendance.filter((a) => a.status === 'hadir').length;
  const totalSakit = attendance.filter((a) => a.status === 'sakit').length;
  const totalIzin = attendance.filter((a) => a.status === 'izin').length;
  const totalAlpha = attendance.filter((a) => a.status === 'alpha').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-emerald-600" />
            Absensi & Kehadiran Siswa
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Catat dan pantau kehadiran harian siswa per kelas secara real-time. {dateToday}
          </p>
        </div>
      </div>

      {/* Summary Stat Pill Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/40 p-4 flex items-center gap-3">
          <CheckCircle className="h-8 w-8 text-emerald-500 shrink-0" />
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{totalHadir}</div>
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Hadir</div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/40 p-4 flex items-center gap-3">
          <AlertCircle className="h-8 w-8 text-amber-500 shrink-0" />
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{totalSakit}</div>
            <div className="text-xs font-semibold text-amber-700 dark:text-amber-300">Sakit</div>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/40 p-4 flex items-center gap-3">
          <Clock className="h-8 w-8 text-sky-500 shrink-0" />
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{totalIzin}</div>
            <div className="text-xs font-semibold text-sky-700 dark:text-sky-300">Izin</div>
          </div>
        </div>

        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50/60 dark:bg-rose-950/40 p-4 flex items-center gap-3">
          <XCircle className="h-8 w-8 text-rose-500 shrink-0" />
          <div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{totalAlpha}</div>
            <div className="text-xs font-semibold text-rose-700 dark:text-rose-300">Alpha</div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Form Presensi Harian Siswa
          </span>
          <span className="text-xs text-slate-400">Total {students.length} Siswa</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/20">
                <th className="p-4">NISN & Nama Siswa</th>
                <th className="p-4">Kelas</th>
                <th className="p-4">Pilih Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {students.map((st) => {
                const attRecord = attendance.find((a) => a.studentId === st.id);
                const currentStatus = attRecord ? attRecord.status : 'hadir';

                return (
                  <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">{st.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">NISN: {st.nisn}</div>
                    </td>

                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {st.className}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {(['hadir', 'sakit', 'izin', 'alpha'] as const).map((stt) => {
                          const isSelected = currentStatus === stt;
                          return (
                            <button
                              key={stt}
                              onClick={() => handleStatusChange(st, stt)}
                              className={`rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
