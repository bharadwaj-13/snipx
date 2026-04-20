-- Update snippets table
ALTER TABLE snippets ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- Update collections table
ALTER TABLE collections ADD COLUMN IF NOT EXISTS visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private'));
ALTER TABLE collections ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE DEFAULT gen_random_uuid()::text;

-- Collections: Allow viewing public collections
DROP POLICY IF EXISTS "Anyone can view public collections" ON collections;
CREATE POLICY "Anyone can view public collections" ON collections
  FOR SELECT USING (visibility = 'public');

-- Collections: Allow viewing collections by share_token
DROP POLICY IF EXISTS "Anyone can view collections by share_token" ON collections;
CREATE POLICY "Anyone can view collections by share_token" ON collections
  FOR SELECT USING (share_token IS NOT NULL);

-- Snippets: Update policy to allow viewing by share_token
DROP POLICY IF EXISTS "Anyone can view snippets by share_token" ON snippets;
CREATE POLICY "Anyone can view snippets by share_token" ON snippets
  FOR SELECT USING (share_token IS NOT NULL);

-- Snippets: Allow viewing snippets if they belong to a shared/public collection
DROP POLICY IF EXISTS "Anyone can view snippets via collection share" ON snippets;
CREATE POLICY "Anyone can view snippets via collection share" ON snippets
  FOR SELECT USING (
    collection_id IN (
      SELECT id FROM collections WHERE visibility = 'public' OR share_token IS NOT NULL
    )
  );
