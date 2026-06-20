-- Read-only helper to confirm the daily-reminder pg_cron jobs are scheduled.
CREATE OR REPLACE FUNCTION public.list_reminder_jobs()
RETURNS TABLE(jobname text, schedule text, active boolean) AS $$
    SELECT jobname, schedule, active
    FROM cron.job
    WHERE jobname LIKE 'daily-reminder-%'
    ORDER BY jobname;
$$ LANGUAGE sql SECURITY DEFINER;
