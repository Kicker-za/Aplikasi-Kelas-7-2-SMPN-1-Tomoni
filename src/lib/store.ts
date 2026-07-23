import { useState, useEffect, useCallback } from 'react';
import {
  SchoolProfile,
  User,
  NotificationItem,
  SecurityConfig,
  ThirdPartyIntegration,
  Student,
  AttendanceRecord,
  FinancialRecord,
  AuditLog,
  ClassStructureMember,
  ClassActivity,
} from '../types';
import { encryptAES256GCM, generate2FASecret, hashSHA256 } from './crypto';

// BroadcastChannel for cross-tab real-time state synchronization
const BROADCAST_CHANNEL_NAME = 'SIMPATI_REALTIME_SYNC_2026';
let syncChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  syncChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
}

// Default Initial Class Structure for Kelas 7-2
const INITIAL_CLASS_STRUCTURE: ClassStructureMember[] = [
  {
    id: 'struct-1',
    role: 'Wali Kelas 7-2',
    name: 'Ibu Nurhayati, S.Pd.',
    nisnNip: 'NIP. 19820514 200801 2 015',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    phone: '081234567890',
    duties: 'Membimbing, mengawasi, dan bertanggung jawab penuh terhadap perkembangan belajar siswa Kelas 7-2.',
  },
  {
    id: 'struct-2',
    role: 'Ketua Kelas (Contoh)',
    name: 'Muhammad Rizky Wijaya (Contoh Data)',
    nisnNip: 'NISN: 0061234561',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    phone: '081298761122',
    duties: 'Memimpin organisasi kelas dan mengoordinasikan kegiatan harian (Contoh Data).',
  },
];

// Default Initial Class Activity Documentation
const INITIAL_CLASS_ACTIVITIES: ClassActivity[] = [
  {
    id: 'act-1',
    title: 'Kemah Bakti Pramuka (Contoh Dokumentasi Kelas 7-2)',
    date: '18 - 20 Juli 2026',
    category: 'Pramuka',
    location: 'Bumi Perkemahan Wotu, Luwu Timur',
    description: 'Dokumentasi contoh kegiatan siswa Kelas 7-2 SMPN 1 Tomoni (Contoh Data Kegiatan).',
    imageUrl: '/src/assets/images/doc_pramuka_1784797410043.jpg',
    photosCount: 18,
    tags: ['ContohData', 'Pramuka', 'Kelas72'],
  },
];


// Default Initial Mock Data
const INITIAL_SCHOOL_PROFILE: SchoolProfile = {
  id: 'sch-001',
  name: 'SMP Negeri 1 Tomoni (Kelas 7-2)',
  npsn: '40302811',
  address: 'Jl. Trans Sulawesi, Kec. Tomoni, Kab. Luwu Timur, Sulawesi Selatan',
  phone: '(0473) 21001',
  email: 'smpn1tomoni@sekolah.id',
  accreditation: 'A (Unggul)',
  academicYear: '2025/2026',
  semester: 'Ganjil',
  principalName: 'Drs. H. Syamsuddin, M.Pd.',
  principalNip: '19680315 199403 1 004',
  logoUrl: '/src/assets/images/logo_kelas_7_2_1784792088501.jpg',
  updatedAt: new Date().toISOString(),
  updatedBy: 'Wali Kelas 7-2',
};

const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    name: 'Wali Kelas 7-2 (SMPN 1 Tomoni)',
    email: 'walikelas72@smpn1tomoni.sch.id',
    role: 'wali_kelas',
    className: 'Kelas 7-2',
    phone: '081234567890',
    avatarUrl: '/src/assets/images/logo_kelas_7_2_1784792088501.jpg',
    isTwoFactorEnabled: true,
    twoFactorSecret: 'SIMPATI2FASECRETADMIN2026',
    isActive: true,
    createdAt: '2026-07-20',
  },
  {
    id: 'usr-ortu-1',
    name: 'Drs. Hendra Wijaya (Contoh Ortu)',
    email: 'hendra.wijaya@gmail.com',
    role: 'orang_tua',
    phone: '081298761122',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    isTwoFactorEnabled: false,
    isActive: true,
    createdAt: '2026-07-21',
    studentNisn: '0061234561',
    studentName: 'Muhammad Rizky Wijaya (Contoh Data)',
    relation: 'Ayah',
  },
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-101',
    nisn: '0061234561',
    name: 'Muhammad Rizky Wijaya (Contoh Data)',
    classId: 'cls-7-2',
    className: 'Kelas 7-2',
    gender: 'L',
    parentName: 'Drs. Hendra Wijaya (Contoh Ortu)',
    parentPhone: '081298761122',
    parentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    pickupStatus: 'belum_pulang',
    lastUpdated: new Date().toISOString(),
  },
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', studentId: 'std-101', studentName: 'Muhammad Rizky Wijaya (Contoh Data)', className: 'Kelas 7-2', date: new Date().toISOString().slice(0, 10), status: 'hadir', notes: 'Hadir tepat waktu (Contoh Data)' },
];

const INITIAL_FINANCIAL: FinancialRecord[] = [
  { id: 'fin-1', date: '2026-07-20', type: 'masuk', amount: 3500000, category: 'Kas Siswa Bulanan', description: 'Iuran kas bulanan Kelas 7-2 (Contoh Data)', recordedBy: 'Wali Kelas 7-2' },
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Notifikasi Sistem (Contoh Data)',
    message: 'Telah terhubung ke sistem SIMPATI SMPN 1 Tomoni.',
    type: 'info',
    timestamp: new Date().toLocaleTimeString('id-ID'),
    read: false,
    category: 'sistem',
  },
];

const INITIAL_SECURITY_CONFIG: SecurityConfig = {
  encryptionAlgorithm: 'AES-256-GCM',
  encryptionKeyHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  is2FAEnforced: true,
  auditLoggingEnabled: true,
  lastAuditTimestamp: new Date().toISOString(),
  encryptedVaultSample: '7GqA/490yHk+Jz2VlMbT0rQ=Base64AES256GCMEncryptedToken',
  vaultIv: 'A9b8C7d6E5f4G3h2',
};

const INITIAL_INTEGRATIONS: ThirdPartyIntegration = {
  whatsappProvider: 'fonnte',
  fonnteToken: 'FONNTE_LIVE_KEY_88921934812398',
  metaPhoneId: '109283741982',
  metaAccessToken: 'EAAG928139812391238912398123',
  webhookSecret: 'SIMPATI_WHATSAPP_WEBHOOK_SECRET_2026',
  webhookUrl: 'https://simpati.sch.id/webhooks/whatsapp/status',
  isConnected: true,
  lastTestedAt: new Date().toISOString(),
};

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'aud-1', timestamp: new Date().toISOString(), actor: 'walikelas72@smpn1tomoni.sch.id', action: 'SYSTEM_BOOT', details: 'Sistem SIMPATI Siap Digunakan (Contoh Data Log)', ipAddress: '180.252.12.98', encryptedHash: '8a91b2c3d4e5f6g7' },
];

/**
 * Custom React Hook for Managing Application State with Storage & Real-time Sync
 */
export function useSimpatiStore() {
  const [profile, setProfile] = useState<SchoolProfile>(() => {
    const saved = localStorage.getItem('simpati_school_profile');
    return saved ? JSON.parse(saved) : INITIAL_SCHOOL_PROFILE;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('simpati_v3_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('simpati_v3_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('simpati_v3_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [financials, setFinancials] = useState<FinancialRecord[]>(() => {
    const saved = localStorage.getItem('simpati_v3_financials');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('simpati_v3_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [security, setSecurity] = useState<SecurityConfig>(() => {
    const saved = localStorage.getItem('simpati_security');
    return saved ? JSON.parse(saved) : INITIAL_SECURITY_CONFIG;
  });

  const [integrations, setIntegrations] = useState<ThirdPartyIntegration>(() => {
    const saved = localStorage.getItem('simpati_integrations');
    return saved ? JSON.parse(saved) : INITIAL_INTEGRATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('simpati_v3_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [classStructure, setClassStructure] = useState<ClassStructureMember[]>(() => {
    const saved = localStorage.getItem('simpati_v3_class_structure');
    return saved ? JSON.parse(saved) : INITIAL_CLASS_STRUCTURE;
  });

  const [classActivities, setClassActivities] = useState<ClassActivity[]>(() => {
    const saved = localStorage.getItem('simpati_v3_class_activities');
    return saved ? JSON.parse(saved) : INITIAL_CLASS_ACTIVITIES;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => users[0] || INITIAL_USERS[0]);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString('id-ID'));
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);


  // Helper to show auto-dismissing toast
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Broadcast function to notify other open tabs
  const broadcastChange = useCallback((type: string, payload: any) => {
    if (syncChannel) {
      syncChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
  }, []);

  // Listen for BroadcastChannel messages from other tabs
  useEffect(() => {
    if (!syncChannel) return;

    const handleMessage = (e: MessageEvent) => {
      const { type, payload } = e.data;
      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));

      if (type === 'SYNC_PROFILE') setProfile(payload);
      if (type === 'SYNC_USERS') setUsers(payload);
      if (type === 'SYNC_STUDENTS') setStudents(payload);
      if (type === 'SYNC_ATTENDANCE') setAttendance(payload);
      if (type === 'SYNC_FINANCIALS') setFinancials(payload);
      if (type === 'SYNC_NOTIFICATIONS') setNotifications(payload);
      if (type === 'SYNC_SECURITY') setSecurity(payload);
      if (type === 'SYNC_INTEGRATIONS') setIntegrations(payload);
      if (type === 'SYNC_AUDIT') setAuditLogs(payload);
      if (type === 'SYNC_CLASS_STRUCTURE') setClassStructure(payload);
      if (type === 'SYNC_CLASS_ACTIVITIES') setClassActivities(payload);

      showToast(`⚡ Sinkronisasi Realtime: Perubahan ${type.replace('SYNC_', '').toLowerCase()} diterima dari perangkat lain.`, 'info');
    };

    syncChannel.onmessage = handleMessage;
    return () => {
      if (syncChannel) syncChannel.onmessage = null;
    };
  }, [showToast]);

  // Persist handlers & broadcast helpers
  const updateSchoolProfile = async (updated: Partial<SchoolProfile>) => {
    const newProfile = {
      ...profile,
      ...updated,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.name,
    };
    setProfile(newProfile);
    localStorage.setItem('simpati_school_profile', JSON.stringify(newProfile));
    broadcastChange('SYNC_PROFILE', newProfile);

    // Push notification & audit log
    addNotification('Profil Sekolah Diperbarui', `Data sekolah "${newProfile.name}" berhasil diperbarui secara real-time.`, 'success', 'sekolah');
    addAuditLog('UPDATE_SCHOOL_PROFILE', `Memperbarui data profil & logo sekolah (${newProfile.npsn})`);
    showToast('Data Sekolah Berhasil Diperbarui Secara Real-time!', 'success');
  };

  const addNotification = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info', category: NotificationItem['category'] = 'sistem') => {
    const newNotif: NotificationItem = {
      id: 'notif-' + Date.now(),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString('id-ID'),
      read: false,
      category,
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('simpati_v3_notifications', JSON.stringify(updated));
    broadcastChange('SYNC_NOTIFICATIONS', updated);
  };

  const markNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('simpati_v3_notifications', JSON.stringify(updated));
    broadcastChange('SYNC_NOTIFICATIONS', updated);
  };

  const addAuditLog = async (action: string, details: string) => {
    const hash = await hashSHA256(action + details + Date.now());
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
      actor: currentUser.email,
      action,
      details,
      ipAddress: '127.0.0.1',
      encryptedHash: hash.slice(0, 16),
    };
    const updated = [newLog, ...auditLogs];
    setAuditLogs(updated);
    localStorage.setItem('simpati_v3_audit_logs', JSON.stringify(updated));
    broadcastChange('SYNC_AUDIT', updated);
  };

  const updateStudentPickupStatus = (studentId: string, status: Student['pickupStatus'], qrToken?: string) => {
    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          pickupStatus: status,
          qrToken: qrToken || s.qrToken || `SIMPATI_QR_${s.name.replace(/\s+/g, '').toUpperCase()}_${Math.floor(Math.random() * 10000)}`,
          lastUpdated: new Date().toISOString(),
        };
      }
      return s;
    });
    setStudents(updatedStudents);
    localStorage.setItem('simpati_v3_students', JSON.stringify(updatedStudents));
    broadcastChange('SYNC_STUDENTS', updatedStudents);

    const targetStudent = students.find((s) => s.id === studentId);
    if (targetStudent) {
      let notifTitle = 'Status Penjemputan Diperbarui';
      let notifBody = `Siswa ${targetStudent.name} (${targetStudent.className}) memiliki status baru: ${status.replace('_', ' ').toUpperCase()}`;

      if (status === 'sudah_pulang') {
        notifTitle = `📢 PEMBERITAHUAN KEPULANGAN: ${targetStudent.name}`;
        notifBody = `Barcode kepulangan siswa atas nama ${targetStudent.name} (${targetStudent.className}) telah DIPINDAI OLEH GURU pada pukul ${timeString} WITA. Siswa telah selesai KBM dan dapat langsung dijemput oleh orang tua/wali di sekolah.`;
      } else if (status === 'menuju_sekolah') {
        notifTitle = `🚗 NOTIFIKASI PENJEMPUTAN: ${targetStudent.parentName}`;
        notifBody = `Orang tua dari ${targetStudent.name} (${targetStudent.parentName}) memberikan sinyal sedang menuju ke sekolah untuk penjemputan.`;
      } else if (status === 'terjemput') {
        notifTitle = `✅ PENJEMPUTAN SELESAI: ${targetStudent.name}`;
        notifBody = `Siswa ${targetStudent.name} telah resmi terverifikasi terjemput oleh orang tua/wali di gerbang sekolah.`;
      }

      addNotification(notifTitle, notifBody, 'success', 'pickup');
      addAuditLog('PICKUP_STATUS_CHANGE', `Scan Barcode Siswa ${targetStudent.name} status: ${status}`);

      if (status === 'sudah_pulang') {
        showToast(`✅ Barcode Dipindai! Notifikasi WhatsApp kepulangan ${targetStudent.name} dikirim ke ${targetStudent.parentName} (${targetStudent.parentPhone})!`, 'success');
      } else {
        showToast(`Status penjemputan ${targetStudent.name} diperbarui ke '${status.replace('_', ' ')}'!`, 'success');
      }
    }
  };

  const addUser = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const userObj: User = {
      ...newUser,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    const updated = [...users, userObj];
    setUsers(updated);
    localStorage.setItem('simpati_v3_users', JSON.stringify(updated));
    broadcastChange('SYNC_USERS', updated);

    addNotification('Pengguna Baru Ditambahkan', `User ${userObj.name} (${userObj.role}) telah dibuat.`, 'info', 'sekolah');
    addAuditLog('ADD_USER', `Membuat user baru ${userObj.email} dengan role ${userObj.role}`);
    showToast('Pengguna baru berhasil ditambahkan!', 'success');
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    setUsers(updated);
    localStorage.setItem('simpati_v3_users', JSON.stringify(updated));
    broadcastChange('SYNC_USERS', updated);

    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, ...updates });
    }

    addNotification('Profil User Diperbarui', `Informasi akun ${updates.name || 'user'} telah diperbarui.`, 'success', 'sekolah');
    addAuditLog('UPDATE_USER', `Memperbarui akun user ID: ${userId}`);
    showToast('Profil pengguna berhasil diperbarui!', 'success');
  };

  const deleteUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    localStorage.setItem('simpati_v3_users', JSON.stringify(updated));
    broadcastChange('SYNC_USERS', updated);

    // If current logged-in user was deleted, switch to first remaining user
    if (currentUser.id === userId && updated.length > 0) {
      setCurrentUser(updated[0]);
    }

    addNotification('User Dihapus', `Pengguna ${target.name} (${target.email}) telah dihapus dari sistem.`, 'warning', 'sekolah');
    addAuditLog('DELETE_USER', `Menghapus akun user ${target.email}`);
    showToast(`User ${target.name} berhasil dihapus!`, 'info');
  };

  const clearDummyUsers = () => {
    // Keep only the main admin/wali kelas user or first active user
    const mainUser = users.find((u) => u.role === 'admin' || u.role === 'wali_kelas') || users[0];
    const updated = mainUser ? [mainUser] : [];
    setUsers(updated);
    localStorage.setItem('simpati_v3_users', JSON.stringify(updated));
    broadcastChange('SYNC_USERS', updated);

    if (mainUser) {
      setCurrentUser(mainUser);
    }

    addNotification('User Dummy Dibersihkan', 'Seluruh data pengguna dummy berhasil dihapus dari sistem.', 'warning', 'sekolah');
    addAuditLog('CLEAR_DUMMY_USERS', 'Menghapus seluruh akun dummy user');
    showToast('Seluruh user dummy berhasil dihapus!', 'success');
  };

  const toggle2FAForUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const newStatus = !target.isTwoFactorEnabled;
    const newSecret = newStatus ? target.twoFactorSecret || generate2FASecret() : undefined;

    updateUser(userId, { isTwoFactorEnabled: newStatus, twoFactorSecret: newSecret });

    addNotification('Keamanan 2FA Diperbarui', `Autentikasi Dua Faktor (2FA) untuk ${target.name} telah ${newStatus ? 'DIAKTIFKAN' : 'DINONAKTIFKAN'}.`, newStatus ? 'success' : 'warning', 'keamanan');
    addAuditLog('TOGGLE_2FA', `Aktivasi 2FA user ${target.email}: ${newStatus}`);
    showToast(`2FA untuk ${target.name} ${newStatus ? 'berhasil diaktifkan' : 'dinonaktifkan'}.`, 'info');
  };

  const addFinancialRecord = (rec: Omit<FinancialRecord, 'id' | 'recordedBy'>) => {
    const newRec: FinancialRecord = {
      ...rec,
      id: 'fin-' + Date.now(),
      recordedBy: currentUser.name,
    };
    const updated = [newRec, ...financials];
    setFinancials(updated);
    localStorage.setItem('simpati_v3_financials', JSON.stringify(updated));
    broadcastChange('SYNC_FINANCIALS', updated);

    addNotification('Transaksi Kas Baru', `Pencatatan ${rec.type.toUpperCase()}: Rp ${rec.amount.toLocaleString('id-ID')} (${rec.category})`, 'success', 'keuangan');
    addAuditLog('ADD_FINANCIAL_RECORD', `Catat kas ${rec.type}: Rp ${rec.amount} - ${rec.category}`);
    showToast('Transaksi kas berhasil dicatat!', 'success');
  };

  const updateIntegrations = (newInt: Partial<ThirdPartyIntegration>) => {
    const updated = { ...integrations, ...newInt, lastTestedAt: new Date().toISOString() };
    setIntegrations(updated);
    localStorage.setItem('simpati_integrations', JSON.stringify(updated));
    broadcastChange('SYNC_INTEGRATIONS', updated);

    addNotification('Integrasi API Diperbarui', `Konfigurasi WhatsApp Provider & Webhook berhasil disimpan.`, 'success', 'sistem');
    addAuditLog('UPDATE_INTEGRATIONS', `Memperbarui API Keys WhatsApp (${updated.whatsappProvider})`);
    showToast('Konfigurasi API Integrasi Berhasil Disimpan!', 'success');
  };

  const updateClassStructureMember = (id: string, updates: Partial<ClassStructureMember>) => {
    const updated = classStructure.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setClassStructure(updated);
    localStorage.setItem('simpati_v3_class_structure', JSON.stringify(updated));
    broadcastChange('SYNC_CLASS_STRUCTURE', updated);

    addNotification('Struktur Kelas Diperbarui', `Jabatan/data ${updates.name || 'pengurus'} telah diperbarui.`, 'info', 'sekolah');
    addAuditLog('UPDATE_CLASS_STRUCTURE', `Memperbarui anggota struktur kelas ID: ${id}`);
    showToast('Struktur organisasi kelas berhasil diperbarui!', 'success');
  };

  const addClassStructureMember = (member: Omit<ClassStructureMember, 'id'>) => {
    const newMember: ClassStructureMember = {
      ...member,
      id: 'struct-' + Date.now(),
    };
    const updated = [...classStructure, newMember];
    setClassStructure(updated);
    localStorage.setItem('simpati_v3_class_structure', JSON.stringify(updated));
    broadcastChange('SYNC_CLASS_STRUCTURE', updated);

    addNotification('Pengurus Kelas Baru', `Menambahkan ${newMember.name} sebagai ${newMember.role}.`, 'success', 'sekolah');
    addAuditLog('ADD_CLASS_STRUCTURE', `Menambah ${newMember.name} (${newMember.role}) ke struktur kelas`);
    showToast('Pengurus baru berhasil ditambahkan!', 'success');
  };

  const deleteClassStructureMember = (id: string) => {
    const target = classStructure.find((m) => m.id === id);
    if (!target) return;
    const updated = classStructure.filter((m) => m.id !== id);
    setClassStructure(updated);
    localStorage.setItem('simpati_v3_class_structure', JSON.stringify(updated));
    broadcastChange('SYNC_CLASS_STRUCTURE', updated);

    addAuditLog('DELETE_CLASS_STRUCTURE', `Menghapus pengurus ${target.name} (${target.role})`);
    showToast(`Pengurus ${target.name} berhasil dihapus dari struktur!`, 'info');
  };

  const addClassActivity = (activity: Omit<ClassActivity, 'id'>) => {
    const newActivity: ClassActivity = {
      ...activity,
      id: 'act-' + Date.now(),
    };
    const updated = [newActivity, ...classActivities];
    setClassActivities(updated);
    localStorage.setItem('simpati_v3_class_activities', JSON.stringify(updated));
    broadcastChange('SYNC_CLASS_ACTIVITIES', updated);

    addNotification('Dokumentasi Kegiatan Baru', `Kegiatan "${newActivity.title}" telah ditambahkan ke galeri.`, 'success', 'sekolah');
    addAuditLog('ADD_CLASS_ACTIVITY', `Menambah galeri foto kegiatan: ${newActivity.title}`);
    showToast('Foto dokumentasi kegiatan berhasil diunggah!', 'success');
  };

  const deleteClassActivity = (id: string) => {
    const target = classActivities.find((a) => a.id === id);
    if (!target) return;
    const updated = classActivities.filter((a) => a.id !== id);
    setClassActivities(updated);
    localStorage.setItem('simpati_v3_class_activities', JSON.stringify(updated));
    broadcastChange('SYNC_CLASS_ACTIVITIES', updated);

    addAuditLog('DELETE_CLASS_ACTIVITY', `Menghapus kegiatan: ${target.title}`);
    showToast('Dokumentasi kegiatan berhasil dihapus.', 'info');
  };

  return {
    profile,
    updateSchoolProfile,
    users,
    currentUser,
    setCurrentUser,
    addUser,
    updateUser,
    deleteUser,
    clearDummyUsers,
    toggle2FAForUser,
    students,
    updateStudentPickupStatus,
    attendance,
    setAttendance,
    financials,
    addFinancialRecord,
    notifications,
    markNotificationsRead,
    security,
    setSecurity,
    integrations,
    updateIntegrations,
    auditLogs,
    lastSyncTime,
    toast,
    showToast,
    addAuditLog,
    classStructure,
    updateClassStructureMember,
    addClassStructureMember,
    deleteClassStructureMember,
    classActivities,
    addClassActivity,
    deleteClassActivity,
  };
}
