import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Upload,
  Lock,
  Unlock,
  CheckCircle2,
  X,
  Search,
  ShieldAlert,
  Trash2,
  UserX,
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserManagementProps {
  users: User[];
  onAddUser: (newUser: Omit<User, 'id' | 'createdAt'>) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onToggle2FA: (userId: string) => void;
  onDeleteUser?: (userId: string) => void;
  onClearDummyUsers?: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onToggle2FA,
  onDeleteUser,
  onClearDummyUsers,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for adding user
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('guru');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery);
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>, userId?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (userId) {
          onUpdateUser(userId, { avatarUrl: base64String });
        } else {
          setAvatarUrl(base64String);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({
      name,
      email,
      role,
      phone: phone || '081234567890',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      isTwoFactorEnabled: false,
      isActive: true,
    });
    setIsModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setAvatarUrl('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-sky-600" />
            Manajemen User & Foto Profil
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Kelola pengguna, unggah foto profil, atur hak akses role, dan kelola fitur Autentikasi Dua Faktor (2FA).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onClearDummyUsers && (
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin menghapus semua user dummy?')) {
                  onClearDummyUsers();
                }
              }}
              className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 px-3.5 py-2.5 text-xs font-bold text-rose-700 dark:text-rose-300 transition"
            >
              <UserX className="h-4 w-4" />
              <span>Hapus User Dummy</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition"
          >
            <UserPlus className="h-4 w-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedRoleFilter}
          onChange={(e) => setSelectedRoleFilter(e.target.value)}
          className="w-full sm:w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
        >
          <option value="all">Semua Role User</option>
          <option value="admin">Admin</option>
          <option value="kepala_sekolah">Kepala Sekolah</option>
          <option value="wali_kelas">Wali Kelas</option>
          <option value="guru">Guru</option>
          <option value="orang_tua">Orang Tua</option>
          <option value="siswa">Siswa</option>
        </select>
      </div>

      {/* User Table Card */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Foto & Pengguna</th>
                <th className="p-4">Role Akses</th>
                <th className="p-4">Kontak (WA)</th>
                <th className="p-4">Status 2FA</th>
                <th className="p-4">Foto Profil</th>
                <th className="p-4 text-center">Aksi Hapus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  {/* Avatar & User Name */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <img
                          src={u.avatarUrl}
                          alt={u.name}
                          className="h-10 w-10 rounded-xl object-cover ring-2 ring-slate-200 dark:ring-slate-700 shadow-xs"
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="p-4">
                    <span className="inline-block rounded-full bg-sky-50 dark:bg-sky-950/60 px-2.5 py-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 capitalize border border-sky-100 dark:border-sky-900">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Contact */}
                  <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                    {u.phone}
                  </td>

                  {/* 2FA Toggle */}
                  <td className="p-4">
                    <button
                      onClick={() => onToggle2FA(u.id)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-semibold transition ${
                        u.isTwoFactorEnabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {u.isTwoFactorEnabled ? (
                        <>
                          <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>2FA Aktif</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Aktifkan 2FA</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Profile Photo Upload Button */}
                  <td className="p-4">
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                      <Upload className="h-3.5 w-3.5 text-sky-600" />
                      <span>Ubah Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleAvatarUpload(e, u.id)}
                        className="hidden"
                      />
                    </label>
                  </td>

                  {/* Delete User Action */}
                  <td className="p-4 text-center">
                    {onDeleteUser && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Hapus pengguna ${u.name}?`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        title="Hapus user ini"
                        className="inline-flex items-center justify-center p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah User Pengguna Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="mis. Bambang Susilo, S.Pd."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Akun
                </label>
                <input
                  type="email"
                  required
                  placeholder="user@simpati.sch.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Role Hak Akses
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                >
                  <option value="admin">Admin System</option>
                  <option value="kepala_sekolah">Kepala Sekolah</option>
                  <option value="wali_kelas">Wali Kelas</option>
                  <option value="guru">Guru Mata Pelajaran</option>
                  <option value="orang_tua">Orang Tua / Wali Siswa</option>
                  <option value="siswa">Siswa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Simpan User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
