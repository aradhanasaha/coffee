-- Fix SELECT policy to allow users to see their own deleted logs
-- This prevents RLS errors when performing a soft delete and returning the row

ALTER TABLE coffee_logs DISABLE ROW LEVEL SECURITY;

-- Drop the restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view all coffee logs" ON coffee_logs;

-- Re-create SELECT policy that allows OWN deleted logs
CREATE POLICY "Users can view all coffee logs" ON coffee_logs
    FOR SELECT
    USING (
        deleted_at IS NULL 
        OR 
        auth.uid() = user_id
    );

ALTER TABLE coffee_logs ENABLE ROW LEVEL SECURITY;
