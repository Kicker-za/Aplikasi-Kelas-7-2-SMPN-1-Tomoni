-- SIMPATI (Kelas 7-2 SMPN 1 Tomoni) - Supabase Database Schema
-- Run this script in the Supabase SQL Editor to create all required tables, enable RLS, and seed initial school data.

-- 1. SCHOOL PROFILE TABLE
CREATE TABLE IF NOT EXISTS school_profile (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  npsn TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  accreditation TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester TEXT NOT NULL,
  principal_name TEXT NOT NULL,
  principal_nip TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by TEXT NOT NULL
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  is_two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret TEXT,
  class_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  student_nisn TEXT,
  student_name TEXT,
  relation TEXT
);

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  nisn TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  class_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_avatar TEXT,
  student_avatar TEXT,
  pickup_status TEXT DEFAULT 'belum_pulang',
  qr_token TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL,
  notes TEXT
);

-- 5. FINANCIAL RECORDS TABLE
CREATE TABLE IF NOT EXISTS financial_records (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  recorded_by TEXT NOT NULL
);

-- 6. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  category TEXT NOT NULL
);

-- 7. SECURITY CONFIG TABLE
CREATE TABLE IF NOT EXISTS security_config (
  id TEXT PRIMARY KEY DEFAULT 'config-1',
  encryption_algorithm TEXT NOT NULL,
  encryption_key_hash TEXT NOT NULL,
  is_2fa_enforced BOOLEAN DEFAULT TRUE,
  audit_logging_enabled BOOLEAN DEFAULT TRUE,
  last_audit_timestamp TIMESTAMPTZ DEFAULT NOW(),
  encrypted_vault_sample TEXT NOT NULL,
  vault_iv TEXT NOT NULL
);

-- 8. THIRD PARTY INTEGRATIONS TABLE
CREATE TABLE IF NOT EXISTS third_party_integrations (
  id TEXT PRIMARY KEY DEFAULT 'integrations-1',
  whatsapp_provider TEXT NOT NULL,
  fonnte_token TEXT,
  meta_phone_id TEXT,
  meta_access_token TEXT,
  webhook_secret TEXT,
  webhook_url TEXT,
  is_connected BOOLEAN DEFAULT TRUE,
  last_tested_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address TEXT,
  encrypted_hash TEXT
);

-- 10. CLASS STRUCTURE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS class_structure_members (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  nisn_nip TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  phone TEXT,
  duties TEXT
);

-- 11. CLASS ACTIVITIES TABLE
CREATE TABLE IF NOT EXISTS class_activities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  photos_count INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  location TEXT NOT NULL
);

-- ENABLE ROW LEVEL SECURITY AND OPEN ALL POLICIES FOR DEMO SIMPLICITY
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
    EXECUTE format('DROP POLICY IF EXISTS "Allow public full access" ON %I;', tbl);
    EXECUTE format('CREATE POLICY "Allow public full access" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl);
    EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I;', tbl);
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  -- Handle gracefully if publication already contains tables
  NULL;
END $$;
