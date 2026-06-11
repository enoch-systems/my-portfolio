-- ============================================================
-- Complete Migration: Journal entries updates
-- Run this entire script in your Supabase SQL Editor (SQL Editor > New Query)
-- ============================================================

-- 1. Ensure the helper function exists (for auto-updating timestamps)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Add updated_at column to journal_entries (for "last edited" feature)
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- 3. Trigger to auto-set updated_at on every UPDATE to journal_entries
DROP TRIGGER IF EXISTS set_journal_entries_updated_at ON journal_entries;
CREATE TRIGGER set_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Update category constraint and existing rows
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_category_check;

UPDATE journal_entries SET category = 'updates' WHERE category = 'shipped';
UPDATE journal_entries SET category = 'progress' WHERE category = 'engineered';
UPDATE journal_entries SET category = 'shipped' WHERE category = 'exploring';
UPDATE journal_entries SET category = 'modification' WHERE category = 'thinking';
UPDATE journal_entries SET category = 'updates' WHERE category = 'update';

ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_category_check
  CHECK (category IN ('updates', 'progress', 'shipped', 'modification', 'research', 'architecture'));