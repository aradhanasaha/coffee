-- Robust RLS Fix V2
-- Use a DO block to dynamically drop all policies on coffee_logs to avoid "policy does not exist" errors
-- and ensure we catch any oddly named policies blocking updates.

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'coffee_logs' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.coffee_logs', pol.policyname);
    END LOOP;
END $$;

-- Disable and Re-enable to be sure
ALTER TABLE public.coffee_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_logs ENABLE ROW LEVEL SECURITY;

-- Re-create policies with explicit permissions

-- 1. VIEW: Hide deleted logs (unless bypassed by other means/admin)
CREATE POLICY "Users can view all coffee logs" ON public.coffee_logs
    FOR SELECT
    USING (deleted_at IS NULL);

-- 2. INSERT: Standard check
CREATE POLICY "Users can insert own coffee logs" ON public.coffee_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE: Allow updating own logs even if they are "deleted" (to allow setting deleted_at)
-- CRITICAL: We do NOT filter by deleted_at IS NULL here.
CREATE POLICY "Users can update own coffee logs" ON public.coffee_logs
    FOR UPDATE
    USING (auth.uid() = user_id);
    -- Note: Removed WITH CHECK to default to checking USING clause on new row, 
    -- which is (auth.uid() = user_id), which remains true.

-- 4. DELETE: Allow hard delete if ever needed
CREATE POLICY "Users can delete own coffee logs" ON public.coffee_logs
    FOR DELETE
    USING (auth.uid() = user_id);
