-- ============================================================================
-- COMPLETE RLS RESET FOR COFFEE APP
-- Run this entire script in Supabase SQL Editor to fix signup issues
-- ============================================================================

-- ============================================================================
-- STEP 1: PROFILES TABLE - Complete RLS Reset
-- ============================================================================

-- Disable RLS temporarily to clear everything
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create NEW comprehensive policies
-- Policy 1: Anyone can view all profiles (public social app)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
    FOR SELECT
    USING (true);

-- Policy 2: Users can insert their own profile during signup
CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can update their own profile (needed for triggers and username changes)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 2: COFFEE_LOGS TABLE - Verify RLS
-- ============================================================================

-- Drop and recreate coffee_logs policies
DROP POLICY IF EXISTS "Users can view all coffee logs" ON coffee_logs;
DROP POLICY IF EXISTS "Users can insert own coffee logs" ON coffee_logs;
DROP POLICY IF EXISTS "Users can update own coffee logs" ON coffee_logs;
DROP POLICY IF EXISTS "Users can delete own coffee logs" ON coffee_logs;

CREATE POLICY "Users can view all coffee logs" ON coffee_logs
    FOR SELECT
    USING (deleted_at IS NULL);

CREATE POLICY "Users can insert own coffee logs" ON coffee_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coffee logs" ON coffee_logs
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own coffee logs" ON coffee_logs
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 3: FOLLOWS TABLE - Verify RLS
-- ============================================================================

-- Drop and recreate follows policies
DROP POLICY IF EXISTS "Anyone can view follows" ON follows;
DROP POLICY IF EXISTS "Users can insert their own follows" ON follows;
DROP POLICY IF EXISTS "Users can delete their own follows" ON follows;

CREATE POLICY "Anyone can view follows" ON follows
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own follows" ON follows
    FOR INSERT
    WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own follows" ON follows
    FOR DELETE
    USING (auth.uid() = follower_id);

-- ============================================================================
-- STEP 4: LIKES TABLE - Verify RLS
-- ============================================================================

-- Drop and recreate likes policies
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
DROP POLICY IF EXISTS "Users can insert their own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON likes;

CREATE POLICY "Anyone can view likes" ON likes
    FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own likes" ON likes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON likes
    FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 5: LOCATIONS TABLE - Verify RLS
-- ============================================================================

DROP POLICY IF EXISTS "Anyone can view locations" ON locations;
DROP POLICY IF EXISTS "Anyone can insert locations" ON locations;

CREATE POLICY "Anyone can view locations" ON locations
    FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert locations" ON locations
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- STEP 6: Verify Permissions
-- ============================================================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON coffee_logs TO authenticated;
GRANT SELECT ON coffee_logs TO anon;

GRANT SELECT, INSERT, DELETE ON follows TO authenticated;
GRANT SELECT ON follows TO anon;

GRANT SELECT, INSERT, DELETE ON likes TO authenticated;
GRANT SELECT ON likes TO anon;

GRANT SELECT, INSERT ON locations TO authenticated;
GRANT SELECT ON locations TO anon;

-- ============================================================================
-- STEP 7: Verify column defaults are set
-- ============================================================================

-- Ensure follower/following counts have defaults
ALTER TABLE profiles 
    ALTER COLUMN follower_count SET DEFAULT 0,
    ALTER COLUMN following_count SET DEFAULT 0;

-- Make sure they're NOT NULL with defaults
ALTER TABLE profiles 
    ALTER COLUMN follower_count SET NOT NULL,
    ALTER COLUMN following_count SET NOT NULL;

-- ============================================================================
-- VERIFICATION QUERY - Run this after the script
-- ============================================================================

-- Uncomment and run this to verify policies are set correctly:
/*
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
*/

-- ============================================================================
-- TEST SIGNUP - Try this query to simulate signup
-- ============================================================================

-- This should work without errors if RLS is configured correctly:
/*
INSERT INTO profiles (user_id, username, created_at, follower_count, following_count)
VALUES (
    auth.uid(),
    'testuser' || floor(random() * 10000),
    now(),
    0,
    0
);
*/
