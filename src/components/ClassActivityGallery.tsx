import React, { useState } from 'react';
import {
  Camera,
  Calendar,
  MapPin,
  Tag,
  Plus,
  Trash2,
  X,
  Search,
  Filter,
  Image as ImageIcon,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { ClassActivity } from '../types';

interface ClassActivityGalleryProps {
  activities: ClassActivity[];
  onAddActivity: (activity: Omit<ClassActivity, 'id'>) => void;
  onDeleteActivity: (id: string) => void;
}

export const ClassActivityGallery: React.FC<ClassActivityGalleryProps> = ({
  activities,
  onAddActivity,
  onDeleteActivity,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLightbox, setActiveLightbox] = useState<ClassActivity | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for adding activity
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<ClassActivity['category']>('Pramuka');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [photosCount, setPhotosCount] = useState<number>(10);
  const [tagsInput, setTagsInput] = useState('');

  const categories = ['Semua', 'Pramuka', 'Gotong Royong', 'Olahraga & Seni', 'Akademik & Upacara', 'Lainnya'];

  const filteredActivities = activities.filter((act) => {
    const matchesCategory = selectedCategory === 'Semua' || act.category === selectedCategory;
    const matchesQuery =
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onAddActivity({
      title,
      date: date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      category,
      location: location || 'SMP Negeri 1 Tomoni',
      description,
      imageUrl,
      photosCount: Number(photosCount) || 1,
      tags: tagsArray.length > 0 ? tagsArray : ['Kelas72', 'Dokumentasi'],
    });

    setTitle('');
    setDate('');
    setCategory('Pramuka');
    setLocation('');
    setDescription('');
    setImageUrl('');
    setPhotosCount(10);
    setTagsInput('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-3xl border border-sky-100 dark:border-sky-900/50 bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/20 backdrop-blur-md border border-sky-400/30 px-3.5 py-1 text-xs font-semibold text-sky-200">
              <Camera className="h-3.5 w-3.5 text-amber-400" />
              <span>Dokumentasi Resmi Kelas 7-2 SMPN 1 Tomoni</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Galeri & Momen Kegiatan Kelas
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 max-w-2xl leading-relaxed">
              Kumpulan dokumentasi foto dan prestasi kegiatan yang diikuti siswa-siswi Kelas 7-2 dalam bidang Pramuka, Gotong Royong, Classmeeting, hingga Pentas Seni Budaya.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Foto Kegiatan</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari momen/kegiatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Gallery Grid */}
      {filteredActivities.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <ImageIcon className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Tidak ada foto kegiatan yang cocok dengan pencarian/kategori ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity) => (
            <div
              key={activity.id}
              className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-xl transition duration-300 flex flex-col justify-between"
            >
              {/* Image Container */}
              <div className="relative aspect-video overflow-hidden bg-slate-900 cursor-pointer" onClick={() => setActiveLightbox(activity)}>
                <img
                  src={activity.imageUrl}
                  alt={activity.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition" />

                {/* Top badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-sky-300 border border-sky-400/30">
                    {activity.category}
                  </span>

                  <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white border border-white/20 flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    <span>{activity.photosCount} Foto</span>
                  </span>
                </div>

                {/* Quick view icon on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <div className="rounded-2xl bg-white/20 backdrop-blur-md p-3 text-white border border-white/30 shadow-lg">
                    <Maximize2 className="h-6 w-6" />
                  </div>
                </div>

                {/* Bottom title overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-sky-200">
                    <Calendar className="h-3 w-3" />
                    <span>{activity.date}</span>
                  </div>
                </div>
              </div>

              {/* Body Info */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition">
                    {activity.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                    <span className="line-clamp-1">{activity.location}</span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {activity.description}
                  </p>
                </div>

                {/* Tags & Delete action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1 overflow-hidden">
                    {activity.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus dokumentasi "${activity.title}"?`)) {
                        onDeleteActivity(activity.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition shrink-0"
                    title="Hapus Momen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 my-8">
            <div className="relative aspect-video bg-slate-950">
              <img
                src={activeLightbox.imageUrl}
                alt={activeLightbox.title}
                className="h-full w-full object-contain"
              />
              <button
                onClick={() => setActiveLightbox(null)}
                className="absolute top-4 right-4 rounded-full bg-slate-900/80 text-white p-2 hover:bg-slate-900 backdrop-blur-md transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="rounded-full bg-sky-100 dark:bg-sky-950/80 px-3 py-1 text-xs font-extrabold text-sky-700 dark:text-sky-300">
                  {activeLightbox.category}
                </span>

                <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-sky-500" />
                    {activeLightbox.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    {activeLightbox.location}
                  </span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {activeLightbox.title}
              </h2>

              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeLightbox.description}
              </p>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {activeLightbox.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Unggah Dokumentasi Kegiatan Kelas 7-2
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
                  Judul Kegiatan / Acara
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lomba Futsal Classmeeting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Kategori Kegiatan
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  >
                    <option value="Pramuka">Pramuka</option>
                    <option value="Gotong Royong">Gotong Royong</option>
                    <option value="Olahraga & Seni">Olahraga & Seni</option>
                    <option value="Akademik & Upacara">Akademik & Upacara</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="text"
                    placeholder="20 Juli 2026"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Lokasi Pelaksanaan
                </label>
                <input
                  type="text"
                  placeholder="SMPN 1 Tomoni / Lapangan Utama"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Foto Kegiatan (Ambil dari Penyimpanan HP / Galeri)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <label className="w-full sm:w-auto inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-xs shrink-0">
                    <ImageIcon className="h-4 w-4" />
                    <span>Pilih Foto dari Galeri HP</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (reader.result) {
                              setImageUrl(reader.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">atau masukkan URL foto:</span>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
                {imageUrl && (
                  <div className="mt-2 relative h-28 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
                    <img src={imageUrl} alt="Pratinjau" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 right-2 bg-slate-900/80 text-[10px] text-emerald-400 px-2 py-0.5 rounded font-mono">
                      Foto siap diunggah
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Jumlah Foto Album
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={photosCount}
                    onChange={(e) => setPhotosCount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tagar (Pisah Komma)
                  </label>
                  <input
                    type="text"
                    placeholder="Pramuka, 72Juara, Tomoni"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Deskripsi Singkat Momen Kegiatan
                </label>
                <textarea
                  rows={3}
                  placeholder="Rincian keseruan dan pencapaian..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  className="rounded-xl bg-sky-600 hover:bg-sky-700 px-4 py-2 font-bold text-white shadow-sm"
                >
                  Unggah Momen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
