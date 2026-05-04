-- =========================================================
-- SNIPX STORAGE OPTIMIZATION: GITHUB GISTS
-- =========================================================

-- 1. Add gist_id column
ALTER TABLE public.snippets 
ADD COLUMN IF NOT EXISTS gist_id TEXT;

-- 2. Ensure preview column exists (from previous optimization)
ALTER TABLE public.snippets 
ADD COLUMN IF NOT EXISTS preview TEXT;

-- 3. Populate preview column for existing snippets
UPDATE public.snippets 
SET preview = SUBSTRING(code, 1, 1000) 
WHERE preview IS NULL;
