import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Terminal,
  RefreshCw,
  QrCode,
  AlertTriangle,
  Copy,
  Eye,
} from 'lucide-react';
import { SecurityConfig, User, AuditLog } from '../types';
import {
  encryptAES256GCM,
  decryptAES256GCM,
  generate2FASecret,
  generateTOTPCode,
  hashSHA256,
} from '../lib/crypto';

interface SecurityProps {
  security: SecurityConfig;
  currentUser: User;
  auditLogs: AuditLog[];
  onToggle2FA: (userId: string) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const SecurityEncryptionManager: React.FC<SecurityProps> = ({
  security,
  currentUser,
  auditLogs,
  onToggle2FA,
  showToast,
}) => {
  // AES-256 Inspector State
  const [inputText, setInputText] = useState('NISN: 0061234561, WA: 081298761122 (Rahasia)');
  const [passphrase, setPassphrase] = useState('SIMPATI-KUNCI-RAHASIA-2026');
  const [cipherText, setCipherText] = useState('');
  const [iv, setIv] = useState('');
  const [decryptedOutput, setDecryptedOutput] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  // 2FA Tester State
  const [totpSecret, setTotpSecret] = useState(currentUser.twoFactorSecret || generate2FASecret());
  const [totpQrUrl, setTotpQrUrl] = useState('');
  const [userEnteredCode, setUserEnteredCode] = useState('');
  const [currentValidCode, setCurrentValidCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<'success' | 'error' | null>(null);

  // Generate 2FA QR code
  useEffect(() => {
    const otpAuthUrl = `otpauth://totp/SIMPATI:${currentUser.email}?secret=${totpSecret}&issuer=SIMPATI_Sekolah`;
    QRCode.toDataURL(otpAuthUrl, { width: 250, margin: 2 }).then((url) => {
      setTotpQrUrl(url);
    });
    // Calculate current valid code
    setCurrentValidCode(generateTOTPCode(totpSecret));
  }, [totpSecret, currentUser.email]);

  // Update TOTP code periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentValidCode(generateTOTPCode(totpSecret));
    }, 5000);
    return () => clearInterval(interval);
  }, [totpSecret]);

  const handleTestEncrypt = async () => {
    setIsEncrypting(true);
    try {
      const result = await encryptAES256GCM(inputText, passphrase);
      setCipherText(result.cipherText);
      setIv(result.iv);
      setDecryptedOutput('');
      showToast('Enkripsi AES-256-GCM Berhasil Dieksekusi!', 'success');
    } catch (err) {
      showToast('Gagal melakukan enkripsi', 'error');
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleTestDecrypt = async () => {
    if (!cipherText || !iv) {
      showToast('Lakukan enkripsi terlebih dahulu!', 'info');
      return;
    }
    try {
      const plain = await decryptAES256GCM(cipherText, iv, passphrase);
      setDecryptedOutput(plain);
      showToast('Dekripsi AES-256-GCM Berhasil!', 'success');
    } catch (err) {
      showToast('Kunci passphrase salah atau data cipher terganggu!', 'error');
    }
  };

  const handleVerify2FACode = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEnteredCode.trim() === currentValidCode) {
      setVerificationResult('success');
      showToast('Kode 2FA Valid! Autentikasi terverifikasi.', 'success');
    } else {
      setVerificationResult('error');
      showToast('Kode 2FA Tidak Cocok!', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            Enkripsi Industri AES-256-GCM & Autentikasi 2FA
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standar enkripsi simetris Web Crypto API AES-256-GCM dengan PBKDF2 Key Derivation, serta autentikasi berbasis Time-based One-Time Password (TOTP).
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>AES-256-GCM Compliant</span>
        </div>
      </div>

      {/* Security Compliance Badges Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Simetris Cipher</div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">AES-256-GCM</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Authenticating Payload</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Key Derivation</div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">PBKDF2 100k Iterations</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Salted SHA-256</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase">2FA Authenticator</div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">TOTP RFC 6238</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">30s Window Sync</div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Arsitektur Penyimpanan</div>
          <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">Zero-Trust Vault</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Client Web Crypto API</div>
        </div>
      </div>

      {/* Section 1: Interactive AES-256-GCM Vault Inspector */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Terminal className="h-5 w-5 text-sky-600" />
            1. Inspektur Vault Enkripsi AES-256-GCM Real-time
          </h3>
          <span className="text-xs text-slate-400">Web Crypto API (SubtleCrypto)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Plaintext & Passphrase */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Data Sensitif (Plain Text Input)
              </label>
              <textarea
                rows={3}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-mono text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kunci Passphrase / Secret Key
              </label>
              <input
                type="text"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleTestEncrypt}
                disabled={isEncrypting}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 py-2.5 text-xs font-bold text-white shadow-sm transition"
              >
                <Lock className="h-4 w-4" />
                <span>Eksekusi Enkripsi AES-256</span>
              </button>

              <button
                onClick={handleTestDecrypt}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 transition"
              >
                <Unlock className="h-4 w-4" />
                <span>Uji Dekripsi</span>
              </button>
            </div>
          </div>

          {/* Encryption Result Output Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-200 space-y-3 overflow-x-auto shadow-inner">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
              <span>OUTPUT CIPHERTEXT (AES-256-GCM)</span>
              <span className="text-[10px] text-emerald-400 font-bold">256-BIT ENCRYPTED</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">IV (Initialization Vector - Base64):</span>
              <span className="text-amber-400 break-all">{iv || '(Klik Eksekusi Enkripsi)'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block">Cipher Payload (Base64):</span>
              <span className="text-emerald-400 break-all">{cipherText || '(Klik Eksekusi Enkripsi)'}</span>
            </div>

            {decryptedOutput && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 text-[10px] block">Hasil Dekripsi Teks Asli:</span>
                <span className="text-sky-300 font-bold">{decryptedOutput}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2: 2FA TOTP Authenticator Config Wizard */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-emerald-600" />
            2. Autentikasi Dua Faktor (2FA / TOTP) akun {currentUser.name}
          </h3>

          <button
            onClick={() => onToggle2FA(currentUser.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              currentUser.isTwoFactorEnabled
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {currentUser.isTwoFactorEnabled ? '2FA Aktif' : 'Aktifkan 2FA Sekarang'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* QR Code Authenticator App */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Pindai QR ini di Google Authenticator / Authy:
            </p>

            {totpQrUrl ? (
              <img src={totpQrUrl} alt="2FA QR Code" className="h-44 w-44 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm" />
            ) : (
              <div className="h-44 w-44 flex items-center justify-center text-xs text-slate-400">
                Memuat QR 2FA...
              </div>
            )}

            <div className="text-[11px] font-mono text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              Secret Base32: <span className="font-bold text-slate-900 dark:text-white">{totpSecret}</span>
            </div>
          </div>

          {/* Code Tester Form */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-sky-100 dark:border-sky-900/50 bg-sky-50/60 dark:bg-sky-950/30 p-4">
              <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase">
                Kode TOTP Saat Ini (Simulasi Live Update):
              </span>
              <div className="text-3xl font-black font-mono text-sky-700 dark:text-sky-300 tracking-widest mt-1">
                {currentValidCode}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Kode ini diperbarui secara otomatis setiap 30 detik berdasarkan standar RFC 6238.
              </p>
            </div>

            <form onSubmit={handleVerify2FACode} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Uji Masukkan 6-Digit Kode 2FA
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="Masukkan 6 angka (mis. 123456)"
                  value={userEnteredCode}
                  onChange={(e) => setUserEnteredCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-base font-mono font-bold tracking-widest text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              {verificationResult === 'success' && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verifikasi 2FA Sukses! Akses Diizinkan.</span>
                </div>
              )}

              {verificationResult === 'error' && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Kode 2FA Tidak Cocok! Coba lagi.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 py-2.5 text-xs font-bold text-white shadow-sm"
              >
                Verifikasi Kode 2FA
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
