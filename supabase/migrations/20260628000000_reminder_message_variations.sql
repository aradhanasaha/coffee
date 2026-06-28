-- Daily reminders get variety: a pool of messages per time-slot, picked at
-- random each send. Adds a 'weekend' slot (fires Sat & Sun midday). Editing copy
-- is now a data change (insert/update rows), not a code change.

-- 1. Message pool
CREATE TABLE IF NOT EXISTS public.reminder_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slot text NOT NULL CHECK (slot IN ('morning', 'afternoon', 'evening', 'weekend')),
    title text NOT NULL,
    body text NOT NULL,
    active boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Read only via the SECURITY DEFINER sender (runs as owner). No public access.
ALTER TABLE public.reminder_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_reminder_messages_slot_active
    ON public.reminder_messages(slot) WHERE active;

-- 2. Seed copy
INSERT INTO public.reminder_messages (slot, title, body) VALUES
-- morning
('morning', 'rise & grind ☕',     'wake up in the morning feeling like 🎤🗣️'),
('morning', 'good morning 🍍',     'good morning pineapple 🍍'),
('morning', 'i smell coffee ☕',    'i can smell it, i can smell your coffee — post it, i wanna see it 👀'),
('morning', 'hi shmoopie 💛',      'hello shmoopie pie i hope u have a gr8 day 💛'),
('morning', 'morning americano 😤', 'if this americano doesn''t wake me up i swear to god'),
('morning', 'sun''s up ☀️',        'the sun''s up and so should ur espresso be ☀️'),
('morning', 'morning ☕',          'morning!! go befriend your barista, i''ll wait 🥐'),
('morning', 'first sip 📸',        'first sip supremacy — log it before u forget 📸'),
-- afternoon
('afternoon', 'permission granted 🧊', 'i give u permission to have that iced coffee, i know it''s 3 PM 🧊'),
('afternoon', 'go on... ☕',           'have that coffee, come on it''s okay (hehehehe)'),
('afternoon', 'one more ☕',           'just one more cappuccino before the work day ends'),
('afternoon', 'afternoon fuel ☀️',     'the last stretch before u log off — come on, have that coffee'),
('afternoon', 'latte o''clock 🕝',     '2:47pm is a perfectly valid time for a latte, trust'),
('afternoon', 'no slumps here ☕',     'midday slump? we don''t know her. coffee time ☕'),
('afternoon', 'treat urself 🌾',       'treat urself to the fancy oat milk one today 🌾'),
-- evening
('evening', 'pre-workout ☕',       'time for your pre-workout!! coffee time yippee !!'),
('evening', 'psst 👀',             'im in your walls — come on have that coffee 👀'),
('evening', 'evening brew 🌙',      'decaff time !! or just have the regular thing, who cares'),
('evening', 'goodnight 🌙',        'goodnight beautiful !! 🌙'),
('evening', 'romanticize it 🌆',    'one (1) cute little espresso to romanticize ur evening 🌆'),
('evening', 'coffee household ☕',  'tea people can look away — this is a coffee household ☕'),
('evening', 'wind down 🫶',        'wind down with something warm & share the pic w me 🫶'),
-- weekend
('weekend', 'show me ✨',           'yes i want to see the coffee u had in the hole-in-the-wall cafe u went to ✨'),
('weekend', 'cafe-hop 🎉',          'cafe-hopping time !! yippee 🎉'),
('weekend', 'cuppa with friends ☕', 'will u not catch up with your friends over a cuppa and share it with me :('),
('weekend', 'slow saturday ☕',      'slow saturday + a flat white = the dream. show me ☕'),
('weekend', 'cafe quest 🐌',        'go find the cafe with the ugly mugs and good beans 🐌'),
('weekend', 'brunch ☕',            'brunch coffee counts as breakfast AND personality 💁');

-- 3. Slot-based sender: pick a random active message for the slot and broadcast.
CREATE OR REPLACE FUNCTION public.send_daily_reminder(p_slot text)
RETURNS void AS $$
DECLARE
    base_url text := 'https://vuvholhphyfqckoyreck.functions.supabase.co';
    service_key text;
    msg record;
BEGIN
    SELECT decrypted_secret INTO service_key
    FROM vault.decrypted_secrets WHERE name = 'service_role_key';
    IF service_key IS NULL THEN
        RAISE WARNING 'send_daily_reminder skipped: vault secret service_role_key not configured';
        RETURN;
    END IF;

    SELECT title, body INTO msg
    FROM public.reminder_messages
    WHERE slot = p_slot AND active
    ORDER BY random()
    LIMIT 1;

    IF NOT FOUND THEN
        RAISE WARNING 'send_daily_reminder: no active message for slot %', p_slot;
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
            'title', msg.title,
            'body', msg.body,
            'url', '/home',
            'icon', '/logo.png'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Security: keep this off the public PostgREST surface (same as the old signature).
REVOKE EXECUTE ON FUNCTION public.send_daily_reminder(text) FROM PUBLIC, anon, authenticated;

-- Remove the old (title, body) signature so only the slot-based one remains.
DROP FUNCTION IF EXISTS public.send_daily_reminder(text, text);

-- 4. Re-point the cron jobs at the slot-based sender, and add the weekend job.
SELECT cron.unschedule('daily-reminder-morning')   WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-reminder-morning');
SELECT cron.unschedule('daily-reminder-afternoon') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-reminder-afternoon');
SELECT cron.unschedule('daily-reminder-evening')   WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-reminder-evening');
SELECT cron.unschedule('daily-reminder-weekend')   WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'daily-reminder-weekend');

SELECT cron.schedule('daily-reminder-morning',   '0 2 * * *',   $$ SELECT public.send_daily_reminder('morning'); $$);
SELECT cron.schedule('daily-reminder-afternoon', '30 7 * * *',  $$ SELECT public.send_daily_reminder('afternoon'); $$);
SELECT cron.schedule('daily-reminder-evening',   '0 13 * * *',  $$ SELECT public.send_daily_reminder('evening'); $$);
-- Weekend nudge: 05:30 UTC = 11:00 AM IST, Saturday (6) & Sunday (0).
SELECT cron.schedule('daily-reminder-weekend',   '30 5 * * 6,0', $$ SELECT public.send_daily_reminder('weekend'); $$);
