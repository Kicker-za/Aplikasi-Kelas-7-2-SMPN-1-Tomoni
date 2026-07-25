import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  MessageSquareText,
  Send,
  QrCode,
  ScanLine,
  CheckCircle2,
  Phone,
  Clock,
  Sparkles,
  X,
  AlertCircle,
  Printer,
  Barcode as BarcodeIcon,
  UserCheck,
  Building,
  ArrowRight,
  ShieldCheck,
  Check,
  Search,
} from 'lucide-react';
import { Student } from '../types';

interface SmartPickupProps {
  students: Student[];
  onUpdatePickupStatus: (studentId: string, status: Student['pickupStatus'], qrToken?: string) => void;
}

// Custom SVG Barcode Component for rendering crisp barcode stripes based on NISN/value
const StudentBarcodeSvg: React.FC<{ value: string; className?: string }> = ({ value, className = "h-12 w-full" }) => {
  const bars = React.useMemo(() => {
    let pattern = "101100101"; // start guard
    for (let i = 0; i < value.length; i++) {
      const code = value.charCodeAt(i);
      const bin = (code * 17 % 255).toString(2).padStart(8, '0');
      pattern += bin;
    }
    pattern += "110100101"; // stop guard
    return pattern.split('');
  }, [value]);

  return (
    <svg className={className} viewBox={`0 0 ${bars.length * 2.5} 36`} preserveAspectRatio="none">
      <rect width="100%" height="100%" fill="transparent" />
      {bars.map((bit, idx) => (
        bit === '1' ? (
          <rect key={idx} x={idx * 2.5} y="0" width="2" height="36" fill="currentColor" />
        ) : null
      ))}
    </svg>
  );
};

export const SmartPickupNotification: React.FC<SmartPickupProps> = ({
  students,
  onUpdatePickupStatus,
}) => {
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('Kelas 7-2');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  const [scanInputToken, setScanInputToken] = useState('');
  const [lastScannedStudent, setLastScannedStudent] = useState<Student | null>(null);
  const [scanMessage, setScanMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Filter students based on class selection & search
  const class7_2_Students = students.filter(
    (s) =>
      (selectedClassFilter === 'Semua' || s.className === selectedClassFilter) &&
      (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nisn.includes(searchQuery))
  );

  // Generate QR image when student is selected for card modal
  useEffect(() => {
    if (selectedStudentForCard) {
      const canonicalToken = selectedStudentForCard.qrToken || `SIMPATI-72-${selectedStudentForCard.nisn}`;
      QRCode.toDataURL(canonicalToken, { width: 280, margin: 2 }).then((url) => {
        setQrCodeDataUrl(url);
      });
    }
  }, [selectedStudentForCard]);

  // Handle Scanning / Marking Barcode Pulang by Teacher
  const handleScanBarcodePulang = (st: Student) => {
    const token = st.qrToken || `SIMPATI-72-${st.nisn}`;
    onUpdatePickupStatus(st.id, 'sudah_pulang', token);
    setLastScannedStudent(st);

    setScanMessage({
      text: `⚡ BARCODE DIPINDAI: Siswa/i ${st.name} (${st.className}) telah dipindai (Token: ${token}). Notifikasi WhatsApp kepulangan telah berhasil dikirim ke Orang Tua (${st.parentName} - ${st.parentPhone})!`,
      type: 'success',
    });
  };

  const handleParentHeadingToSchool = (st: Student) => {
    onUpdatePickupStatus(st.id, 'menuju_sekolah');
  };

  const handleCompletePickupScan = (st: Student) => {
    onUpdatePickupStatus(st.id, 'terjemput');
  };

  // Handle manual input in Scanner Modal
  const handleScannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tokenClean = scanInputToken.trim().toLowerCase();
    const matchedStudent = students.find(
      (s) =>
        (s.qrToken && s.qrToken.toLowerCase() === tokenClean) ||
        s.nisn.toLowerCase() === tokenClean ||
        `simpati-72-${s.nisn}`.toLowerCase() === tokenClean ||
        s.name.toLowerCase().includes(tokenClean)
    );

    if (matchedStudent) {
      handleScanBarcodePulang(matchedStudent);
      setScanInputToken('');
    } else {
      setScanMessage({
        text: 'Siswa / Barcode NISN tidak ditemukan! Pastikan memasukkan NISN atau nama siswa Kelas 7-2 yang benar.',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 dark:bg-sky-950 px-3 py-1 text-xs font-bold text-sky-800 dark:text-sky-300 mb-2 border border-sky-300 dark:border-sky-800">
            <BarcodeIcon className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>Sistem Scan Kepulangan Siswa Kelas 7-2 SMPN 1 Tomoni</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ScanLine className="h-7 w-7 text-sky-600 dark:text-sky-400" />
            Scan Barcode Kepulangan & Notifikasi Orang Tua
          </h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Guru memindai barcode/QR siswa Kelas 7-2 saat jam kepulangan. Hasil pindai secara otomatis mengirimkan notifikasi WhatsApp real-time ke akun orang tua agar orang tua dapat langsung menuju sekolah untuk melakukan penjemputan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsBatchPrintOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-sm transition"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Cetak Kartu Barcode Kelas 7-2</span>
          </button>

          <button
            onClick={() => {
              setIsScannerOpen(true);
              setScanMessage(null);
            }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 px-5 py-2.5 text-xs font-bold text-white shadow-lg transition"
          >
            <ScanLine className="h-4 w-4" />
            <span>Buka Pemindai Barcode Guru</span>
          </button>
        </div>
      </div>

      {/* Last Scanned Parent Alert Box */}
      {lastScannedStudent && (
        <div className="rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 p-5 shadow-lg animate-fade-in relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
            <Send className="h-32 w-32 text-emerald-600" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md shrink-0">
                <CheckCircle2 className="h-8 w-8 animate-pulse" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-emerald-200 dark:bg-emerald-900 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-200 uppercase">
                    Notifikasi Terkirim Ke WhatsApp Ortu
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {new Date().toLocaleTimeString('id-ID')} WITA
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                  Pemberitahuan Kepulangan: {lastScannedStudent.name} ({lastScannedStudent.className})
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  Terkirim ke Orang Tua: <span className="font-bold text-slate-900 dark:text-white">{lastScannedStudent.parentName}</span> ({lastScannedStudent.parentPhone})
                </p>
              </div>
            </div>

            <button
              onClick={() => setLastScannedStudent(null)}
              className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-slate-800 transition"
            >
              Tutup Alert
            </button>
          </div>
        </div>
      )}

      {/* Class Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">Filter Kelas:</span>
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
            <button
              onClick={() => setSelectedClassFilter('Kelas 7-2')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                selectedClassFilter === 'Kelas 7-2'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Kelas 7-2 (SMPN 1 Tomoni)
            </button>
            <button
              onClick={() => setSelectedClassFilter('Semua')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                selectedClassFilter === 'Semua'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Semua Kelas
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nama Siswa / NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Student Barcode Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {class7_2_Students.map((st) => {
          const barcodeValue = st.nisn || `7200${st.id.replace(/\D/g, '')}`;

          return (
            <div
              key={st.id}
              className={`rounded-3xl border transition duration-200 bg-white dark:bg-slate-900 overflow-hidden shadow-sm flex flex-col justify-between ${
                st.pickupStatus === 'sudah_pulang'
                  ? 'border-emerald-400 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                  : st.pickupStatus === 'menuju_sekolah'
                  ? 'border-sky-400 dark:border-sky-800 ring-2 ring-sky-500/20'
                  : st.pickupStatus === 'terjemput'
                  ? 'border-slate-200 dark:border-slate-800 opacity-80'
                  : 'border-slate-200 dark:border-slate-800 hover:border-sky-300'
              }`}
            >
              {/* Card Header Info */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={st.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                      alt={st.name}
                      className="h-12 w-12 rounded-2xl object-cover ring-2 ring-sky-500/30 shrink-0"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-sm line-clamp-1">
                        {st.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        NISN: <span className="font-bold text-slate-700 dark:text-slate-300">{st.nisn}</span>
                      </p>
                      <span className="inline-block rounded-full bg-sky-100 dark:bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:text-sky-300 mt-1">
                        {st.className} • SMPN 1 Tomoni
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {st.pickupStatus === 'belum_pulang' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950 px-2.5 py-1 text-[10px] font-extrabold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Clock className="h-3 w-3" />
                        Belum Pulang
                      </span>
                    )}
                    {st.pickupStatus === 'sudah_pulang' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <Send className="h-3 w-3 animate-pulse" />
                        Sudah Pulang (WA Sent)
                      </span>
                    )}
                    {st.pickupStatus === 'menuju_sekolah' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 dark:bg-sky-950 px-2.5 py-1 text-[10px] font-extrabold text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                        <Sparkles className="h-3 w-3 animate-spin-slow" />
                        Ortu Menuju Sekolah
                      </span>
                    )}
                    {st.pickupStatus === 'terjemput' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-extrabold text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        Terjemput (Selesai)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Barcode & Parent Contact Info */}
              <div className="p-4 space-y-3">
                {/* Visual Barcode Display Box */}
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 text-center space-y-1">
                  <div className="text-slate-900 dark:text-slate-100 px-2">
                    <StudentBarcodeSvg value={barcodeValue} className="h-10 w-full text-slate-900 dark:text-slate-100" />
                  </div>
                  <p className="font-mono text-[11px] font-bold tracking-widest text-slate-700 dark:text-slate-300">
                    * {barcodeValue} *
                  </p>
                </div>

                {/* Parent Details */}
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Orang Tua / Wali:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{st.parentName}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>No. WhatsApp Ortu:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {st.parentPhone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions Footer */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-2">
                {/* Scan Barcode Button (Main Action) */}
                <button
                  onClick={() => handleScanBarcodePulang(st)}
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 text-xs font-extrabold shadow-sm transition ${
                    st.pickupStatus === 'sudah_pulang'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-sky-600 hover:bg-sky-700 text-white'
                  }`}
                >
                  <ScanLine className="h-4 w-4" />
                  <span>
                    {st.pickupStatus === 'sudah_pulang'
                      ? 'Scan Ulang Barcode Pulang'
                      : 'Scan Barcode Kepulangan (Guru)'}
                  </span>
                </button>

                {/* Secondary Actions Row */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedStudentForCard(st)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <QrCode className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    <span>Kartu ID & QR</span>
                  </button>

                  {st.pickupStatus === 'sudah_pulang' && (
                    <button
                      onClick={() => handleParentHeadingToSchool(st)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-sky-100 dark:bg-sky-950 border border-sky-300 dark:border-sky-800 py-1.5 text-xs font-bold text-sky-800 dark:text-sky-300 hover:bg-sky-200 dark:hover:bg-sky-900 transition"
                      title="Simulasi respon orang tua 'Saya Menuju Sekolah'"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                      <span>Ortu "Menuju Sekolah"</span>
                    </button>
                  )}

                  {st.pickupStatus === 'menuju_sekolah' && (
                    <button
                      onClick={() => handleCompletePickupScan(st)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-1.5 text-xs font-bold text-white transition"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Selesai Terjemput</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Individual Student Barcode & QR ID Card Modal */}
      {selectedStudentForCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarcodeIcon className="h-5 w-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Kartu Digital Barcode Siswa Kelas 7-2
                </h3>
              </div>
              <button
                onClick={() => setSelectedStudentForCard(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Printable ID Card Design */}
            <div className="rounded-3xl border-2 border-slate-300 dark:border-slate-700 bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-950 text-white p-5 space-y-4 shadow-xl relative overflow-hidden">
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    <Building className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-200">
                      SMP Negeri 1 Tomoni
                    </h4>
                    <p className="text-[9px] text-sky-300 font-medium">KARTU PRESENSI & KEPULANGAN SISWA</p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-500 text-slate-950 px-2.5 py-0.5 text-[10px] font-black uppercase">
                  {selectedStudentForCard.className}
                </span>
              </div>

              {/* Student Profile Info */}
              <div className="flex items-center gap-4">
                <img
                  src={selectedStudentForCard.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                  alt={selectedStudentForCard.name}
                  className="h-16 w-16 rounded-2xl object-cover ring-2 ring-sky-400 shrink-0"
                />
                <div>
                  <h3 className="text-base font-black text-white">{selectedStudentForCard.name}</h3>
                  <p className="text-xs text-sky-200 font-mono">NISN: {selectedStudentForCard.nisn}</p>
                  <p className="text-[11px] text-sky-300 mt-1">
                    Orang Tua: <span className="font-bold text-white">{selectedStudentForCard.parentName}</span>
                  </p>
                </div>
              </div>

              {/* QR Code & Barcode Box */}
              <div className="bg-white rounded-2xl p-4 text-slate-900 space-y-3 text-center shadow-inner">
                <div className="flex justify-center">
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="QR Code" className="h-36 w-36 object-contain" />
                  ) : (
                    <div className="h-36 w-36 flex items-center justify-center text-xs text-slate-400">
                      Memuat QR Code...
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <StudentBarcodeSvg value={selectedStudentForCard.nisn} className="h-10 w-full text-slate-900" />
                  <p className="font-mono text-xs font-bold tracking-widest text-slate-800">
                    * {selectedStudentForCard.nisn} *
                  </p>
                </div>
              </div>

              <div className="text-[10px] text-sky-200/80 text-center leading-tight">
                Scan barcode/QR diatas saat jam kepulangan untuk memberikan notifikasi penjemputan ke orang tua.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleScanBarcodePulang(selectedStudentForCard);
                  setSelectedStudentForCard(null);
                }}
                className="flex-1 rounded-xl bg-sky-600 hover:bg-sky-700 py-2.5 text-xs font-bold text-white shadow-md transition flex items-center justify-center gap-2"
              >
                <ScanLine className="h-4 w-4" />
                <span>Pindai Barcode Ini</span>
              </button>

              <button
                onClick={() => window.print()}
                className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ScanLine className="h-6 w-6 text-sky-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Pemindai Kamera Barcode Kepulangan (Guru)
                </h3>
              </div>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Viewfinder Camera Simulation */}
            <div className="relative flex flex-col items-center justify-center h-52 rounded-3xl border-2 border-dashed border-sky-500 bg-slate-950 p-4 text-center text-white overflow-hidden shadow-inner">
              <div className="absolute inset-4 border-2 border-sky-400/60 rounded-2xl pointer-events-none animate-pulse" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent animate-bounce" />

              <ScanLine className="h-12 w-12 text-sky-400 animate-pulse mb-2" />
              <p className="text-xs font-bold text-sky-200">
                Arahkan Barcode / QR Code Siswa Kelas 7-2
              </p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs">
                Kamera aktif memindai NISN siswa. Klik tombol cepat di bawah atau masukkan NISN manual.
              </p>
            </div>

            {/* Quick One-Click Scan List for Class 7-2 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Pilih Langsung Siswa Kelas 7-2 Untuk Dipindai:
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {students.filter((s) => s.className === 'Kelas 7-2').map((st) => (
                  <button
                    key={st.id}
                    onClick={() => {
                      handleScanBarcodePulang(st);
                      setIsScannerOpen(false);
                    }}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-2.5 hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-800 transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={st.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                        alt={st.name}
                        className="h-8 w-8 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{st.name}</p>
                        <p className="text-[10px] text-slate-500">NISN: {st.nisn} • Ortu: {st.parentName}</p>
                      </div>
                    </div>

                    <span className="rounded-lg bg-sky-600 text-white px-2.5 py-1 text-[10px] font-bold flex items-center gap-1">
                      <ScanLine className="h-3 w-3" />
                      <span>Pindai</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Form Entry */}
            <form onSubmit={handleScannerSubmit} className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Atau Input Manual NISN / Token Barcode:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan NISN (mis: 0061234561)..."
                    value={scanInputToken}
                    onChange={(e) => setScanInputToken(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-xs font-bold text-white transition shadow-sm"
                  >
                    Pindai NISN
                  </button>
                </div>
              </div>

              {scanMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    scanMessage.type === 'success'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}
                >
                  {scanMessage.type === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
                  )}
                  <span>{scanMessage.text}</span>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Batch Print Cards Modal */}
      {isBatchPrintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-5 my-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="h-5 w-5 text-sky-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Kartu Barcode Seluruh Siswa Kelas 7-2 SMPN 1 Tomoni
                </h3>
              </div>
              <button
                onClick={() => setIsBatchPrintOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Berikut adalah lembar kartu presensi & kepulangan barcode untuk seluruh siswa-siswi Kelas 7-2. Klik 'Cetak Sekarang' untuk mencetak ke kertas tag / ID Card.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1 p-2 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
              {students.filter((s) => s.className === 'Kelas 7-2').map((st) => (
                <div
                  key={st.id}
                  className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-2 text-slate-900 dark:text-white shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={st.studentAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                      alt={st.name}
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-bold">{st.name}</h4>
                      <p className="text-[10px] text-slate-500">NISN: {st.nisn} • Kelas 7-2</p>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-center space-y-1">
                    <StudentBarcodeSvg value={st.nisn} className="h-8 w-full text-slate-900 dark:text-slate-100" />
                    <p className="font-mono text-[10px] font-bold text-slate-600 dark:text-slate-400">* {st.nisn} *</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setIsBatchPrintOpen(false)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Tutup
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-xl bg-sky-600 hover:bg-sky-700 px-5 py-2 text-xs font-bold text-white shadow-md transition flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                <span>Cetak Lembar Barcode</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
