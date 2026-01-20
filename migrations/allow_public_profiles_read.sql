-- Allow everyone to read profiles (usernames are public)
-- Run this in your Supabase SQL Editor

-- Enable RLS on profiles if not already enabled (it should be by default)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to read basic profile info
-- Note: Check if "Public profiles are viewable by everyone" already exists to avoid error
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);
