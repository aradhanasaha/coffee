-- Create a secure function to handle list deletion
-- This bypasses complex RLS checks by running as a security definer,
-- but manually verifies ownership.

CREATE OR REPLACE FUNCTION delete_list(target_list_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Perform the soft delete only if the user owns the list
  UPDATE public.lists
  SET deleted_at = timezone('utc', now())
  WHERE id = target_list_id
  AND owner_id = auth.uid();

  -- If no row was updated, it means either the list doesn't exist
  -- or the user doesn't own it. We could raise an error, or just return.
  -- For now, we'll silently return (idempotent).
END;
$$;
