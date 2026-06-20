-- Read-only helper to confirm the Vault secret needed by the push trigger and
-- the daily-reminder job is configured. Returns true if present.
CREATE OR REPLACE FUNCTION public.has_service_role_secret()
RETURNS boolean AS $$
    SELECT EXISTS (SELECT 1 FROM vault.decrypted_secrets WHERE name = 'service_role_key');
$$ LANGUAGE sql SECURITY DEFINER;
