-- ============================================================
-- Migration: Add updated_at to journal_entries + auto-update trigger
-- Run this in your Supabase SQL Editor (SQL Editor > New Query)
-- ============================================================

-- 1. Ensure the helper function exists (creates it if it doesn't)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Add updated_at column to journal_entries
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 3. Trigger to auto-set updated_at on every UPDATE to journal_entries
CREATE TRIGGER set_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();