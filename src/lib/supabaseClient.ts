import { createClient, SupabaseClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};

export function isValidSupabaseUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.includes('your-project.supabase.co') || trimmed.includes('YOUR_SUPABASE_URL')) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

const DEFAULT_SUPABASE_URL = 'https://nijbkoijkidhlwvmkatw.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pamJrb2lqa2lkaGx3dm1rYXR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5MjEyMjgsImV4cCI6MjEwMDQ5NzIyOH0.Z63fseUsSiSyYPXEWxdTGxil6lcfuW4oJ24tIJewW_U';

export function getSupabaseCredentials() {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('simpati_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('simpati_supabase_anon_key') : null;

  const url =
    (localUrl && localUrl.trim()) ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    metaEnv.VITE_SUPABASE_URL ||
    metaEnv.SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const key =
    (localKey && localKey.trim()) ||
    (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    metaEnv.VITE_SUPABASE_ANON_KEY ||
    metaEnv.SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;

  return { url, key };
}

export function initSupabase(): { client: SupabaseClient | null; isConfigured: boolean } {
  const creds = getSupabaseCredentials();
  if (!creds.url || !creds.key || !isValidSupabaseUrl(creds.url)) {
    return { client: null, isConfigured: false };
  }
  try {
    const client = createClient(creds.url, creds.key);
    return { client, isConfigured: true };
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
    return { client: null, isConfigured: false };
  }
}

const initialInit = initSupabase();

export let isSupabaseConfigured = initialInit.isConfigured;
export let supabase: SupabaseClient | null = initialInit.client;

export function checkSupabaseConfigured() {
  return isSupabaseConfigured;
}

export function saveSupabaseCredentials(url: string, key: string): { success: boolean; message: string } {
  const cleanUrl = url.trim();
  const cleanKey = key.trim();

  if (typeof window !== 'undefined') {
    if (cleanUrl) {
      localStorage.setItem('simpati_supabase_url', cleanUrl);
    } else {
      localStorage.removeItem('simpati_supabase_url');
    }

    if (cleanKey) {
      localStorage.setItem('simpati_supabase_anon_key', cleanKey);
    } else {
      localStorage.removeItem('simpati_supabase_anon_key');
    }
  }

  const newInit = initSupabase();
  supabase = newInit.client;
  isSupabaseConfigured = newInit.isConfigured;

  if (isSupabaseConfigured && supabase) {
    return { success: true, message: 'Koneksi Supabase berhasil dikonfigurasi!' };
  } else if (cleanUrl || cleanKey) {
    return { success: false, message: 'Format URL atau Key Supabase tidak valid. Pastikan URL diawali https:// (contoh: https://xyz.supabase.co)' };
  } else {
    return { success: false, message: 'URL dan Anon Key Supabase telah dibersihkan.' };
  }
}


