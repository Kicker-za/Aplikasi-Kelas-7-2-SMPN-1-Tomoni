import React, { useState } from 'react';
import {
  X,
  User,
  UserCheck,
  UserPlus,
  Lock,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Search,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  Send,
  Baby,
  Building,
  HeartHandshake,
  QrCode,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { User as UserType, Student } from '../types';

interface ParentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  students: Student[];
  currentUser: UserType;
  onSelectUser: (user: UserType) => void;
  onAddUser: (user: Omit<UserType, 'id' | 'createdAt'>) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ParentAuthModal: React.FC<ParentAuthModalProps> = ({
  isOpen,
  onClose,
  users,
  students,
  currentUser,
  onSelectUser,
  onAddUser,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useOtp, setUseOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Register form state
  const [parentName, setParentName] = useState('');
  const [relation, setRelation] = useState<'Ayah' | 'Ibu' | 'Wali'>('Ayah');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedStudentNisn, setSelectedStudentNisn] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [agreeWa, setAgreeWa] = useState(true);

  if (!isOpen) return null;

  const parentUsers = users.filter((u) => u.role === 'orang_tua');
  const selectedStudent = students.find((s) => s.nisn === selectedStudentNisn);

  // Handle Demo Quick Login
  const handleQuickLogin = (parentUser: UserType) => {
    onSelectUser(parentUser);
    showToast(`Berhasil login sebagai ${parentUser.name} (${parentUser.relation || 'Orang Tua'})!`, 'success');
    onClose();
  };

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (useOtp && !otpSent) {
      if (!loginIdentifier) {
        showToast('Masukkan email / nomor WhatsApp / NISN anak terlebih dahulu!', 'error');
        return;
      }
      setOtpSent(true);
      showToast(`Kode OTP 6-digit dikirimkan via WhatsApp SIMPATI ke ${loginIdentifier}`, 'info');
      return;
    }

    // Search user by email, phone, name or linked NISN
    const matched = parentUsers.find(
      (u) =>
        u.email.toLowerCase() === loginIdentifier.toLowerCase() ||
        u.phone === loginIdentifier ||
        u.studentNisn === loginIdentifier ||
        u.name.toLowerCase().includes(loginIdentifier.toLowerCase())
    );

    if (matched) {
      onSelectUser(matched);
      showToast(`Selamat datang kembali, ${matched.name}!`, 'success');
      onClose();
    } else {
      // Fallback: search in general users or prompt registration
      showToast('Akun Orang Tua tidak ditemukan. Silakan daftar terlebih dahulu atau gunakan Demo Login.', 'error');
    }
  };

  // Handle Register Submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!parentName.trim()) {
      showToast('Mohon isi nama lengkap orang tua/wali!', 'error');
      return;
    }
    if (!selectedStudentNisn) {
      showToast('Pilih nama siswa/anak dari daftar Kelas 7-2!', 'error');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      showToast('Konfirmasi kata sandi tidak cocok!', 'error');
      return;
    }

    const linkedStudent = students.find((s) => s.nisn === selectedStudentNisn);

    const newParentUser: Omit<UserType, 'id' | 'createdAt'> = {
      name: parentName,
      email: email || `${parentName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      role: 'orang_tua',
      phone: phone || '081234567890',
      avatarUrl:
        relation === 'Ibu'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
      isTwoFactorEnabled: false,
      isActive: true,
      studentNisn: selectedStudentNisn,
      studentName: linkedStudent ? linkedStudent.name : 'Siswa Kelas 7-2',
      relation: relation,
    };

    onAddUser(newParentUser);

    // Auto switch to newly registered user
    setTimeout(() => {
      const createdUser = users.find((u) => u.name === parentName) || {
        ...newParentUser,
        id: 'usr-' + Date.now(),
        createdAt: new Date().toISOString(),
      };
      onSelectUser(createdUser as UserType);
      showToast(`Pendaftaran berhasil! Akun ${parentName} telah terhubung dengan ${linkedStudent?.name || 'Siswa'}.`, 'success');
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-sky-900 via-indigo-950 to-slate-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white/80 hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3 space-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-400/30 text-sky-300 shrink-0">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-2.5 py-0.5 text-[10px] font-bold text-sky-200 border border-sky-400/30">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Portal Resmi Wali Murid SMPN 1 Tomoni</span>
              </div>
              <h2 className="text-xl font-extrabold tracking-tight">
                Akses & Pendaftaran Orang Tua
              </h2>
            </div>
          </div>
          <p className="mt-2 text-xs text-sky-100 leading-relaxed">
            Pantau kehadiran, lokasi penjemputan, serta perkembangan akademik anak Anda secara terintegrasi dan real-time.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-5 flex rounded-xl bg-white/10 p-1 border border-white/10">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                activeTab === 'login'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-sky-100 hover:bg-white/5'
              }`}
            >
              <UserCheck className="h-4 w-4" />
              <span>Login Orang Tua</span>
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                activeTab === 'register'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-sky-100 hover:bg-white/5'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>
        </div>

        {/* Currently Logged In Parent Card Info */}
        {currentUser.role === 'orang_tua' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900/60 p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="h-10 w-10 rounded-xl object-cover ring-2 ring-emerald-500 shrink-0"
              />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  {currentUser.name} ({currentUser.relation || 'Wali'})
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  Terhubung dengan: <span className="font-semibold">{currentUser.studentName || 'M. Rizky Wijaya'}</span> (NISN: {currentUser.studentNisn || '0061234561'})
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500 text-white px-2.5 py-1 text-[10px] font-extrabold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Aktif</span>
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {activeTab === 'login' ? (
            <div className="space-y-5">
              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email / No. WhatsApp / NISN Anak
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 081298761122 atau 0061234561"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                {!useOtp ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Kata Sandi / PIN Orang Tua
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseOtp(true)}
                        className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        Login via OTP WhatsApp
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Kode OTP WhatsApp (Simulasi Realtime)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setUseOtp(false);
                          setOtpSent(false);
                        }}
                        className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline"
                      >
                        Gunakan Password
                      </button>
                    </div>

                    {otpSent ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Masukkan 6 angka OTP"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          className="w-full text-center tracking-widest font-mono text-base rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50/50 dark:bg-sky-950/30 py-2 font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        <p className="text-[10px] text-slate-500 text-center">
                          ⚡ OTP otomatis disimulasikan terverifikasi. Klik Masuk di bawah.
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(true);
                          showToast('Kode OTP 6-digit berhasil dikirim via WhatsApp Fonnte!', 'info');
                        }}
                        className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm transition flex items-center justify-center gap-2"
                      >
                        <Send className="h-4 w-4" />
                        <span>Kirim OTP via WhatsApp SIMPATI</span>
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 py-2.5 text-xs font-bold text-white shadow-md transition"
                >
                  Masuk ke Portal Orang Tua
                </button>
              </form>

              {/* Demo Quick Accounts Selection */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                    <span>Login Cepat Demo Orang Tua:</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Klik langsung untuk coba</span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {parentUsers.map((parent) => (
                    <button
                      key={parent.id}
                      onClick={() => handleQuickLogin(parent)}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3 text-left hover:border-sky-500 hover:bg-sky-50/50 dark:hover:bg-slate-800 transition"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={parent.avatarUrl}
                          alt={parent.name}
                          className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-300 shrink-0"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {parent.name} ({parent.relation || 'Wali'})
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            Orang Tua dari: <span className="font-semibold text-sky-600 dark:text-sky-400">{parent.studentName || 'Siswa Kelas 7-2'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                        <span>Pilih</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Register Tab */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bpk. Agus Setiawan"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Hubungan Keluarga
                  </label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Ayah">Ayah Kandung</option>
                    <option value="Ibu">Ibu Kandung</option>
                    <option value="Wali">Wali / Keluarga</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nomor WhatsApp Aktif
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="081234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="ortu@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Student Connection Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hubungkan Dengan Siswa (Kelas 7-2 SMPN 1 Tomoni)
                </label>
                <div className="relative">
                  <Baby className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <select
                    required
                    value={selectedStudentNisn}
                    onChange={(e) => setSelectedStudentNisn(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">-- Pilih Siswa / Anak Anda --</option>
                    {students.map((std) => (
                      <option key={std.id} value={std.nisn}>
                        {std.name} — (NISN: {std.nisn} | {std.className})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStudent && (
                  <div className="mt-2 flex items-center gap-3 rounded-2xl border border-sky-200 dark:border-sky-900 bg-sky-50/60 dark:bg-sky-950/40 p-2.5">
                    <img
                      src={selectedStudent.studentAvatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80'}
                      alt={selectedStudent.name}
                      className="h-9 w-9 rounded-xl object-cover shrink-0"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-900 dark:text-white">{selectedStudent.name}</p>
                      <p className="text-[10px] text-slate-500">NISN: {selectedStudent.nisn} • {selectedStudent.className}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Buat Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Konfirmasi Kata Sandi
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Agreement Checkbox */}
              <label className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={agreeWa}
                  onChange={(e) => setAgreeWa(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <span>
                  Setuju menerima notifikasi WhatsApp otomatis saat siswa tiba/pulang sekolah & status penjemputan.
                </span>
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-md transition"
              >
                Daftarkan & Hubungkan Akun Orang Tua
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
