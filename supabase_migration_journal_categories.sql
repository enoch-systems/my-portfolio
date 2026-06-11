-- ============================================================
-- Migration: Update journal entry categories
-- Run this in your Supabase SQL Editor (SQL Editor > New Query)
-- ============================================================

-- 1. Drop old constraint
ALTER TABLE journal_entries DROP CONSTRAINT IF EXISTS journal_entries_category_check;

-- 2. Update existing rows to new category names
UPDATE journal_entries SET category = 'updates' WHERE category = 'shipped';
UPDATE journal_entries SET category = 'progress' WHERE category = 'engineered';
UPDATE journal_entries SET category = 'shipped' WHERE category = 'exploring';
UPDATE journal_entries SET category = 'modification' WHERE category = 'thinking';
UPDATE journal_entries SET category = 'updates' WHERE category = 'update';

-- 3. Add new constraint with all 6 categories
ALTER TABLE journal_entries ADD CONSTRAINT journal_entries_category_check
  CHECK (category IN ('updates', 'progress', 'shipped', 'modification', 'research', 'architecture'));