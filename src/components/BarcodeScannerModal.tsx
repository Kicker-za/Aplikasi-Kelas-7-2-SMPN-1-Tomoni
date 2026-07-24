import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { QrCode, X, CheckCircle2, AlertCircle, Camera, RefreshCw } from 'lucide-react';
import { Student } from '../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onScanSuccess: (student: Student) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  students,
  onScanSuccess,
  showToast,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [lastScannedStudent, setLastScannedStudent] = useState<Student | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const playBeep = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6 note
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch (e) {
      // Audio context restricted until user gesture
    }
  };

  const handleProcessCode = (codeText: string) => {
    const cleanText = codeText.trim().toLowerCase();
    if (!cleanText) return;

    // Find student by qrToken, NISN, or id
    const found = students.find((s) => {
      const tokenMatch = s.qrToken?.toLowerCase() === cleanText;
      const nisnMatch = s.nisn.toLowerCase() === cleanText;
      const simPatiMatch = `simpati-72-${s.nisn}`.toLowerCase() === cleanText;
      return tokenMatch || nisnMatch || simPatiMatch;
    });

    if (found) {
      playBeep();
      setLastScannedStudent(found);
      setScanMessage(`PRESENSI BERHASIL: ${found.name} (${found.className})`);
      onScanSuccess(found);
      setManualCode('');
    } else {
      setScanMessage(`Barcode / QR Code '${codeText}' tidak ditemukan dalam daftar siswa Kelas 7-2.`);
      showToast(`Data barcode ${codeText} tidak terdaftar di Kelas 7-2`, 'error');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e) => console.error('Error clearing scanner', e));
        scannerRef.current = null;
      }
      return;
    }

    // Initialize scanner inside modal element
    const timer = setTimeout(() => {
      const element = document.getElementById('qr-reader');
      if (element && !scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            formatsToSupport: [
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.EAN_13,
            ],
            rememberLastUsedCamera: true,
            supportedScanTypes: [0, 1], // Camera or File
          },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            handleProcessCode(decodedText);
          },
          (errorMessage) => {
            // Ignore scan attempt failure logs
          }
        );

        scannerRef.current = scanner;
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.clear().catch((e) => console.error('Error clearing scanner', e));
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Scanner Barcode HP Guru
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pindai Kartu Presensi Siswa Kelas 7-2 SMPN 1 Tomoni
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Camera / Reader Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="overflow-hidden rounded-2xl border-2 border-dashed border-emerald-500/40 bg-slate-950 p-2 text-center">
            <div id="qr-reader" className="w-full min-h-[260px] text-white"></div>
            <p className="py-2 text-[11px] font-semibold text-emerald-400 flex items-center justify-center gap-1">
              <Camera className="h-3.5 w-3.5" /> Arahkan kamera HP ke Barcode/QR Code Kartu Siswa
            </p>
          </div>

          {/* Last Scanned Result Banner */}
          {lastScannedStudent && (
            <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
                  Presensi Teratat (HADIR)
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {lastScannedStudent.name}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  NISN: {lastScannedStudent.nisn} | {lastScannedStudent.className}
                </div>
              </div>
            </div>
          )}

          {scanMessage && !lastScannedStudent && (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
              <div className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                {scanMessage}
              </div>
            </div>
          )}

          {/* Manual Barcode Input Fallback */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Input Barcode / NISN Manual (Atau Gunakan USB Scanner)
            </label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleProcessCode(manualCode);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Contoh: SIMPATI-72-0061234561 atau 0061234561"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition shadow-sm"
              >
                Absen
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-3 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500">
          <span>Otomatis memverifikasi kehadiran siswa hari ini</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-1.5 font-bold hover:bg-slate-300 transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
