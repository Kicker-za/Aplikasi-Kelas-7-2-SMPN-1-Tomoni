import React, { useState } from 'react';
import {
  Webhook,
  Send,
  Save,
  CheckCircle2,
  Terminal,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ThirdPartyIntegration } from '../types';

interface IntegrationProps {
  integrations: ThirdPartyIntegration;
  onSave: (newInt: Partial<ThirdPartyIntegration>) => void;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export const ApiIntegrationsManager: React.FC<IntegrationProps> = ({
  integrations,
  onSave,
  showToast,
}) => {
  const [formData, setFormData] = useState<ThirdPartyIntegration>(integrations);
  const [testNumber, setTestNumber] = useState('081298761122');
  const [testMessage, setTestMessage] = useState('Halo! Ini pesan uji coba dari SIMPATI Sekolah WhatsApp Gateway API.');
  const [isTesting, setIsTesting] = useState(false);
  const [testLog, setTestLog] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    showToast('Konfigurasi API Integrasi Berhasil Disimpan!', 'success');
  };

  const handleRunApiTest = async () => {
    setIsTesting(true);
    setTestLog('Mengirim request ke ' + formData.whatsappProvider.toUpperCase() + ' API Gateway...');

    setTimeout(() => {
      setIsTesting(false);
      const mockResponse = {
        status: true,
        provider: formData.whatsappProvider,
        target: testNumber,
        message_id: 'MSG-' + Math.floor(Math.random() * 1000000),
        timestamp: new Date().toISOString(),
        delivery_status: 'SENT',
        webhook_callback_url: formData.webhookUrl,
      };
      setTestLog(JSON.stringify(mockResponse, null, 2));
      showToast('Uji Coba Pengiriman Pesan WhatsApp Berhasil!', 'success');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Webhook className="h-6 w-6 text-sky-600" />
            Integrasi API & Webhook Pihak Ketiga
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Pengaturan API Keys provider WhatsApp (Fonnte / Meta Cloud API), rahasia webhook, dan pengujian API panggilan langsung.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl">
          <Sparkles className="h-4 w-4" />
          <span>Gateway WhatsApp Aktif</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Provider Selection & Tokens */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            1. Provider WhatsApp API
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pilih Provider WhatsApp
              </label>
              <select
                value={formData.whatsappProvider}
                onChange={(e) => setFormData({ ...formData, whatsappProvider: e.target.value as 'fonnte' | 'meta' })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
              >
                <option value="fonnte">Fonnte WhatsApp API (Rekomendasi Indonesia)</option>
                <option value="meta">Meta WhatsApp Cloud API (Resmi)</option>
              </select>
            </div>

            {formData.whatsappProvider === 'fonnte' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fonnte API Token
                </label>
                <input
                  type="password"
                  value={formData.fonnteToken}
                  onChange={(e) => setFormData({ ...formData, fonnteToken: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meta Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={formData.metaPhoneId}
                    onChange={(e) => setFormData({ ...formData, metaPhoneId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Meta System User Access Token
                  </label>
                  <input
                    type="password"
                    value={formData.metaAccessToken}
                    onChange={(e) => setFormData({ ...formData, metaAccessToken: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
            2. Webhook Callback Status Pesan
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Webhook Callback Endpoint URL
              </label>
              <input
                type="text"
                value={formData.webhookUrl}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Webhook Secret Key (Signature)
              </label>
              <input
                type="password"
                value={formData.webhookSecret}
                onChange={(e) => setFormData({ ...formData, webhookSecret: e.target.value })}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Konfigurasi Integrasi</span>
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Interactive API Call Test Playground */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Terminal className="h-5 w-5 text-emerald-600" />
          3. Playground Uji Coba API Gateway
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nomor WhatsApp Tujuan Uji Coba
            </label>
            <input
              type="text"
              value={testNumber}
              onChange={(e) => setTestNumber(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Isi Pesan Uji Coba
            </label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-sky-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleRunApiTest}
          disabled={isTesting}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition disabled:opacity-50"
        >
          {isTesting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>Kirim Pesan Uji Coba API</span>
        </button>

        {testLog && (
          <div className="rounded-2xl bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
            <span className="text-[10px] text-slate-500 block mb-1">RESPON API GATEWAY LOG:</span>
            <pre>{testLog}</pre>
          </div>
        )}
      </div>
    </div>
  );
};
