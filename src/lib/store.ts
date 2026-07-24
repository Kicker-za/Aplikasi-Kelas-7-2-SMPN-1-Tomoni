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
import { generate2FASecret, hashSHA256 } from './crypto';
import { supabase, isSupabaseConfigured } from './supabaseClient';

// BroadcastChannel fallback for offline/local cross-tab sync
const BROADCAST_CHANNEL_NAME = 'SIMPATI_REALTIME_SYNC_2026';
let syncChannel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  syncChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
}

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
    name: 'Muhammad Rizky Wijaya',
    classId: 'cls-7-2',
    className: 'Kelas 7-2',
    gender: 'L',
    parentName: 'Drs. Hendra Wijaya',
    parentPhone: '081298761122',
    parentAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    studentAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    pickupStatus: 'belum_pulang',
    qrToken: 'SIMPATI-72-0061234561',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'std-102',
    nisn: '0061234562',
    name: 'Andi Siti Nurhaliza',
    classId: 'cls-7-2',
    className: 'Kelas 7-2',
    gender: 'P',
    parentName: 'Andi Mappatunru',
    parentPhone: '082199887711',
    parentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    studentAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    pickupStatus: 'belum_pulang',
    qrToken: 'SIMPATI-72-0061234562',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'std-103',
    nisn: '0061234563',
    name: 'Ahmad Fauzi Bachtiar',
    classId: 'cls-7-2',
    className: 'Kelas 7-2',
    gender: 'L',
    parentName: 'Bachtiar Yusuf',
    parentPhone: '081344556677',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    pickupStatus: 'belum_pulang',
    qrToken: 'SIMPATI-72-0061234563',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'std-104',
    nisn: '0061234564',
    name: 'Nur Aini Sulaiman',
    classId: 'cls-7-2',
    className: 'Kelas 7-2',
    gender: 'P',
    parentName: 'Sulaiman M.',
    parentPhone: '085211223344',
    studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    pickupStatus: 'belum_pulang',
    qrToken: 'SIMPATI-72-0061234564',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'std-105',
    nisn: '0061234565',
    name: 'Dewa Putu Arisuta',
    classId: 'cls-7-2',
    className: 'Kelas 7-2',
    gender: 'L',
    parentName: 'I Wayan Suta',
    parentPhone: '081988776655',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    pickupStatus: 'belum_pulang',
    qrToken: 'SIMPATI-72-0061234565',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'std-106',
    nisn: '0061234566',
    name: 'Siti Rahma Kurniati',
    classId: 'cls-7-2',
    className: 'Kelas 7-2',
    gender: 'P',
    parentName: 'Kurniawan S.',
    parentPhone: '082344112233',
    studentAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    pickupStatus: 'belum_pulang',
    qrToken: 'SIMPATI-72-0061234566',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'std-107',
    nisn: '0061234567',
    name: 'Rahmat Hidayatullah',
    classId: 'cls-7-2',
    className: 'Kelas 7-2',
    gender: 'L',
    parentName: 'H. Syarifuddin',
    parentPhone: '081233445566',
    studentAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    pickupStatus: 'belum_pulang',
    qrToken: 'SIMPATI-72-0061234567',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'std-108',
    nisn: '0061234568',
    name: 'Putri Lestari Anggraini',
    classId: 'cls-7-2',
    className: 'Kelas 7-2',
    gender: 'P',
    parentName: 'Bambang Anggoro',
    parentPhone: '085399887766',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    pickupStatus: 'belum_pulang',
    qrToken: 'SIMPATI-72-0061234568',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'std-109',
    nisn: '0061234569',
    name: 'Kevin Sanjaya Sukamuljo',
    classId: 'cls-7-2',
    className: 'Kelas 7-2',
    gender: 'L',
    parentName: 'Sukanto',
    parentPhone: '082155443322',
    studentAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    pickupStatus: 'belum_pulang',
    qrToken: 'SIMPATI-72-0061234569',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'std-110',
    nisn: '0061234570',
    name: 'Annisa Maharani Putri',
    classId: 'cls-7-2',
    className: 'Kelas 7-2',
    gender: 'P',
    parentName: 'Ir. Heru Prasetyo',
    parentPhone: '081377665544',
    studentAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    pickupStatus: 'belum_pulang',
    qrToken: 'SIMPATI-72-0061234570',
    lastUpdated: new Date().toISOString(),
  },
];

const todayDateStr = new Date().toISOString().slice(0, 10);

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', studentId: 'std-101', studentName: 'Muhammad Rizky Wijaya', className: 'Kelas 7-2', date: todayDateStr, status: 'hadir', notes: 'Pindai Barcode (07.12 WITA)' },
  { id: 'att-2', studentId: 'std-102', studentName: 'Andi Siti Nurhaliza', className: 'Kelas 7-2', date: todayDateStr, status: 'hadir', notes: 'Pindai Barcode (07.15 WITA)' },
  { id: 'att-3', studentId: 'std-103', studentName: 'Ahmad Fauzi Bachtiar', className: 'Kelas 7-2', date: todayDateStr, status: 'hadir', notes: 'Pindai Barcode (07.18 WITA)' },
  { id: 'att-4', studentId: 'std-104', studentName: 'Nur Aini Sulaiman', className: 'Kelas 7-2', date: todayDateStr, status: 'sakit', notes: 'Surat dokter dari ortu' },
  { id: 'att-5', studentId: 'std-105', studentName: 'Dewa Putu Arisuta', className: 'Kelas 7-2', date: todayDateStr, status: 'hadir', notes: 'Pindai Barcode (07.05 WITA)' },
  { id: 'att-6', studentId: 'std-106', studentName: 'Siti Rahma Kurniati', className: 'Kelas 7-2', date: todayDateStr, status: 'hadir', notes: 'Pindai Barcode (07.22 WITA)' },
  { id: 'att-7', studentId: 'std-107', studentName: 'Rahmat Hidayatullah', className: 'Kelas 7-2', date: todayDateStr, status: 'izin', notes: 'Izin acara keluarga' },
  { id: 'att-8', studentId: 'std-108', studentName: 'Putri Lestari Anggraini', className: 'Kelas 7-2', date: todayDateStr, status: 'hadir', notes: 'Pindai Barcode (07.10 WITA)' },
  { id: 'att-9', studentId: 'std-109', studentName: 'Kevin Sanjaya Sukamuljo', className: 'Kelas 7-2', date: todayDateStr, status: 'hadir', notes: 'Pindai Barcode (07.25 WITA)' },
  { id: 'att-10', studentId: 'std-110', studentName: 'Annisa Maharani Putri', className: 'Kelas 7-2', date: todayDateStr, status: 'hadir', notes: 'Pindai Barcode (07.14 WITA)' },
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

// ==========================================
// BIDIRECTIONAL MAPPERS (snake_case <-> camelCase)
// ==========================================

function mapSchoolProfileFromDb(data: any): SchoolProfile {
  return {
    id: data.id || 'sch-001',
    name: data.name || '',
    npsn: data.npsn || '',
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    accreditation: data.accreditation || '',
    academicYear: data.academic_year || data.academicYear || '',
    semester: data.semester || '',
    principalName: data.principal_name || data.principalName || '',
    principalNip: data.principal_nip || data.principalNip || '',
    logoUrl: data.logo_url || data.logoUrl || '',
    updatedAt: data.updated_at || data.updatedAt || new Date().toISOString(),
    updatedBy: data.updated_by || data.updatedBy || '',
  };
}

function mapSchoolProfileToDb(profile: Partial<SchoolProfile>) {
  const dbObj: any = {};
  if (profile.id !== undefined) dbObj.id = profile.id;
  if (profile.name !== undefined) dbObj.name = profile.name;
  if (profile.npsn !== undefined) dbObj.npsn = profile.npsn;
  if (profile.address !== undefined) dbObj.address = profile.address;
  if (profile.phone !== undefined) dbObj.phone = profile.phone;
  if (profile.email !== undefined) dbObj.email = profile.email;
  if (profile.accreditation !== undefined) dbObj.accreditation = profile.accreditation;
  if (profile.academicYear !== undefined) dbObj.academic_year = profile.academicYear;
  if (profile.semester !== undefined) dbObj.semester = profile.semester;
  if (profile.principalName !== undefined) dbObj.principal_name = profile.principalName;
  if (profile.principalNip !== undefined) dbObj.principal_nip = profile.principalNip;
  if (profile.logoUrl !== undefined) dbObj.logo_url = profile.logoUrl;
  if (profile.updatedAt !== undefined) dbObj.updated_at = profile.updatedAt;
  if (profile.updatedBy !== undefined) dbObj.updated_by = profile.updatedBy;
  return dbObj;
}

function mapUserFromDb(data: any): User {
  return {
    id: data.id,
    name: data.name || '',
    email: data.email || '',
    role: data.role || 'siswa',
    phone: data.phone || '',
    avatarUrl: data.avatar_url || data.avatarUrl || '',
    isTwoFactorEnabled: data.is_two_factor_enabled ?? data.isTwoFactorEnabled ?? false,
    twoFactorSecret: data.two_factor_secret || data.twoFactorSecret,
    className: data.class_name || data.className,
    isActive: data.is_active ?? data.isActive ?? true,
    createdAt: data.created_at || data.createdAt || new Date().toISOString().slice(0, 10),
    studentNisn: data.student_nisn || data.studentNisn,
    studentName: data.student_name || data.studentName,
    relation: data.relation,
  };
}

function mapUserToDb(user: Partial<User>) {
  const dbObj: any = {};
  if (user.id !== undefined) dbObj.id = user.id;
  if (user.name !== undefined) dbObj.name = user.name;
  if (user.email !== undefined) dbObj.email = user.email;
  if (user.role !== undefined) dbObj.role = user.role;
  if (user.phone !== undefined) dbObj.phone = user.phone;
  if (user.avatarUrl !== undefined) dbObj.avatar_url = user.avatarUrl;
  if (user.isTwoFactorEnabled !== undefined) dbObj.is_two_factor_enabled = user.isTwoFactorEnabled;
  if (user.twoFactorSecret !== undefined) dbObj.two_factor_secret = user.twoFactorSecret;
  if (user.className !== undefined) dbObj.class_name = user.className;
  if (user.isActive !== undefined) dbObj.is_active = user.isActive;
  if (user.createdAt !== undefined) dbObj.created_at = user.createdAt;
  if (user.studentNisn !== undefined) dbObj.student_nisn = user.studentNisn;
  if (user.studentName !== undefined) dbObj.student_name = user.studentName;
  if (user.relation !== undefined) dbObj.relation = user.relation;
  return dbObj;
}

function mapStudentFromDb(data: any): Student {
  return {
    id: data.id,
    nisn: data.nisn || '',
    name: data.name || '',
    classId: data.class_id || data.classId || '',
    className: data.class_name || data.className || '',
    gender: data.gender || 'L',
    parentName: data.parent_name || data.parentName || '',
    parentPhone: data.parent_phone || data.parentPhone || '',
    parentAvatar: data.parent_avatar || data.parentAvatar,
    studentAvatar: data.student_avatar || data.studentAvatar,
    pickupStatus: data.pickup_status || data.pickupStatus || 'belum_pulang',
    qrToken: data.qr_token || data.qrToken,
    lastUpdated: data.last_updated || data.lastUpdated || new Date().toISOString(),
  };
}

function mapStudentToDb(student: Partial<Student>) {
  const dbObj: any = {};
  if (student.id !== undefined) dbObj.id = student.id;
  if (student.nisn !== undefined) dbObj.nisn = student.nisn;
  if (student.name !== undefined) dbObj.name = student.name;
  if (student.classId !== undefined) dbObj.class_id = student.classId;
  if (student.className !== undefined) dbObj.class_name = student.className;
  if (student.gender !== undefined) dbObj.gender = student.gender;
  if (student.parentName !== undefined) dbObj.parent_name = student.parentName;
  if (student.parentPhone !== undefined) dbObj.parent_phone = student.parentPhone;
  if (student.parentAvatar !== undefined) dbObj.parent_avatar = student.parentAvatar;
  if (student.studentAvatar !== undefined) dbObj.student_avatar = student.studentAvatar;
  if (student.pickupStatus !== undefined) dbObj.pickup_status = student.pickupStatus;
  if (student.qrToken !== undefined) dbObj.qr_token = student.qrToken;
  if (student.lastUpdated !== undefined) dbObj.last_updated = student.lastUpdated;
  return dbObj;
}

function mapAttendanceFromDb(data: any): AttendanceRecord {
  return {
    id: data.id,
    studentId: data.student_id || data.studentId || '',
    studentName: data.student_name || data.studentName || '',
    className: data.class_name || data.className || '',
    date: data.date || '',
    status: data.status || 'hadir',
    notes: data.notes,
  };
}

function mapAttendanceToDb(att: Partial<AttendanceRecord>) {
  const dbObj: any = {};
  if (att.id !== undefined) dbObj.id = att.id;
  if (att.studentId !== undefined) dbObj.student_id = att.studentId;
  if (att.studentName !== undefined) dbObj.student_name = att.studentName;
  if (att.className !== undefined) dbObj.class_name = att.className;
  if (att.date !== undefined) dbObj.date = att.date;
  if (att.status !== undefined) dbObj.status = att.status;
  if (att.notes !== undefined) dbObj.notes = att.notes;
  return dbObj;
}

function mapFinancialFromDb(data: any): FinancialRecord {
  return {
    id: data.id,
    date: data.date || '',
    type: data.type || 'masuk',
    amount: Number(data.amount || 0),
    category: data.category || '',
    description: data.description || '',
    recordedBy: data.recorded_by || data.recordedBy || '',
  };
}

function mapFinancialToDb(fin: Partial<FinancialRecord>) {
  const dbObj: any = {};
  if (fin.id !== undefined) dbObj.id = fin.id;
  if (fin.date !== undefined) dbObj.date = fin.date;
  if (fin.type !== undefined) dbObj.type = fin.type;
  if (fin.amount !== undefined) dbObj.amount = fin.amount;
  if (fin.category !== undefined) dbObj.category = fin.category;
  if (fin.description !== undefined) dbObj.description = fin.description;
  if (fin.recordedBy !== undefined) dbObj.recorded_by = fin.recordedBy;
  return dbObj;
}

function mapNotificationFromDb(data: any): NotificationItem {
  return {
    id: data.id,
    title: data.title || '',
    message: data.message || '',
    type: data.type || 'info',
    timestamp: data.timestamp || new Date().toLocaleTimeString('id-ID'),
    read: Boolean(data.read),
    category: data.category || 'sistem',
  };
}

function mapNotificationToDb(notif: Partial<NotificationItem>) {
  const dbObj: any = {};
  if (notif.id !== undefined) dbObj.id = notif.id;
  if (notif.title !== undefined) dbObj.title = notif.title;
  if (notif.message !== undefined) dbObj.message = notif.message;
  if (notif.type !== undefined) dbObj.type = notif.type;
  if (notif.timestamp !== undefined) dbObj.timestamp = notif.timestamp;
  if (notif.read !== undefined) dbObj.read = notif.read;
  if (notif.category !== undefined) dbObj.category = notif.category;
  return dbObj;
}

function mapSecurityFromDb(data: any): SecurityConfig {
  return {
    encryptionAlgorithm: data.encryption_algorithm || data.encryptionAlgorithm || 'AES-256-GCM',
    encryptionKeyHash: data.encryption_key_hash || data.encryptionKeyHash || '',
    is2FAEnforced: data.is_2fa_enforced ?? data.is2FAEnforced ?? true,
    auditLoggingEnabled: data.audit_logging_enabled ?? data.auditLoggingEnabled ?? true,
    lastAuditTimestamp: data.last_audit_timestamp || data.lastAuditTimestamp || new Date().toISOString(),
    encryptedVaultSample: data.encrypted_vault_sample || data.encryptedVaultSample || '',
    vaultIv: data.vault_iv || data.vaultIv || '',
  };
}

function mapSecurityToDb(sec: Partial<SecurityConfig>) {
  const dbObj: any = { id: 'config-1' };
  if (sec.encryptionAlgorithm !== undefined) dbObj.encryption_algorithm = sec.encryptionAlgorithm;
  if (sec.encryptionKeyHash !== undefined) dbObj.encryption_key_hash = sec.encryptionKeyHash;
  if (sec.is2FAEnforced !== undefined) dbObj.is_2fa_enforced = sec.is2FAEnforced;
  if (sec.auditLoggingEnabled !== undefined) dbObj.audit_logging_enabled = sec.auditLoggingEnabled;
  if (sec.lastAuditTimestamp !== undefined) dbObj.last_audit_timestamp = sec.lastAuditTimestamp;
  if (sec.encryptedVaultSample !== undefined) dbObj.encrypted_vault_sample = sec.encryptedVaultSample;
  if (sec.vaultIv !== undefined) dbObj.vault_iv = sec.vaultIv;
  return dbObj;
}

function mapIntegrationFromDb(data: any): ThirdPartyIntegration {
  return {
    whatsappProvider: data.whatsapp_provider || data.whatsappProvider || 'fonnte',
    fonnteToken: data.fonnte_token || data.fonnteToken || '',
    metaPhoneId: data.meta_phone_id || data.metaPhoneId || '',
    metaAccessToken: data.meta_access_token || data.metaAccessToken || '',
    webhookSecret: data.webhook_secret || data.webhookSecret || '',
    webhookUrl: data.webhook_url || data.webhookUrl || '',
    isConnected: data.is_connected ?? data.isConnected ?? true,
    lastTestedAt: data.last_tested_at || data.lastTestedAt,
  };
}

function mapIntegrationToDb(int: Partial<ThirdPartyIntegration>) {
  const dbObj: any = { id: 'integrations-1' };
  if (int.whatsappProvider !== undefined) dbObj.whatsapp_provider = int.whatsappProvider;
  if (int.fonnteToken !== undefined) dbObj.fonnte_token = int.fonnteToken;
  if (int.metaPhoneId !== undefined) dbObj.meta_phone_id = int.metaPhoneId;
  if (int.metaAccessToken !== undefined) dbObj.meta_access_token = int.metaAccessToken;
  if (int.webhookSecret !== undefined) dbObj.webhook_secret = int.webhookSecret;
  if (int.webhookUrl !== undefined) dbObj.webhook_url = int.webhookUrl;
  if (int.isConnected !== undefined) dbObj.is_connected = int.isConnected;
  if (int.lastTestedAt !== undefined) dbObj.last_tested_at = int.lastTestedAt;
  return dbObj;
}

function mapAuditLogFromDb(data: any): AuditLog {
  return {
    id: data.id,
    timestamp: data.timestamp || new Date().toISOString(),
    actor: data.actor || '',
    action: data.action || '',
    details: data.details || '',
    ipAddress: data.ip_address || data.ipAddress || '127.0.0.1',
    encryptedHash: data.encrypted_hash || data.encryptedHash || '',
  };
}

function mapAuditLogToDb(log: Partial<AuditLog>) {
  const dbObj: any = {};
  if (log.id !== undefined) dbObj.id = log.id;
  if (log.timestamp !== undefined) dbObj.timestamp = log.timestamp;
  if (log.actor !== undefined) dbObj.actor = log.actor;
  if (log.action !== undefined) dbObj.action = log.action;
  if (log.details !== undefined) dbObj.details = log.details;
  if (log.ipAddress !== undefined) dbObj.ip_address = log.ipAddress;
  if (log.encryptedHash !== undefined) dbObj.encrypted_hash = log.encryptedHash;
  return dbObj;
}

function mapClassStructureFromDb(data: any): ClassStructureMember {
  return {
    id: data.id,
    role: data.role || '',
    name: data.name || '',
    nisnNip: data.nisn_nip || data.nisnNip || '',
    avatarUrl: data.avatar_url || data.avatarUrl || '',
    phone: data.phone,
    duties: data.duties,
  };
}

function mapClassStructureToDb(mem: Partial<ClassStructureMember>) {
  const dbObj: any = {};
  if (mem.id !== undefined) dbObj.id = mem.id;
  if (mem.role !== undefined) dbObj.role = mem.role;
  if (mem.name !== undefined) dbObj.name = mem.name;
  if (mem.nisnNip !== undefined) dbObj.nisn_nip = mem.nisnNip;
  if (mem.avatarUrl !== undefined) dbObj.avatar_url = mem.avatarUrl;
  if (mem.phone !== undefined) dbObj.phone = mem.phone;
  if (mem.duties !== undefined) dbObj.duties = mem.duties;
  return dbObj;
}

function mapClassActivityFromDb(data: any): ClassActivity {
  return {
    id: data.id,
    title: data.title || '',
    date: data.date || '',
    category: data.category || 'Lainnya',
    description: data.description || '',
    imageUrl: data.image_url || data.imageUrl || '',
    photosCount: Number(data.photos_count || data.photosCount || 1),
    tags: Array.isArray(data.tags) ? data.tags : [],
    location: data.location || '',
  };
}

function mapClassActivityToDb(act: Partial<ClassActivity>) {
  const dbObj: any = {};
  if (act.id !== undefined) dbObj.id = act.id;
  if (act.title !== undefined) dbObj.title = act.title;
  if (act.date !== undefined) dbObj.date = act.date;
  if (act.category !== undefined) dbObj.category = act.category;
  if (act.description !== undefined) dbObj.description = act.description;
  if (act.imageUrl !== undefined) dbObj.image_url = act.imageUrl;
  if (act.photosCount !== undefined) dbObj.photos_count = act.photosCount;
  if (act.tags !== undefined) dbObj.tags = act.tags;
  if (act.location !== undefined) dbObj.location = act.location;
  return dbObj;
}

/**
 * Custom React Hook for Managing Application State with Supabase & Realtime Sync
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
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Auto-dismissing toast function
  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Cross-tab BroadcastChannel helper
  const broadcastChange = useCallback((type: string, payload: any) => {
    if (syncChannel) {
      syncChannel.postMessage({ type, payload, timestamp: Date.now() });
    }
  }, []);

  // Fetch initial data from Supabase or seed default data
  const fetchAllFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // 1. School Profile
      const { data: dbProfile, error: errProfile } = await supabase.from('school_profile').select('*');
      if (errProfile) {
        console.error('Supabase profile fetch error:', errProfile.message);
      } else if (dbProfile && dbProfile.length > 0) {
        setProfile(mapSchoolProfileFromDb(dbProfile[0]));
      } else {
        // Seed initial profile
        await supabase.from('school_profile').insert(mapSchoolProfileToDb(INITIAL_SCHOOL_PROFILE));
      }

      // 2. Users
      const { data: dbUsers, error: errUsers } = await supabase.from('users').select('*');
      if (errUsers) {
        console.error('Supabase users fetch error:', errUsers.message);
      } else if (dbUsers && dbUsers.length > 0) {
        const loadedUsers = dbUsers.map(mapUserFromDb);
        setUsers(loadedUsers);
        if (loadedUsers.length > 0) setCurrentUser(loadedUsers[0]);
      } else {
        await supabase.from('users').insert(INITIAL_USERS.map(mapUserToDb));
      }

      // 3. Students
      const { data: dbStudents, error: errStudents } = await supabase.from('students').select('*');
      if (errStudents) {
        console.error('Supabase students fetch error:', errStudents.message);
      } else if (dbStudents && dbStudents.length > 0) {
        setStudents(dbStudents.map(mapStudentFromDb));
      } else {
        await supabase.from('students').insert(INITIAL_STUDENTS.map(mapStudentToDb));
      }

      // 4. Attendance
      const { data: dbAttendance, error: errAttendance } = await supabase.from('attendance_records').select('*');
      if (errAttendance) {
        console.error('Supabase attendance fetch error:', errAttendance.message);
      } else if (dbAttendance && dbAttendance.length > 0) {
        setAttendance(dbAttendance.map(mapAttendanceFromDb));
      } else {
        await supabase.from('attendance_records').insert(INITIAL_ATTENDANCE.map(mapAttendanceToDb));
      }

      // 5. Financial Records
      const { data: dbFinancials, error: errFinancials } = await supabase.from('financial_records').select('*').order('date', { ascending: false });
      if (errFinancials) {
        console.error('Supabase financials fetch error:', errFinancials.message);
      } else if (dbFinancials && dbFinancials.length > 0) {
        setFinancials(dbFinancials.map(mapFinancialFromDb));
      } else {
        await supabase.from('financial_records').insert(INITIAL_FINANCIAL.map(mapFinancialToDb));
      }

      // 6. Notifications
      const { data: dbNotifs, error: errNotifs } = await supabase.from('notifications').select('*');
      if (errNotifs) {
        console.error('Supabase notifications fetch error:', errNotifs.message);
      } else if (dbNotifs && dbNotifs.length > 0) {
        setNotifications(dbNotifs.map(mapNotificationFromDb));
      } else {
        await supabase.from('notifications').insert(INITIAL_NOTIFICATIONS.map(mapNotificationToDb));
      }

      // 7. Security Config
      const { data: dbSecurity, error: errSecurity } = await supabase.from('security_config').select('*');
      if (errSecurity) {
        console.error('Supabase security fetch error:', errSecurity.message);
      } else if (dbSecurity && dbSecurity.length > 0) {
        setSecurity(mapSecurityFromDb(dbSecurity[0]));
      } else {
        await supabase.from('security_config').insert(mapSecurityToDb(INITIAL_SECURITY_CONFIG));
      }

      // 8. Third Party Integrations
      const { data: dbIntegrations, error: errIntegrations } = await supabase.from('third_party_integrations').select('*');
      if (errIntegrations) {
        console.error('Supabase integrations fetch error:', errIntegrations.message);
      } else if (dbIntegrations && dbIntegrations.length > 0) {
        setIntegrations(mapIntegrationFromDb(dbIntegrations[0]));
      } else {
        await supabase.from('third_party_integrations').insert(mapIntegrationToDb(INITIAL_INTEGRATIONS));
      }

      // 9. Audit Logs
      const { data: dbAudit, error: errAudit } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
      if (errAudit) {
        console.error('Supabase audit logs fetch error:', errAudit.message);
      } else if (dbAudit && dbAudit.length > 0) {
        setAuditLogs(dbAudit.map(mapAuditLogFromDb));
      } else {
        await supabase.from('audit_logs').insert(INITIAL_AUDIT_LOGS.map(mapAuditLogToDb));
      }

      // 10. Class Structure
      const { data: dbStruct, error: errStruct } = await supabase.from('class_structure_members').select('*');
      if (errStruct) {
        console.error('Supabase class structure fetch error:', errStruct.message);
      } else if (dbStruct && dbStruct.length > 0) {
        setClassStructure(dbStruct.map(mapClassStructureFromDb));
      } else {
        await supabase.from('class_structure_members').insert(INITIAL_CLASS_STRUCTURE.map(mapClassStructureToDb));
      }

      // 11. Class Activities
      const { data: dbActivities, error: errActivities } = await supabase.from('class_activities').select('*');
      if (errActivities) {
        console.error('Supabase class activities fetch error:', errActivities.message);
      } else if (dbActivities && dbActivities.length > 0) {
        setClassActivities(dbActivities.map(mapClassActivityFromDb));
      } else {
        await supabase.from('class_activities').insert(INITIAL_CLASS_ACTIVITIES.map(mapClassActivityToDb));
      }

      setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      showToast('⚡ Terkoneksi ke Database Supabase & Realtime Active!', 'success');
    } catch (err: any) {
      console.error('Gagal mengambil data dari Supabase:', err);
      showToast(`Gagal memuat data dari Supabase: ${err.message || err}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Initial Fetch & Realtime Subscription setup
  useEffect(() => {
    fetchAllFromSupabase();

    if (!isSupabaseConfigured || !supabase) return;

    // Listen for Realtime postgres_changes on all tables
    const realtimeChannel = supabase
      .channel('simpati-realtime-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'school_profile' }, (payload) => {
        if (payload.new) {
          setProfile(mapSchoolProfileFromDb(payload.new));
          setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
        const { data } = await supabase.from('users').select('*');
        if (data) setUsers(data.map(mapUserFromDb));
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, async () => {
        const { data } = await supabase.from('students').select('*');
        if (data) setStudents(data.map(mapStudentFromDb));
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_records' }, async () => {
        const { data } = await supabase.from('attendance_records').select('*');
        if (data) setAttendance(data.map(mapAttendanceFromDb));
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financial_records' }, async () => {
        const { data } = await supabase.from('financial_records').select('*').order('date', { ascending: false });
        if (data) setFinancials(data.map(mapFinancialFromDb));
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, async () => {
        const { data } = await supabase.from('notifications').select('*');
        if (data) setNotifications(data.map(mapNotificationFromDb));
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'security_config' }, (payload) => {
        if (payload.new) setSecurity(mapSecurityFromDb(payload.new));
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'third_party_integrations' }, (payload) => {
        if (payload.new) setIntegrations(mapIntegrationFromDb(payload.new));
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'audit_logs' }, async () => {
        const { data } = await supabase.from('audit_logs').select('*').order('timestamp', { ascending: false });
        if (data) setAuditLogs(data.map(mapAuditLogFromDb));
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_structure_members' }, async () => {
        const { data } = await supabase.from('class_structure_members').select('*');
        if (data) setClassStructure(data.map(mapClassStructureFromDb));
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'class_activities' }, async () => {
        const { data } = await supabase.from('class_activities').select('*');
        if (data) setClassActivities(data.map(mapClassActivityFromDb));
        setLastSyncTime(new Date().toLocaleTimeString('id-ID'));
      })
      .subscribe();

    return () => {
      if (supabase) supabase.removeChannel(realtimeChannel);
    };
  }, [fetchAllFromSupabase]);

  // BroadcastChannel fallback listener for local cross-tab sync
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

      showToast(`⚡ Sinkronisasi: Perubahan ${type.replace('SYNC_', '').toLowerCase()} diterima dari perangkat lain.`, 'info');
    };

    syncChannel.onmessage = handleMessage;
    return () => {
      if (syncChannel) syncChannel.onmessage = null;
    };
  }, [showToast]);

  // MUTATION HANDLERS

  const addNotification = async (
    title: string,
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    category: NotificationItem['category'] = 'sistem'
  ) => {
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

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('notifications').insert(mapNotificationToDb(newNotif));
      if (error) {
        console.error('Supabase insert notification error:', error.message);
        showToast(`Gagal menyimpan notifikasi ke Supabase: ${error.message}`, 'error');
      }
    }
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

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('audit_logs').insert(mapAuditLogToDb(newLog));
      if (error) {
        console.error('Supabase insert audit_log error:', error.message);
      }
    }
  };

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

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('school_profile').upsert(mapSchoolProfileToDb(newProfile));
      if (error) {
        console.error('Supabase upsert school_profile error:', error.message);
        showToast(`Gagal memperbarui profil di Supabase: ${error.message}`, 'error');
      }
    }

    addNotification('Profil Sekolah Diperbarui', `Data sekolah "${newProfile.name}" berhasil diperbarui.`, 'success', 'sekolah');
    addAuditLog('UPDATE_SCHOOL_PROFILE', `Memperbarui data profil & logo sekolah (${newProfile.npsn})`);
    showToast('Data Sekolah Berhasil Diperbarui Secara Real-time!', 'success');
  };

  const markNotificationsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('simpati_v3_notifications', JSON.stringify(updated));
    broadcastChange('SYNC_NOTIFICATIONS', updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('read', false);
      if (error) {
        console.error('Supabase update notifications error:', error.message);
      }
    }
  };

  const updateStudentPickupStatus = async (studentId: string, status: Student['pickupStatus'], qrToken?: string) => {
    const timeString = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    let updatedStudentObj: Student | null = null;

    const updatedStudents = students.map((s) => {
      if (s.id === studentId) {
        const updated = {
          ...s,
          pickupStatus: status,
          qrToken: qrToken || s.qrToken || `SIMPATI-72-${s.nisn}`,
          lastUpdated: new Date().toISOString(),
        };
        updatedStudentObj = updated;
        return updated;
      }
      return s;
    });

    setStudents(updatedStudents);
    localStorage.setItem('simpati_v3_students', JSON.stringify(updatedStudents));
    broadcastChange('SYNC_STUDENTS', updatedStudents);

    if (updatedStudentObj && isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('students').update(mapStudentToDb(updatedStudentObj)).eq('id', studentId);
      if (error) {
        console.error('Supabase update student error:', error.message);
        showToast(`Gagal memperbarui status siswa di Supabase: ${error.message}`, 'error');
      }
    }

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

  const addUser = async (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const userObj: User = {
      ...newUser,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updated = [...users, userObj];
    setUsers(updated);
    localStorage.setItem('simpati_v3_users', JSON.stringify(updated));
    broadcastChange('SYNC_USERS', updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('users').insert(mapUserToDb(userObj));
      if (error) {
        console.error('Supabase insert user error:', error.message);
        showToast(`Gagal menambahkan pengguna ke Supabase: ${error.message}`, 'error');
      }
    }

    addNotification('Pengguna Baru Ditambahkan', `User ${userObj.name} (${userObj.role}) telah dibuat.`, 'info', 'sekolah');
    addAuditLog('ADD_USER', `Membuat user baru ${userObj.email} dengan role ${userObj.role}`);
    showToast('Pengguna baru berhasil ditambahkan!', 'success');
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, ...updates } : u));
    setUsers(updated);
    localStorage.setItem('simpati_v3_users', JSON.stringify(updated));
    broadcastChange('SYNC_USERS', updated);

    if (currentUser.id === userId) {
      setCurrentUser({ ...currentUser, ...updates });
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('users').update(mapUserToDb(updates)).eq('id', userId);
      if (error) {
        console.error('Supabase update user error:', error.message);
        showToast(`Gagal memperbarui user di Supabase: ${error.message}`, 'error');
      }
    }

    addNotification('Profil User Diperbarui', `Informasi akun ${updates.name || 'user'} telah diperbarui.`, 'success', 'sekolah');
    addAuditLog('UPDATE_USER', `Memperbarui akun user ID: ${userId}`);
    showToast('Profil pengguna berhasil diperbarui!', 'success');
  };

  const deleteUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const updated = users.filter((u) => u.id !== userId);
    setUsers(updated);
    localStorage.setItem('simpati_v3_users', JSON.stringify(updated));
    broadcastChange('SYNC_USERS', updated);

    if (currentUser.id === userId && updated.length > 0) {
      setCurrentUser(updated[0]);
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('users').delete().eq('id', userId);
      if (error) {
        console.error('Supabase delete user error:', error.message);
        showToast(`Gagal menghapus user dari Supabase: ${error.message}`, 'error');
      }
    }

    addNotification('User Dihapus', `Pengguna ${target.name} (${target.email}) telah dihapus dari sistem.`, 'warning', 'sekolah');
    addAuditLog('DELETE_USER', `Menghapus akun user ${target.email}`);
    showToast(`User ${target.name} berhasil dihapus!`, 'info');
  };

  const clearDummyUsers = async () => {
    const mainUser = users.find((u) => u.role === 'admin' || u.role === 'wali_kelas') || users[0];
    const updated = mainUser ? [mainUser] : [];
    setUsers(updated);
    localStorage.setItem('simpati_v3_users', JSON.stringify(updated));
    broadcastChange('SYNC_USERS', updated);

    if (mainUser) {
      setCurrentUser(mainUser);
    }

    if (isSupabaseConfigured && supabase && mainUser) {
      const { error } = await supabase.from('users').delete().neq('id', mainUser.id);
      if (error) {
        console.error('Supabase clear users error:', error.message);
      }
    }

    addNotification('User Dummy Dibersihkan', 'Seluruh data pengguna dummy berhasil dihapus dari sistem.', 'warning', 'sekolah');
    addAuditLog('CLEAR_DUMMY_USERS', 'Menghapus seluruh akun dummy user');
    showToast('Seluruh user dummy berhasil dihapus!', 'success');
  };

  const toggle2FAForUser = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target) return;

    const newStatus = !target.isTwoFactorEnabled;
    const newSecret = newStatus ? target.twoFactorSecret || generate2FASecret() : undefined;

    await updateUser(userId, { isTwoFactorEnabled: newStatus, twoFactorSecret: newSecret });

    addNotification('Keamanan 2FA Diperbarui', `Autentikasi Dua Faktor (2FA) untuk ${target.name} telah ${newStatus ? 'DIAKTIFKAN' : 'DINONAKTIFKAN'}.`, newStatus ? 'success' : 'warning', 'keamanan');
    addAuditLog('TOGGLE_2FA', `Aktivasi 2FA user ${target.email}: ${newStatus}`);
    showToast(`2FA untuk ${target.name} ${newStatus ? 'berhasil diaktifkan' : 'dinonaktifkan'}.`, 'info');
  };

  const addFinancialRecord = async (rec: Omit<FinancialRecord, 'id' | 'recordedBy'>) => {
    const newRec: FinancialRecord = {
      ...rec,
      id: 'fin-' + Date.now(),
      recordedBy: currentUser.name,
    };

    const updated = [newRec, ...financials];
    setFinancials(updated);
    localStorage.setItem('simpati_v3_financials', JSON.stringify(updated));
    broadcastChange('SYNC_FINANCIALS', updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('financial_records').insert(mapFinancialToDb(newRec));
      if (error) {
        console.error('Supabase insert financial_record error:', error.message);
        showToast(`Gagal mencatat transaksi kas di Supabase: ${error.message}`, 'error');
      }
    }

    addNotification('Transaksi Kas Baru', `Pencatatan ${rec.type.toUpperCase()}: Rp ${rec.amount.toLocaleString('id-ID')} (${rec.category})`, 'success', 'keuangan');
    addAuditLog('ADD_FINANCIAL_RECORD', `Catat kas ${rec.type}: Rp ${rec.amount} - ${rec.category}`);
    showToast('Transaksi kas berhasil dicatat!', 'success');
  };

  const updateIntegrations = async (newInt: Partial<ThirdPartyIntegration>) => {
    const updated = { ...integrations, ...newInt, lastTestedAt: new Date().toISOString() };
    setIntegrations(updated);
    localStorage.setItem('simpati_integrations', JSON.stringify(updated));
    broadcastChange('SYNC_INTEGRATIONS', updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('third_party_integrations').upsert(mapIntegrationToDb(updated));
      if (error) {
        console.error('Supabase upsert third_party_integrations error:', error.message);
        showToast(`Gagal menyimpan integrasi di Supabase: ${error.message}`, 'error');
      }
    }

    addNotification('Integrasi API Diperbarui', `Konfigurasi WhatsApp Provider & Webhook berhasil disimpan.`, 'success', 'sistem');
    addAuditLog('UPDATE_INTEGRATIONS', `Memperbarui API Keys WhatsApp (${updated.whatsappProvider})`);
    showToast('Konfigurasi API Integrasi Berhasil Disimpan!', 'success');
  };

  const updateClassStructureMember = async (id: string, updates: Partial<ClassStructureMember>) => {
    const updated = classStructure.map((m) => (m.id === id ? { ...m, ...updates } : m));
    setClassStructure(updated);
    localStorage.setItem('simpati_v3_class_structure', JSON.stringify(updated));
    broadcastChange('SYNC_CLASS_STRUCTURE', updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('class_structure_members').update(mapClassStructureToDb(updates)).eq('id', id);
      if (error) {
        console.error('Supabase update class_structure_members error:', error.message);
        showToast(`Gagal memperbarui struktur kelas di Supabase: ${error.message}`, 'error');
      }
    }

    addNotification('Struktur Kelas Diperbarui', `Jabatan/data ${updates.name || 'pengurus'} telah diperbarui.`, 'info', 'sekolah');
    addAuditLog('UPDATE_CLASS_STRUCTURE', `Memperbarui anggota struktur kelas ID: ${id}`);
    showToast('Struktur organisasi kelas berhasil diperbarui!', 'success');
  };

  const addClassStructureMember = async (member: Omit<ClassStructureMember, 'id'>) => {
    const newMember: ClassStructureMember = {
      ...member,
      id: 'struct-' + Date.now(),
    };

    const updated = [...classStructure, newMember];
    setClassStructure(updated);
    localStorage.setItem('simpati_v3_class_structure', JSON.stringify(updated));
    broadcastChange('SYNC_CLASS_STRUCTURE', updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('class_structure_members').insert(mapClassStructureToDb(newMember));
      if (error) {
        console.error('Supabase insert class_structure_members error:', error.message);
        showToast(`Gagal menambahkan pengurus di Supabase: ${error.message}`, 'error');
      }
    }

    addNotification('Pengurus Kelas Baru', `Menambahkan ${newMember.name} sebagai ${newMember.role}.`, 'success', 'sekolah');
    addAuditLog('ADD_CLASS_STRUCTURE', `Menambah ${newMember.name} (${newMember.role}) ke struktur kelas`);
    showToast('Pengurus baru berhasil ditambahkan!', 'success');
  };

  const deleteClassStructureMember = async (id: string) => {
    const target = classStructure.find((m) => m.id === id);
    if (!target) return;

    const updated = classStructure.filter((m) => m.id !== id);
    setClassStructure(updated);
    localStorage.setItem('simpati_v3_class_structure', JSON.stringify(updated));
    broadcastChange('SYNC_CLASS_STRUCTURE', updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('class_structure_members').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete class_structure_members error:', error.message);
        showToast(`Gagal menghapus pengurus dari Supabase: ${error.message}`, 'error');
      }
    }

    addAuditLog('DELETE_CLASS_STRUCTURE', `Menghapus pengurus ${target.name} (${target.role})`);
    showToast(`Pengurus ${target.name} berhasil dihapus dari struktur!`, 'info');
  };

  const addClassActivity = async (activity: Omit<ClassActivity, 'id'>) => {
    const newActivity: ClassActivity = {
      ...activity,
      id: 'act-' + Date.now(),
    };

    const updated = [newActivity, ...classActivities];
    setClassActivities(updated);
    localStorage.setItem('simpati_v3_class_activities', JSON.stringify(updated));
    broadcastChange('SYNC_CLASS_ACTIVITIES', updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('class_activities').insert(mapClassActivityToDb(newActivity));
      if (error) {
        console.error('Supabase insert class_activities error:', error.message);
        showToast(`Gagal mengunggah kegiatan ke Supabase: ${error.message}`, 'error');
      }
    }

    addNotification('Dokumentasi Kegiatan Baru', `Kegiatan "${newActivity.title}" telah ditambahkan ke galeri.`, 'success', 'sekolah');
    addAuditLog('ADD_CLASS_ACTIVITY', `Menambah galeri foto kegiatan: ${newActivity.title}`);
    showToast('Foto dokumentasi kegiatan berhasil diunggah!', 'success');
  };

  const deleteClassActivity = async (id: string) => {
    const target = classActivities.find((a) => a.id === id);
    if (!target) return;

    const updated = classActivities.filter((a) => a.id !== id);
    setClassActivities(updated);
    localStorage.setItem('simpati_v3_class_activities', JSON.stringify(updated));
    broadcastChange('SYNC_CLASS_ACTIVITIES', updated);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('class_activities').delete().eq('id', id);
      if (error) {
        console.error('Supabase delete class_activities error:', error.message);
        showToast(`Gagal menghapus kegiatan dari Supabase: ${error.message}`, 'error');
      }
    }

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
    isLoading,
  };
}
