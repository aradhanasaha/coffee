-- Remove the temporary ACL-check helper used to confirm the REVOKE on
-- send_daily_reminder took effect.
DROP FUNCTION IF EXISTS public.check_reminder_acl();
