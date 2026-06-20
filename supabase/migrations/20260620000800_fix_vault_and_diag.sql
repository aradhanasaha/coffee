-- Diagnostics + a guarded way to (re)store the Vault service_role_key with the
-- CORRECT value, passed in via RPC body so the secret never touches git.

-- List triggers on a table (to find leftover dashboard webhooks).
CREATE OR REPLACE FUNCTION public.list_table_triggers(p_table text)
RETURNS TABLE(trigger_name text, calls_function text) AS $$
    SELECT t.tgname::text, p.proname::text
    FROM pg_trigger t
    JOIN pg_proc p ON p.oid = t.tgfoid
    WHERE t.tgrelid = ('public.' || p_table)::regclass
      AND NOT t.tgisinternal
    ORDER BY t.tgname;
$$ LANGUAGE sql SECURITY DEFINER;

-- (Re)store the Vault secret. Restricted to service_role only and dropped after use.
CREATE OR REPLACE FUNCTION public.set_service_role_secret(p_key text)
RETURNS text AS $$
DECLARE existing uuid;
BEGIN
    SELECT id INTO existing FROM vault.secrets WHERE name = 'service_role_key';
    IF existing IS NULL THEN
        PERFORM vault.create_secret(p_key, 'service_role_key');
        RETURN 'created';
    ELSE
        PERFORM vault.update_secret(existing, p_key);
        RETURN 'updated';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.set_service_role_secret(text) FROM public, anon, authenticated;
