-- The dashboard `postgres` role can't run `ALTER DATABASE ... SET app.settings.*`,
-- so reading the function base URL from a custom GUC is impractical. The URL is
-- not a secret (it's just the project's function host), so hardcode it here and
-- keep ONLY the service-role key in Vault.

CREATE OR REPLACE FUNCTION public.send_daily_reminder(p_title text, p_body text)
RETURNS void AS $$
DECLARE
    base_url text := 'https://vuvholhphyfqckoyreck.functions.supabase.co';
    service_key text;
BEGIN
    SELECT decrypted_secret INTO service_key
    FROM vault.decrypted_secrets WHERE name = 'service_role_key';

    IF service_key IS NULL THEN
        RAISE WARNING 'send_daily_reminder skipped: vault secret service_role_key not configured';
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
