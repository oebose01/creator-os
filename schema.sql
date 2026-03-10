-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Trigger for new users
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS Cyan
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
Cyan LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Content items table
CREATE TABLE public.content_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT CHECK (content_type IN ('video', 'audio', 'article', 'image', 'other')),
  url TEXT,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  registered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_verified BOOLEAN DEFAULT false,
  verification_hash TEXT,
  blockchain_tx TEXT
);
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Content is public" ON public.content_items FOR SELECT USING (true);
CREATE POLICY "Users can insert their own content" ON public.content_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own content" ON public.content_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content" ON public.content_items FOR DELETE USING (auth.uid() = user_id);

-- Registrations table
CREATE TABLE public.registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id UUID REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  registration_type TEXT CHECK (registration_type IN ('copyright', 'nft', 'timestamp', 'other')),
  registry_name TEXT,
  registry_id TEXT,
  tx_hash TEXT,
  block_number BIGINT,
  metadata JSONB DEFAULT '{}'::jsonb,
  registered_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Registrations are public" ON public.registrations FOR SELECT USING (true);
CREATE POLICY "Users can insert registrations for their content" ON public.registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payments table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_payment_id TEXT UNIQUE,
  amount INTEGER,
  currency TEXT DEFAULT 'usd',
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
