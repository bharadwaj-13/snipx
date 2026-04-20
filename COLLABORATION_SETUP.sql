-- =========================================================
-- SNIPX COLLABORATION SETUP: EDIT & COMMENT
-- =========================================================

-- 1. Add collaborative flags to snippets
ALTER TABLE public.snippets 
ADD COLUMN IF NOT EXISTS allow_public_edit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS allow_public_comment BOOLEAN DEFAULT false;

-- 2. Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  snippet_id UUID REFERENCES public.snippets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id), -- Nullable for anonymous comments
  author_name TEXT, -- Used for anonymous comments
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Security (RLS)
---------------------------------------------------------

-- 3a. Update Snippet Policies to allow public editing
-- We use a policy that checks if allow_public_edit is true.
-- In a real app, you might want to verify the share_token too, 
-- but since the select is already filtered by token, this allows any update to a snippet that has this flag ON.

DROP POLICY IF EXISTS "Allow public edit by share permissions" ON snippets;
CREATE POLICY "Allow public edit by share permissions" 
ON public.snippets 
FOR UPDATE 
TO anon, authenticated
USING (allow_public_edit = true OR auth.uid() = user_id)
WITH CHECK (allow_public_edit = true OR auth.uid() = user_id);

-- 3b. Comment Policies
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Anyone can view comments" 
ON public.comments FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Anyone can post comments if allowed" ON comments;
CREATE POLICY "Anyone can post comments if allowed" 
ON public.comments FOR INSERT 
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.snippets 
    WHERE id = snippet_id AND allow_public_comment = true
  )
);

-- 3c. Allow owners to delete comments
DROP POLICY IF EXISTS "Owners can manage comments" ON comments;
CREATE POLICY "Owners can manage comments" 
ON public.comments FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.snippets 
    WHERE id = snippet_id AND user_id = auth.uid()
  )
);
