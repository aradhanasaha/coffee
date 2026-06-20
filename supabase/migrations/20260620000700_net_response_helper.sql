-- Read-only diagnostic: surface recent pg_net HTTP responses so we can see what
-- the edge functions returned when called from triggers / cron.
CREATE OR REPLACE FUNCTION public.recent_net_responses()
RETURNS TABLE(id bigint, status_code int, content text, error_msg text, created timestamptz) AS $$
    SELECT id, status_code, left(content, 500) AS content, error_msg, created
    FROM net._http_response
    ORDER BY created DESC
    LIMIT 8;
$$ LANGUAGE sql SECURITY DEFINER;
