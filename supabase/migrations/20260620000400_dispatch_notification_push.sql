-- Replace the unreliable dashboard-managed Database Webhook with a DB trigger we
-- control in code. On every new `notifications` row, call the push-dispatcher
-- edge function via pg_net, authenticated with the service-role key from Vault.
--
-- Requires (one-time, dashboard SQL editor — also used by daily reminders):
--   select vault.create_secret('<service-role-key>', 'service_role_key');
--
-- NOTE: If a dashboard webhook on `public.notifications` still exists, delete it
-- to avoid duplicate pushes.

CREATE OR REPLACE FUNCTION public.dispatch_notification_push()
RETURNS trigger AS $$
DECLARE
    base_url text := 'https://vuvholhphyfqckoyreck.functions.supabase.co';
    service_key text;
BEGIN
    SELECT decrypted_secret INTO service_key
    FROM vault.decrypted_secrets WHERE name = 'service_role_key';

    IF service_key IS NULL THEN
        RAISE WARNING 'dispatch_notification_push skipped: vault secret service_role_key not set';
        RETURN NEW;
    END IF;

    PERFORM net.http_post(
        url := base_url || '/push-dispatcher',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || service_key
        ),
        body := jsonb_build_object(
            'type', 'INSERT',
            'table', 'notifications',
            'schema', 'public',
            'record', to_jsonb(NEW),
            'old_record', null
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_notification_dispatch_push ON public.notifications;
CREATE TRIGGER on_notification_dispatch_push
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION public.dispatch_notification_push();
