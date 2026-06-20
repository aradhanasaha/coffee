
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
    type: 'INSERT';
    table: string;
    schema: string;
    record: any; // The notification row
    old_record: null;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Security: accept EITHER the webhook secret (dashboard webhook) OR the
    // service-role key as a bearer token (our DB trigger calls it this way).
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = Deno.env.get('WEBHOOK_SECRET');
    const bearer = (req.headers.get('authorization') || '').replace('Bearer ', '').trim();
    const serviceKey = (Deno.env.get('SERVICE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '').trim();

    const authorized =
        (!!expectedSecret && webhookSecret === expectedSecret) ||
        (!!serviceKey && bearer === serviceKey);

    if (!authorized) {
        console.error('Auth failed — webhook secret present:', !!webhookSecret, '| bearer present:', !!bearer);
        return new Response('Unauthorized', { status: 401 });
    }

    try {
        const payload: WebhookPayload = await req.json();
        console.log('Webhook received for:', payload.table);

        if (payload.type !== 'INSERT' || payload.table !== 'notifications') {
            return new Response('Ignored: Not a notification insert', { status: 200 });
        }

        const notification = payload.record;

        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Setup WebPush — keys come from Edge Function secrets (single source of truth).
        const vapidSubject = 'mailto:admin@imnotupyet.com';
        const publicKey = Deno.env.get('VAPID_PUBLIC_KEY');
        const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');

        if (!publicKey || !privateKey) {
            console.error('VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY is missing');
            // Fail gracefully so we don't crash, but log it
            return new Response('Configuration Error: Missing VAPID keys', { status: 500 });
        }

        webpush.setVapidDetails(vapidSubject, publicKey, privateKey);

        // Generate Content
        let title = 'New Notification';
        let body = 'You have a new update';
        let url = '/notifications';

        // Helper to get actor name
        let actorName = 'Someone';
        if (notification.trigger_actor_id) {
            const { data: actor } = await supabase
                .from('profiles')
                .select('username')
                .eq('user_id', notification.trigger_actor_id)
                .single();
            if (actor) actorName = actor.username;
        }

        switch (notification.type) {
            case 'post':
                title = 'New Coffee Log';
                body = notification.actor_count > 1
                    ? `${actorName} posted ${notification.actor_count} new coffee logs`
                    : `${actorName} posted a new coffee log`;
                url = `/log/${notification.entity_id}`;
                break;
            case 'like':
                title = 'New Like';
                body = `${actorName} liked your coffee log`;
                url = `/log/${notification.entity_id}`;
                break;
            case 'follow':
                title = 'New Follower';
                body = `${actorName} started following you`;
                url = `/user/${actorName}`;
                break;
            case 'save_list':
                title = 'List Saved';
                body = `${actorName} saved your list`;
                break;
            case 'nudge':
                title = 'We miss you!';
                body = 'It has been a while since your last coffee log.';
                break;
        }

        // Respect the recipient's social opt-out (nudge is a re-engagement nudge,
        // still allowed). Missing preferences row = opted-in (default true).
        if (notification.type !== 'nudge') {
            const { data: prefs } = await supabase
                .from('notification_preferences')
                .select('social')
                .eq('user_id', notification.recipient_id)
                .maybeSingle();
            if (prefs && prefs.social === false) {
                console.log('Recipient opted out of social notifications:', notification.recipient_id);
                return new Response('Recipient opted out', { status: 200 });
            }
        }

        // Fetch Subscriptions
        const { data: subscriptions, error: subError } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', notification.recipient_id);

        if (subError) {
            console.error('Error fetching subscriptions:', subError.message);
            return new Response(JSON.stringify({ error: subError.message }), { status: 500, headers: corsHeaders });
        }

        if (!subscriptions || subscriptions.length === 0) {
            console.log('No subscriptions for recipient:', notification.recipient_id);
            return new Response('No subscriptions found', { status: 200 });
        }

        console.log(`Sending to ${subscriptions.length} subscription(s) for type: ${notification.type}`);

        // Send Pushes
        const pushPayload = JSON.stringify({ title, body, url });
        const results = await Promise.all(subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                }, pushPayload);
                console.log(`Push sent successfully to sub ${sub.id}`);
                return { success: true, id: sub.id };
            } catch (err: any) {
                console.error(`Push failed for sub ${sub.id}: status=${err.statusCode} body=${err.body ?? err.message}`);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                    console.log(`Removed expired subscription ${sub.id}`);
                }
                return { success: false, id: sub.id, error: String(err.message) };
            }
        }));

        return new Response(JSON.stringify({ success: true, results }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error processing webhook:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
});
