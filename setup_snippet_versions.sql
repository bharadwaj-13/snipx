-- Run this command in the Supabase SQL Editor to enable Versioning

CREATE TABLE public.snippet_versions (
  id uuid default gen_random_uuid() primary key,
  snippet_id uuid references public.snippets(id) on delete cascade not null,
  code text not null,
  title text not null,
  description text,
  language text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
ALTER TABLE public.snippet_versions ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own snippet versions
CREATE POLICY "Users can view versions of their own snippets"
ON public.snippet_versions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.snippets
    WHERE snippets.id = snippet_versions.snippet_id
    AND snippets.user_id = auth.uid()
  )
);

-- Note: We do not need insert/update/delete policies because the trigger relies on the database's elevated privileges or handles it internally for the specific snippet owner. However, passing SECURITY DEFINER ensures it runs with high permissions.

-- Trigger to automatically save version on UPDATE
CREATE OR REPLACE FUNCTION save_snippet_version()
RETURNS trigger
SECURITY DEFINER
AS $$
BEGIN
  -- Only save a version if the code, title, or description actually changed
  IF OLD.code IS DISTINCT FROM NEW.code OR OLD.title IS DISTINCT FROM NEW.title OR OLD.description IS DISTINCT FROM NEW.description THEN
    INSERT INTO public.snippet_versions (snippet_id, code, title, description, language)
    VALUES (OLD.id, OLD.code, OLD.title, OLD.description, OLD.language);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger
CREATE TRIGGER tr_save_snippet_version
  BEFORE UPDATE ON public.snippets
  FOR EACH ROW EXECUTE PROCEDURE save_snippet_version();
