-- Remove the temporary diagnostic / one-shot helper functions used while
-- debugging the notification pipeline. They are SECURITY DEFINER and expose
-- internal info, so they should not stay in the schema.
DROP FUNCTION IF EXISTS public.has_service_role_secret();
DROP FUNCTION IF EXISTS public.list_reminder_jobs();
DROP FUNCTION IF EXISTS public.recent_net_responses();
DROP FUNCTION IF EXISTS public.list_table_triggers(text);
DROP FUNCTION IF EXISTS public.get_function_src(text);
DROP FUNCTION IF EXISTS public.set_service_role_secret(text);
