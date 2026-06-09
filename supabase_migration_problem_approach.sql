-- ============================================================
-- Migration: Add problem and approach, drop description
-- Run this in your Supabase SQL Editor (SQL Editor > New Query)
-- ============================================================

-- Add new columns
ALTER TABLE projects
  ADD COLUMN problem text,
  ADD COLUMN approach text;

-- Backfill: copy description into problem so no data is lost
UPDATE projects SET problem = description WHERE problem IS NULL;

-- Drop the description column
ALTER TABLE projects DROP COLUMN description;