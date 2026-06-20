-- TEMP read-only check (dropped in the next migration): return the EXECUTE ACL
-- of send_daily_reminder so we can confirm anon/public can no longer call it.
CREATE OR REPLACE FUNCTION public.check_reminder_acl()
RETURNS text AS $$
    SELECT coalesce(array_to_string(p.proacl::text[], ' | '), 'NULL (default: PUBLIC may execute)')
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'send_daily_reminder'
    LIMIT 1;
$$ LANGUAGE sql SECURITY INVOKER;
