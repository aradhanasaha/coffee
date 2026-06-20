-- Followers-only "new post" notifications.
--
-- Replaces the broken broadcast trigger (notify_new_post) which read from a
-- non-existent public.users table and called push-notify with the wrong auth.
-- New approach mirrors the like/follow aggregation model: a new coffee log
-- fans out one aggregated notification row per FOLLOWER. The existing DB
-- Webhook (notifications INSERT -> push-dispatcher) then delivers the push.

-- 1. Remove the old broken trigger + function.
DROP TRIGGER IF EXISTS on_new_coffee_log_trigger ON public.coffee_logs;
DROP FUNCTION IF EXISTS public.notify_new_post();

-- 2. Fan-out function: for each follower of the author, upsert an aggregated
--    'post' notification (grouped per author so multiple posts collapse into
--    "X posted N new coffee logs").
CREATE OR REPLACE FUNCTION public.notify_new_post_followers()
RETURNS trigger AS $$
DECLARE
    author_username text;
    grp_key text;
    follower record;
    existing_id uuid;
    existing_count int;
BEGIN
    -- Ignore soft-deleted inserts (defensive).
    IF NEW.deleted_at IS NOT NULL THEN
        RETURN NEW;
    END IF;

    SELECT username INTO author_username FROM public.profiles WHERE user_id = NEW.user_id;
    IF author_username IS NULL THEN
        author_username := 'Someone';
    END IF;

    grp_key := 'post:user:' || NEW.user_id;

    FOR follower IN
        SELECT follower_id FROM public.follows WHERE following_id = NEW.user_id
    LOOP
        -- Aggregate with an existing UNREAD post notification from this author.
        SELECT id, actor_count INTO existing_id, existing_count
        FROM public.notifications
        WHERE recipient_id = follower.follower_id
          AND group_key = grp_key
          AND type = 'post'
          AND read = false
        LIMIT 1;

        IF existing_id IS NOT NULL THEN
            UPDATE public.notifications
            SET actor_count = existing_count + 1,
                entity_id = NEW.id,          -- link to the newest post
                trigger_actor_id = NEW.user_id,
                created_at = now(),          -- bump to top
                read = false
            WHERE id = existing_id;
        ELSE
            INSERT INTO public.notifications (
                recipient_id, sender_id, trigger_actor_id, type,
                group_key, entity_id, actor_count, actor_names
            ) VALUES (
                follower.follower_id, NEW.user_id, NEW.user_id, 'post',
                grp_key, NEW.id, 1, jsonb_build_array(author_username)
            );
        END IF;
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger.
DROP TRIGGER IF EXISTS on_new_coffee_log_notify ON public.coffee_logs;
CREATE TRIGGER on_new_coffee_log_notify
    AFTER INSERT ON public.coffee_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_new_post_followers();
