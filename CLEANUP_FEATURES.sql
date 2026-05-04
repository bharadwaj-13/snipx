-- =========================================================
-- SNIPX FEATURE CLEANUP: REMOVE COLLABORATION & HISTORY (v2)
-- Run this in your Supabase SQL Editor to reclaim storage.
-- =========================================================

-- 1. Drop dependent policies first
DROP POLICY IF EXISTS "Allow public edit by share permissions" ON public.snippets;
DROP POLICY IF EXISTS "Anyone can post comments if allowed" ON public.comments;
DROP POLICY IF EXISTS "Owners can manage comments" ON public.comments;

-- 2. Drop the comments table
DROP TABLE IF EXISTS public.comments CASCADE;

-- 3. Drop the snippet versions table
DROP TABLE IF EXISTS public.snippet_versions CASCADE;

-- 4. Remove collaborative columns from snippets
-- Using CASCADE to automatically drop any other remaining dependencies
ALTER TABLE public.snippets 
DROP COLUMN IF EXISTS allow_public_edit CASCADE,
DROP COLUMN IF EXISTS allow_public_comment CASCADE;

-- 5. Restore the "Anyone can view shared snippets" policy if it was affected
-- (Usually dropping columns with CASCADE might affect policies, so we ensure view access remains)
DROP POLICY IF EXISTS "Anyone can view shared snippets" ON snippets;
CREATE POLICY "Anyone can view shared snippets" ON snippets FOR SELECT USING (
  share_token IS NOT NULL 
  OR visibility = 'public'
);
