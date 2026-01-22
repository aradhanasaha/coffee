-- "Nuclear" option: Drop ALL policies on lists and re-create them.
-- This ensures no conflicting or hidden policies prevent the update.

-- 1. Disable RLS temporarily to ensure clean slate (optional, but good for reset)
ALTER TABLE public.lists DISABLE ROW LEVEL SECURITY;

-- 2. Drop any and all known policies
DROP POLICY IF EXISTS "read visible lists" ON public.lists;
DROP POLICY IF EXISTS "create own list" ON public.lists;
DROP POLICY IF EXISTS "modify own list" ON public.lists;
DROP POLICY IF EXISTS "delete own list" ON public.lists;
DROP POLICY IF EXISTS "Users can insert their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can view their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON public.lists;

-- 3. Re-enable RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

-- 4. Re-create Policies correctly

-- READ: Public lists OR Own lists (regardless of deletion status for owner?) 
-- Actually, owner should see their deleted lists? 
-- Current logic: deleted_at IS NULL for everyone. 
-- But if we soft delete, we might want owner to see it? 
-- For now, keep as is: soft deleted lists disappear.
CREATE POLICY "read visible lists"
ON public.lists
FOR SELECT
USING (
  deleted_at IS NULL
  AND (
    visibility = 'public'
    OR owner_id = auth.uid()
  )
);

-- INSERT: Own lists only
CREATE POLICY "create own list"
ON public.lists
FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- UPDATE: Own lists only. 
-- IMPORTANT: Do NOT include 'deleted_at IS NULL' in the USING clause,
-- otherwise you cannot update a deleted list (to restore it) or the check might fail on soft-delete.
-- AND we must ensure WITH CHECK allows the new state.
CREATE POLICY "modify own list"
ON public.lists
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- DELETE: Own lists only (Hard delete if ever used)
CREATE POLICY "delete own list"
ON public.lists
FOR DELETE
USING (owner_id = auth.uid());
