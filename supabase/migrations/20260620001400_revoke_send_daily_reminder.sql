-- Security fix (also applied manually via SQL editor): send_daily_reminder is a
-- SECURITY DEFINER function that reads the service-role key from Vault and
-- broadcasts a push with caller-supplied title/body. Functions in the exposed
-- `public` schema are callable by the `anon` role through PostgREST RPC by
-- default, which would let an unauthenticated caller spam/phish all subscribers.
-- Restrict execution to the cron owner (postgres) and the backend service role.
REVOKE EXECUTE ON FUNCTION public.send_daily_reminder(text, text) FROM PUBLIC, anon, authenticated;
