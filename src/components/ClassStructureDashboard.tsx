import React, { useState } from 'react';
import {
  Users,
  Award,
  Crown,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  X,
  Phone,
  Sparkles,
  Printer,
  ShieldCheck,
  UserCheck,
  Building,
} from 'lucide-react';
import { ClassStructureMember } from '../types';

interface ClassStructureDashboardProps {
  structure: ClassStructureMember[];
  onUpdateMember: (id: string, updates: Partial<ClassStructureMember>) => void;
  onAddMember: (member: Omit<ClassStructureMember, 'id'>) => void;
  onDeleteMember: (id: string) => void;
}

export const ClassStructureDashboard: React.FC<ClassStructureDashboardProps> = ({
  structure,
  onUpdateMember,
  onAddMember,
  onDeleteMember,
}) => {
  const [selectedMember, setSelectedMember] = useState<ClassStructureMember | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for Add / Edit
  const [role, setRole] = useState('');
  const [name, setName] = useState('');
  const [nisnNip, setNisnNip] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [duties, setDuties] = useState('');

  const openEditModal = (member: ClassStructureMember) => {
    setSelectedMember(member);
    setRole(member.role);
    setName(member.name);
    setNisnNip(member.nisnNip);
    setAvatarUrl(member.avatarUrl);
    setPhone(member.phone || '');
    setDuties(member.duties || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    onUpdateMember(selectedMember.id, {
      role,
      name,
      nisnNip,
      avatarUrl,
      phone,
      duties,
    });
    setIsEditModalOpen(false);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !name) return;
    onAddMember({
      role,
      name,
      nisnNip: nisnNip || 'NISN: -',
      avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      phone,
      duties,
    });
    setRole('');
    setName('');
    setNisnNip('');
    setAvatarUrl('');
    setPhone('');
    setDuties('');
    setIsAddModalOpen(false);
  };

  const waliKelas = structure.find((m) => m.role.toLowerCase().includes('wali kelas')) || structure[0];
  const ketuaKelas = structure.find((m) => m.role.toLowerCase().includes('ketua kelas') && !m.role.toLowerCase().includes('wakil'));
  const wakilKetua = structure.find((m) => m.role.toLowerCase().includes('wakil ketua'));

  const sekretaris = structure.filter((m) => m.role.toLowerCase().includes('sekretaris'));
  const bendahara = structure.filter((m) => m.role.toLowerCase().includes('bendahara'));
  const seksiSeksi = structure.filter(
    (m) =>
      !m.role.toLowerCase().includes('wali kelas') &&
      !m.role.toLowerCase().includes('ketua kelas') &&
      !m.role.toLowerCase().includes('wakil') &&
      !m.role.toLowerCase().includes('sekretaris') &&
      !m.role.toLowerCase().includes('bendahara')
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-900 via-slate-900 to-sky-950 p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 backdrop-blur-md border border-indigo-400/30 px-3.5 py-1 text-xs font-semibold text-indigo-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>SMP Negeri 1 Tomoni — Tahun Ajaran 2025/2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Struktur Organisasi Kelas 7-2
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl leading-relaxed">
              Bagan kepengurusan resmi Kelas 7-2 SMPN 1 Tomoni. Menjungjung tinggi kedisiplinan, kebersamaan, dan kepemimpinan berkarakter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-4 py-2.5 text-xs font-bold transition"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Bagan</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Jabatan/Seksi</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Tier: Wali Kelas */}
      {waliKelas && (
        <div className="flex justify-center">
          <div className="w-full max-w-md rounded-3xl border-2 border-amber-400/80 dark:border-amber-500/50 bg-gradient-to-b from-amber-50/50 to-white dark:from-slate-900 dark:to-slate-950 p-6 shadow-md hover:shadow-lg transition relative group">
            <div className="absolute top-4 right-4 flex items-center gap-1.5">
              <span className="rounded-full bg-amber-500 text-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Crown className="h-3 w-3" />
                <span>Pembimbing Utama</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <img
                src={waliKelas.avatarUrl}
                alt={waliKelas.name}
                className="h-20 w-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md shrink-0"
              />
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                  {waliKelas.role}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {waliKelas.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{waliKelas.nisnNip}</p>
                {waliKelas.phone && (
                  <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center justify-center sm:justify-start gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{waliKelas.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {waliKelas.duties && (
              <p className="mt-4 pt-3 border-t border-amber-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "{waliKelas.duties}"
              </p>
            )}

            <button
              onClick={() => openEditModal(waliKelas)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Data Wali Kelas</span>
            </button>
          </div>
        </div>
      )}

      {/* Connecting Vertical Line */}
      <div className="flex justify-center -my-2">
        <div className="h-6 w-1 bg-indigo-500/40 dark:bg-indigo-500/30 rounded-full" />
      </div>

      {/* Tier 2: Ketua & Wakil Ketua Kelas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {[ketuaKelas, wakilKetua].filter(Boolean).map((member) => (
          <div
            key={member!.id}
            className="rounded-3xl border border-indigo-200 dark:border-indigo-900/60 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-indigo-500 transition relative group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <img
                  src={member!.avatarUrl}
                  alt={member!.name}
                  className="h-14 w-14 rounded-2xl object-cover border border-indigo-200 dark:border-slate-700 shadow-sm shrink-0"
                />
                <div>
                  <span className="inline-block rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 text-[10px] font-bold">
                    {member!.role}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {member!.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{member!.nisnNip}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(member!)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 transition"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Hapus ${member!.name} dari struktur?`)) {
                      onDeleteMember(member!.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  title="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {member!.duties && (
              <p className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {member!.duties}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Tier 3: Sekretaris & Bendahara */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-center">
          Tim Administrasi & Keuangan Kelas
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...sekretaris, ...bendahara].map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-sky-500 transition relative flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="h-11 w-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div>
                    <span className="inline-block rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-2 py-0.5 text-[10px] font-bold">
                      {member.role}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">
                      {member.name}
                    </h5>
                    <p className="text-[10px] text-slate-500">{member.nisnNip}</p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-1 text-slate-400 hover:text-sky-600 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus ${member.name}?`)) {
                        onDeleteMember(member.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {member.duties && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight">
                  {member.duties}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tier 4: Seksi-Seksi */}
      <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Seksi-Seksi Kedisiplinan & Minat Bakat
          </h3>
          <span className="text-xs text-slate-500">{seksiSeksi.length} Divisi Seksi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {seksiSeksi.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-emerald-500 transition space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="h-10 w-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  />
                  <div>
                    <span className="inline-block rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                      {member.role}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                      {member.name}
                    </h5>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-1 text-slate-400 hover:text-emerald-600 transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus ${member.name}?`)) {
                        onDeleteMember(member.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {member.duties && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  {member.duties}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Edit Member */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Data Pengurus Kelas
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Jabatan / Posisi
                </label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  NISN / NIP / Keterangan
                </label>
                <input
                  type="text"
                  value={nisnNip}
                  onChange={(e) => setNisnNip(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  URL Foto Profil
                </label>
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Rincian Tugas & Tanggung Jawab
                </label>
                <textarea
                  rows={3}
                  value={duties}
                  onChange={(e) => setDuties(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 font-bold text-white shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Member */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Jabatan Pengurus Baru
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Jabatan / Posisi (misal: Seksi Olahraga, Humas, dll)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Seksi Keamanan"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Nama Siswa / Pengurus
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Siswa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  NISN / NIP
                </label>
                <input
                  type="text"
                  placeholder="NISN: 0061234567"
                  value={nisnNip}
                  onChange={(e) => setNisnNip(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  URL Foto Profil
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Tugas & Tanggung Jawab
                </label>
                <textarea
                  rows={2}
                  placeholder="Tugas pokok jabatan..."
                  value={duties}
                  onChange={(e) => setDuties(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 font-bold text-white shadow-sm"
                >
                  Tambah Pengurus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
