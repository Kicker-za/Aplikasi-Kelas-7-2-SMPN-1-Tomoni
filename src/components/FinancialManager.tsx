import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, TrendingUp, DollarSign } from 'lucide-react';
import { FinancialRecord } from '../types';

interface FinancialProps {
  financials: FinancialRecord[];
  onAddRecord: (record: Omit<FinancialRecord, 'id' | 'recordedBy'>) => void;
}

export const FinancialManager: React.FC<FinancialProps> = ({ financials, onAddRecord }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState<'masuk' | 'keluar'>('masuk');
  const [amount, setAmount] = useState<number>(100000);
  const [category, setCategory] = useState('Kas Siswa Bulanan');
  const [description, setDescription] = useState('');

  const totalMasuk = financials.filter((f) => f.type === 'masuk').reduce((acc, f) => acc + f.amount, 0);
  const totalKeluar = financials.filter((f) => f.type === 'keluar').reduce((acc, f) => acc + f.amount, 0);
  const saldoKas = totalMasuk - totalKeluar;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRecord({
      date: new Date().toISOString().slice(0, 10),
      type,
      amount: Number(amount),
      category,
      description,
    });
    setIsModalOpen(false);
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-amber-500" />
            Manajemen Kas & Keuangan Kelas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pencatatan arus kas masuk & keluar, rekapitulasi iuran kas siswa, dan transparansi laporan keuangan.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Tambah Transaksi Kas</span>
        </button>
      </div>

      {/* Summary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pemasukan Kas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
            Rp {totalMasuk.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Pengeluaran Kas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-xl font-extrabold text-rose-600 dark:text-rose-400">
            Rp {totalKeluar.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Saldo Bersih Kas</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900 dark:text-white">
            Rp {saldoKas.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Riwayat Transaksi Buku Kas
          </span>
          <span className="text-xs text-slate-400">{financials.length} Transaksi Dicatat</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/20">
                <th className="p-4">Tanggal</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Deskripsi</th>
                <th className="p-4">Jenis Transaksi</th>
                <th className="p-4">Nominal (Rp)</th>
                <th className="p-4">Pencatat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {financials.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4 font-mono text-slate-600 dark:text-slate-300">{f.date}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{f.category}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">{f.description}</td>
                  <td className="p-4">
                    {f.type === 'masuk' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                        Pemasukan
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-300">
                        <ArrowDownLeft className="h-3 w-3 text-rose-500" />
                        Pengeluaran
                      </span>
                    )}
                  </td>
                  <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                    Rp {f.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="p-4 text-slate-500">{f.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Catat Transaksi Kas Baru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tipe Transaksi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('masuk')}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      type === 'masuk'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    + Pemasukan Kas
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('keluar')}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      type === 'keluar'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    - Pengeluaran Kas
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal (Rp)
                </label>
                <input
                  type="number"
                  required
                  min={1000}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="mis. Iuran Kas Bulanan / Pembelian Kebersihan"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi / Keterangan
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Keterangan singkat pengeluaran atau pemasukan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 px-4 py-2 text-xs font-bold text-white shadow-sm"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
