-- =========================================================
-- SNIPX STORAGE OPTIMIZATION: MOVE CODE TO BUCKETS
-- =========================================================

-- 1. Add columns for optimized storage
ALTER TABLE public.snippets 
ADD COLUMN IF NOT EXISTS storage_path TEXT,
ADD COLUMN IF NOT EXISTS preview TEXT;

-- 2. Populate preview column for existing snippets
UPDATE public.snippets 
SET preview = SUBSTRING(code, 1, 1000) 
WHERE preview IS NULL;

-- 3. Create storage bucket (This usually needs to be done via Supabase Dashboard)
-- But we can ensure the public can read from it if we have the name.
-- Bucket Name: "snippet-vault"

-- 4. Set up Storage Policies (Run this if you have the bucket created)
-- ALLOW AUTHENTICATED to upload to their own folder
-- ALLOW ANYONE to read if the snippet is public (This is handled by our app logic usually)
