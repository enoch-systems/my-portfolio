-- ============================================================
-- Supabase SQL Migration
-- Run this in your Supabase SQL Editor (SQL Editor > New Query)
-- ============================================================

-- 1. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  platforms text NOT NULL,
  category_type text NOT NULL CHECK (category_type IN ('engineering', 'client', 'research')),
  image text,
  live_url text,
  github_url text,
  about text,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  date date NOT NULL,
  published_at timestamptz NOT NULL,
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('shipped', 'engineered', 'exploring', 'thinking')),
  summary text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- 4. Public read access for both tables
CREATE POLICY "Allow public read access on projects"
  ON projects FOR SELECT USING (true);

CREATE POLICY "Allow public read access on journal_entries"
  ON journal_entries FOR SELECT USING (true);

-- 5. Authenticated users can insert/update/delete
CREATE POLICY "Allow authenticated insert on projects"
  ON projects FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on projects"
  ON projects FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete on projects"
  ON projects FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert on journal_entries"
  ON journal_entries FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update on journal_entries"
  ON journal_entries FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated delete on journal_entries"
  ON journal_entries FOR DELETE TO authenticated USING (true);