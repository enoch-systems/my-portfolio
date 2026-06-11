-- Fix journal_entries: convert literal backslash-n to real newlines
-- Run this in Supabase SQL editor

UPDATE journal_entries
SET content = REPLACE(content, '\n', chr(10))
WHERE content LIKE '%\n%';

UPDATE journal_entries
SET summary = REPLACE(summary, '\n', chr(10))
WHERE summary LIKE '%\n%';

UPDATE projects
SET problem = REPLACE(problem, '\n', chr(10))
WHERE problem LIKE '%\n%';

UPDATE projects
SET approach = REPLACE(approach, '\n', chr(10))
WHERE approach LIKE '%\n%';

UPDATE projects
SET about = REPLACE(about, '\n', chr(10))
WHERE about LIKE '%\n%';

-- Check results
SELECT id, title, 
  CASE WHEN content LIKE '%\n%' THEN 'HAS_ESCAPED_N' ELSE 'OK' END as status,
  LEFT(content, 200) as preview
FROM journal_entries 
ORDER BY published_at DESC
LIMIT 10;

