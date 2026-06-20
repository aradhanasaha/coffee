-- Read-only: return a function's source so we can see what legacy dashboard
-- triggers actually do before consolidating.
CREATE OR REPLACE FUNCTION public.get_function_src(p_name text)
RETURNS text AS $$
    SELECT pg_get_functiondef(p.oid)
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = p_name
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
