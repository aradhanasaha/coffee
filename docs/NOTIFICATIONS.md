# Notifications — architecture & setup

Web Push (VAPID) on Supabase. One client hook, one service worker, one server
send path. No Firebase, no FCM.

## Flow

```
Social (like / follow / new post / save_list)
  DB trigger (handle_notification_aggregation; notify_new_post_followers for posts)
              ->  INSERT into `notifications`
              ->  Supabase DB Webhook "push-notifications" (auth: WEBHOOK_SECRET)
              ->  push-dispatcher edge fn  ->  web-push  ->  sw.js  ->  device

Daily reminders
  pg_cron  ->  send_daily_reminder()  ->  pg_net POST  ->  push-notify (broadcast, category='reminder')
           ->  web-push  ->  sw.js  ->  device

Subscription rotation
  browser rotates sub  ->  sw.js `pushsubscriptionchange`  ->  POST /api/push/resubscribe  ->  DB updated
```

The SEND leg is the dashboard-managed Database Webhook **"push-notifications"** on
`public.notifications` (INSERT) → `push-dispatcher`, authenticated with the
`x-webhook-secret` header. This is the single send path; do not add a second one
or notifications double-fire. (June 2026: removed three legacy/duplicate triggers —
`send_push_notification` [anon-key, always 401], `dispatch_notification_push`
[redundant], and `notify_followers_on_new_post` [duplicate post trigger that
inflated actor_count].)

## Client pieces
- `hooks/usePushNotifications.ts` — single source of truth (capability + iOS-install
  detection, permission, subscribe, persist). Status: `unsupported | needs-install |
  denied | default | granted-unsubscribed | subscribed`.
- `lib/push/vapid.ts` — public key from `NEXT_PUBLIC_VAPID_PUBLIC_KEY` + `urlBase64ToUint8Array`.
- `lib/push/saveSubscription.ts` — upsert into `push_subscriptions`.
- `components/common/ServiceWorkerRegister.tsx` — mounted once in `app/providers.tsx`.
- `public/sw.js` — `push`, `notificationclick`, and `pushsubscriptionchange` (rotation recovery).
- `app/api/push/resubscribe/route.ts` — saves a rotated subscription (auth by old endpoint).

## Server pieces
- `supabase/functions/push-dispatcher` — webhook on `notifications` INSERT (auth: `WEBHOOK_SECRET`). Honors social opt-out.
- `supabase/functions/push-notify` — broadcast/targeted (auth: service-role key). Honors `category='reminder'` opt-out; prunes 410/404.
- `supabase/migrations/20260620000000_post_followers_notifications.sql` — followers-only post fan-out trigger.
- `supabase/migrations/20260620000100_notification_preferences.sql` — opt-out table (missing row = opted in).
- `supabase/migrations/20260620000200_daily_reminders_cron.sql` — pg_cron reminders.

## Required configuration (per environment — NOT in the repo)

Edge Function secrets (Supabase dashboard → Edge Functions → Secrets):
- `VAPID_PUBLIC_KEY` — must equal `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY` (auto-provided; `SERVICE_KEY` optional override)

Frontend env (`.env.local`):
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, used by `/api/push/resubscribe`)

**DB Webhook (the most common total-failure cause):** Database → Webhooks →
create on `public.notifications`, event INSERT, type "Supabase Edge Functions" →
`push-dispatcher`, add header `x-webhook-secret: <WEBHOOK_SECRET>`.

pg_cron reminders one-time setup (run in the dashboard SQL editor). The function
base URL is hardcoded in `send_daily_reminder`, so only the service key is needed —
do NOT use `ALTER DATABASE ... SET` (the dashboard role lacks permission):
```sql
select vault.create_secret('<service-role-key>', 'service_role_key');
```
CRITICAL: the value stored here must be the EXACT service-role key that
`push-notify` accepts (i.e. matches the function's `SERVICE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
secret). A wrong value (anon key, a different/rotated key) makes `send_daily_reminder`
fail with 401 while everything else looks fine. To update it later:
```sql
select vault.update_secret((select id from vault.secrets where name='service_role_key'),
                           '<correct-service-role-key>');
```

## Verify end-to-end
1. **Subscribe (Android Chrome):** enable → a row appears in `push_subscriptions`; SW active in DevTools.
2. **Like/Follow:** from a 2nd account → recipient gets a push + in-app toast; `push-dispatcher` log shows "Push sent".
3. **New post (followers-only):** account A (followed by B) logs a coffee → only B is pushed; two quick posts aggregate ("posted 2 new logs").
4. **iOS Safari (tab):** popup shows install instructions, no false "enabled". Install → reopen → enable → push works.
5. **Rotation:** unsubscribe in DevTools → SW re-subscribes and `/api/push/resubscribe` updates the row.
6. **Reminder:** run `select public.send_daily_reminder('Test','Body');` → opted-in subscribers get it; a user with `daily_reminders=false` does not.
7. **Opt-out:** set a user's `notification_preferences.social=false` → likes/follows to them are skipped.
