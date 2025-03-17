-- Create coach_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS coach_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    bio TEXT,
    specialties TEXT,
    avatar_url TEXT,
    years_experience INTEGER,
    certifications TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on coach_profiles
ALTER TABLE coach_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for coach_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON coach_profiles;
CREATE POLICY "Users can view their own profile"
    ON coach_profiles FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON coach_profiles;
CREATE POLICY "Users can update their own profile"
    ON coach_profiles FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON coach_profiles;
CREATE POLICY "Users can insert their own profile"
    ON coach_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy for clients to view their coach's profile
DROP POLICY IF EXISTS "Clients can view coach profiles" ON coach_profiles;
CREATE POLICY "Clients can view coach profiles"
    ON coach_profiles FOR SELECT
    USING (true);

-- Create storage bucket for profile images if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE name = 'profiles'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('profiles', 'profiles', true);
    END IF;
END $$;

-- Set up storage policies for profile images
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = 'coach-avatars');

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'profiles');

-- Add index on user_id for faster lookups
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_coach_profiles_user_id') THEN
        CREATE INDEX idx_coach_profiles_user_id ON coach_profiles(user_id);
    END IF;
END $$;
