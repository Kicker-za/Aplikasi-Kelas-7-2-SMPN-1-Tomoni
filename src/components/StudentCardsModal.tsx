import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Download, QrCode, Search, School } from 'lucide-react';
import { Student, SchoolProfile } from '../types';
import { exportStudentQRCardsPDF } from '../lib/pdf';

interface StudentCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  profile: SchoolProfile;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const StudentCardsModal: React.FC<StudentCardsModalProps> = ({
  isOpen,
  onClose,
  students,
  profile,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [qrMap, setQrMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    const generateQRs = async () => {
      const map: Record<string, string> = {};
      for (const st of students) {
        const code = st.qrToken || `SIMPATI-72-${st.nisn}`;
        try {
          const url = await QRCode.toDataURL(code, { margin: 1, width: 140 });
          map[st.id] = url;
        } catch (e) {
          console.error(e);
        }
      }
      setQrMap(map);
    };
    generateQRs();
  }, [isOpen, students]);

  if (!isOpen) return null;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nisn.includes(searchQuery)
  );

  const handleExportPDF = async () => {
    try {
      showToast('Memproses cetak kartu presensi siswa...', 'info');
      await exportStudentQRCardsPDF(profile, students);
      showToast('Kartu Presensi Siswa Kelas 7-2 berhasil diunduh (PDF)!', 'success');
    } catch (e) {
      showToast('Gagal mengunduh kartu presensi', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Kartu Presensi Barcode Siswa Kelas 7-2
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SMP Negeri 1 Tomoni - Siap Dicetak & Bagikan Ke Siswa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
            >
              <Download className="h-4 w-4" />
              Cetak Kartu Siswa (PDF)
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Search */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa atau NISN Kelas 7-2..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <span className="text-xs font-semibold text-slate-500">
            Total: {filteredStudents.length} Kartu
          </span>
        </div>

        {/* Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((st) => {
            const qrCodeUrl = qrMap[st.id];
            const tokenCode = st.qrToken || `SIMPATI-72-${st.nisn}`;

            return (
              <div
                key={st.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* Header Bar of Card */}
                <div className="bg-slate-900 px-4 py-3 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      KARTU PRESENSI SISWA
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-300">
                    SMPN 1 TOMONI
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                      {st.name}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 font-mono">
                      NISN: {st.nisn}
                    </div>
                    <div className="inline-block rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                      {st.className} | {st.gender === 'L' ? 'Laki-Laki' : 'Perempuan'}
                    </div>
                    <div className="text-[10px] text-slate-400 pt-1">
                      Wali Kelas: Ibu Nurhayati, S.Pd.
                    </div>
                  </div>

                  {/* QR Image */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shrink-0">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="QR Siswa" className="h-20 w-20" />
                    ) : (
                      <div className="h-20 w-20 bg-slate-200 rounded-lg animate-pulse" />
                    )}
                    <span className="text-[9px] font-mono font-bold text-slate-600 dark:text-slate-400 mt-1">
                      {tokenCode}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500">
          <span>Barcode dapat dipindai langsung dengan kamera HP guru</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-1.5 font-bold hover:bg-slate-300 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
