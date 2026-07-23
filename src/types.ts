export type UserRole = 'admin' | 'kepala_sekolah' | 'wali_kelas' | 'guru' | 'orang_tua' | 'siswa';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatarUrl: string;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  className?: string;
  isActive: boolean;
  createdAt: string;
  studentNisn?: string;
  studentName?: string;
  relation?: 'Ayah' | 'Ibu' | 'Wali';
}

export interface SchoolProfile {
  id: string;
  name: string;
  npsn: string;
  address: string;
  phone: string;
  email: string;
  accreditation: string;
  academicYear: string;
  semester: string;
  principalName: string;
  principalNip: string;
  logoUrl: string;
  updatedAt: string;
  updatedBy: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  category: 'sekolah' | 'sistem' | 'keamanan' | 'pickup' | 'keuangan';
}

export interface SecurityConfig {
  encryptionAlgorithm: 'AES-256-GCM';
  encryptionKeyHash: string;
  is2FAEnforced: boolean;
  auditLoggingEnabled: boolean;
  lastAuditTimestamp: string;
  encryptedVaultSample: string;
  vaultIv: string;
}

export interface ThirdPartyIntegration {
  whatsappProvider: 'fonnte' | 'meta';
  fonnteToken: string;
  metaPhoneId: string;
  metaAccessToken: string;
  webhookSecret: string;
  webhookUrl: string;
  isConnected: boolean;
  lastTestedAt?: string;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  classId: string;
  className: string;
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string;
  parentAvatar?: string;
  studentAvatar?: string;
  pickupStatus: 'belum_pulang' | 'sudah_pulang' | 'menuju_sekolah' | 'terjemput';
  qrToken?: string;
  lastUpdated: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpha';
  notes?: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'masuk' | 'keluar';
  amount: number;
  category: string;
  description: string;
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ipAddress: string;
  encryptedHash: string;
}

export interface ClassStructureMember {
  id: string;
  role: string;
  name: string;
  nisnNip: string;
  avatarUrl: string;
  phone?: string;
  duties?: string;
}

export interface ClassActivity {
  id: string;
  title: string;
  date: string;
  category: 'Pramuka' | 'Gotong Royong' | 'Olahraga & Seni' | 'Akademik & Upacara' | 'Lainnya';
  description: string;
  imageUrl: string;
  photosCount: number;
  tags: string[];
  location: string;
}

