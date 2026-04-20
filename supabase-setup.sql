-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  twitter TEXT,
  github TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create function to handle profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create snippets table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'private')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on snippets
ALTER TABLE snippets ENABLE ROW LEVEL SECURITY;

-- Snippets policies
CREATE POLICY "Users can view their own snippets" ON snippets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public snippets" ON snippets
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can insert their own snippets" ON snippets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own snippets" ON snippets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own snippets" ON snippets
  FOR DELETE USING (auth.uid() = user_id);

-- Create collections table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on collections
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Collections policies
CREATE POLICY "Users can view their own collections" ON collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);