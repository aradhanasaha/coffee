-- Daily coffee reminders via pg_cron (replaces the fragile GitHub Actions cron).
--
-- pg_cron fires on schedule and pg_net POSTs to the push-notify edge function
-- with broadcast + category='reminder' (so opted-out users are skipped server-side).
--
-- ONE-TIME OPERATOR SETUP (per environment — secrets are NOT committed):
--   select vault.create_secret('<service-role-key>', 'service_role_key');
--   alter database postgres set app.settings.edge_function_base_url =
--       'https://<project-ref>.functions.supabase.co';
-- The job reads the key from Vault and the base URL from the DB setting at run time.

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Helper: send one reminder broadcast.
CREATE OR REPLACE FUNCTION public.send_daily_reminder(p_title text, p_body text)
RETURNS void AS $$
DECLARE
    base_url text;
    service_key text;
BEGIN
    base_url := current_setting('app.settings.edge_function_base_url', true);
    SELECT decrypted_secret INTO service_key
    FROM vault.decrypted_secrets WHERE name = 'service_role_key';

    IF base_url IS NULL OR service_key IS NULL THEN
        RAISE WARNING 'send_daily_reminder skipped: base_url or service_role_key not configured';
        RETURN;
    END IF;

    PERFORM net.http_post(
        url := base_url || '/push-notify',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_key
        ),
        body := jsonb_build_object(
            'broadcast', true,
            'category', 'reminder',
            'title', p_title,
            'body', p_body,
            'url', '/home',
            'icon', '/logo.png'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule three reminders (UTC), mirroring the previous GitHub Actions times.
SELECT cron.unschedule('daily-reminder-morning')   WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-reminder-morning');
SELECT cron.unschedule('daily-reminder-afternoon') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-reminder-afternoon');
SELECT cron.unschedule('daily-reminder-evening')   WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-reminder-evening');

SELECT cron.schedule('daily-reminder-morning', '0 2 * * *', $$
    SELECT public.send_daily_reminder('Morning Brew ☕', 'Rise and shine! Don''t forget to log your morning coffee.');
$$);

SELECT cron.schedule('daily-reminder-afternoon', '30 7 * * *', $$
    SELECT public.send_daily_reminder('Afternoon Pick-me-up? ☀️', 'Powering through the day? Log your afternoon fuel!');
$$);

SELECT cron.schedule('daily-reminder-evening', '0 13 * * *', $$
    SELECT public.send_daily_reminder('Evening Wind Down 🌙', 'Having a late one? Log your evening brew (or decaf!).');
$$);
