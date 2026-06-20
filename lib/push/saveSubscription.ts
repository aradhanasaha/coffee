import { supabase } from '@/lib/supabaseClient';

/**
 * Persist a browser PushSubscription to the `push_subscriptions` table for the
 * currently authenticated user. Upserts on (user_id, endpoint) so re-running is
 * idempotent and a rotated endpoint replaces the stale row.
 *
 * Returns true on success. Throws on a real DB error so callers can surface it
 * (no more silent failures).
 */
export async function saveSubscription(sub: PushSubscription): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const json = sub.toJSON();
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;

    if (!p256dh || !auth) {
        throw new Error('Push subscription is missing encryption keys');
    }

    const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
            {
                user_id: user.id,
                endpoint: sub.endpoint,
                p256dh,
                auth,
                user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
            },
            { onConflict: 'user_id, endpoint' }
        );

    if (error) throw error;
    return true;
}
