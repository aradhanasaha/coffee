-- Fix RLS policies for coffee_logs to allow soft delete
-- This ensures no conflicting policies prevent updating deleted_at

-- 1. Disable RLS to clear slate (optional but good for reset)
ALTER TABLE coffee_logs DISABLE ROW LEVEL SECURITY;

-- 2. Drop potential zombie policies (be aggressive)
DROP POLICY IF EXISTS "Users can view all coffee logs" ON coffee_logs;
DROP POLICY IF EXISTS "Users can insert own coffee logs" ON coffee_logs;
DROP POLICY IF EXISTS "Users can update own coffee logs" ON coffee_logs;
DROP POLICY IF EXISTS "Users can delete own coffee logs" ON coffee_logs;

-- Also drop any generic ones that might have drifted in
DROP POLICY IF EXISTS "Enable read access for all users" ON coffee_logs;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON coffee_logs;
DROP POLICY IF EXISTS "Enable update for users based on email" ON coffee_logs;
DROP POLICY IF EXISTS "policy_name" ON coffee_logs; 

-- 3. Re-enable RLS
ALTER TABLE coffee_logs ENABLE ROW LEVEL SECURITY;

-- 4. Re-create policies with explicit separation

-- SELECT: Hide deleted logs
CREATE POLICY "Users can view all coffee logs" ON coffee_logs
    FOR SELECT
    USING (deleted_at IS NULL);

-- INSERT: Standard check
CREATE POLICY "Users can insert own coffee logs" ON coffee_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: Allow updating own logs (Even if setting deleted_at)
-- IMPORTANT: We do NOT check deleted_at here, so we can transition from NULL to NOT NULL
CREATE POLICY "Users can update own coffee logs" ON coffee_logs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: Real delete (optional, but good to have)
CREATE POLICY "Users can delete own coffee logs" ON coffee_logs
    FOR DELETE
    USING (auth.uid() = user_id);
