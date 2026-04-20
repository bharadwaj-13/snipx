-- =========================================================
-- SNIPX MASTER BACKEND BLUEPRINT
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- =========================================================

-- 1. BASE TABLES
---------------------------------------------------------

-- Profiles (User specific data)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  twitter TEXT,
  github TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Collections (Folders)
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  is_pinned BOOLEAN DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  share_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Snippets (The core data)
CREATE TABLE IF NOT EXISTS public.snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  share_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. SECURITY (RLS)
---------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.snippets ENABLE ROW LEVEL SECURITY;

-- 2a. Profile Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 2b. Collection Policies
DROP POLICY IF EXISTS "Users can manage own collections" ON collections;
CREATE POLICY "Users can manage own collections" ON collections FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view collections by share_token" ON collections;
CREATE POLICY "Anyone can view collections by share_token" ON collections FOR SELECT USING (share_token IS NOT NULL OR visibility = 'public');

-- 2c. Snippet Policies
DROP POLICY IF EXISTS "Users can manage own snippets" ON snippets;
CREATE POLICY "Users can manage own snippets" ON snippets FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view shared snippets" ON snippets;
CREATE POLICY "Anyone can view shared snippets" ON snippets FOR SELECT USING (
  share_token IS NOT NULL 
  OR visibility = 'public' 
  OR collection_id IN (SELECT id FROM collections WHERE share_token IS NOT NULL OR visibility = 'public')
);

-- 3. AUTOMATION (Triggers)
---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, 'user_' || substr(NEW.id::text, 1, 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. STORAGE (Buckets)
---------------------------------------------------------
-- NOTE: You must manually create the 'avatars' bucket in the UI as well.
-- These policies ensure that users can only manage their own avatars.

-- (Policies below assume the 'avatars' bucket exists)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "Avatar Uploads" ON storage.objects;
CREATE POLICY "Avatar Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Avatar Management" ON storage.objects;
CREATE POLICY "Avatar Management" ON storage.objects FOR ALL USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Public Avatar Viewing" ON storage.objects;
CREATE POLICY "Public Avatar Viewing" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
