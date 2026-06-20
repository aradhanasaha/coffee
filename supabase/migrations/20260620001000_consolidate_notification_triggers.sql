-- Consolidate to a SINGLE notification path. Several overlapping mechanisms had
-- accumulated (some created directly in the dashboard, not in migrations):
--
--   notifications INSERT fired THREE triggers; coffee_logs INSERT fired TWO.
--
-- Keep exactly one of each:
--   * SEND path: the dashboard webhook "push-notifications" -> push-dispatcher
--     (works; authenticates with WEBHOOK_SECRET).
--   * POST notifications: notify_new_post_followers (repo-tracked, from
--     20260620000000) -> inserts an aggregated 'post' row per follower.
-- Like/follow rows still come from handle_notification_aggregation (unchanged).

-- 1. Broken: called push-notify with the ANON key -> always 401. Dead noise.
DROP TRIGGER IF EXISTS on_push_notification ON public.notifications;
DROP FUNCTION IF EXISTS public.send_push_notification();

-- 2. Redundant with the dashboard webhook -> would double-send. Remove my
--    DB-trigger send path (push-dispatcher service-key auth stays in the function
--    so this can be re-enabled later if the dashboard webhook is ever removed).
DROP TRIGGER IF EXISTS on_notification_dispatch_push ON public.notifications;
DROP FUNCTION IF EXISTS public.dispatch_notification_push();

-- 3. Duplicate of notify_new_post_followers (identical logic) -> inflated
--    actor_count ("posted 2 new logs" for 1 post). Drop the dashboard copy.
DROP TRIGGER IF EXISTS on_coffee_log_post ON public.coffee_logs;
DROP FUNCTION IF EXISTS public.notify_followers_on_new_post();
