-- Fix RLS policy for updating lists to allow soft delete
-- The previous policy might have had issues with implicit checks or interactions.
-- We are explicitly defining USING and WITH CHECK to allow owners to update their lists.

DROP POLICY IF EXISTS "modify own list" ON public.lists;

-- Recreate functionality to update own list
CREATE POLICY "modify own list"
ON public.lists
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Ensure insert policy is correct too
DROP POLICY IF EXISTS "create own list" ON public.lists;

CREATE POLICY "create own list"
ON public.lists
FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Add a DELETE policy just in case (though we use soft delete)
DROP POLICY IF EXISTS "delete own list" ON public.lists;

CREATE POLICY "delete own list"
ON public.lists
FOR DELETE
USING (owner_id = auth.uid());
