
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

    // Security: Verify Webhook Secret
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = Deno.env.get('WEBHOOK_SECRET');

    if (!expectedSecret || webhookSecret !== expectedSecret) {
        return new Response('Unauthorized: Invalid Webhook Secret', { status: 401 });
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

        // Setup WebPush
        const vapidSubject = 'mailto:admin@imnotupyet.com';
        const publicKey = 'BKntPVco71jin1umb6iMv8Ct8SDzt0kcq70TUT0W8ata_FXHUVTadyLiRH9vV4FJWatELUzzaLhIWEgr4z6flnY';
        const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');

        if (!privateKey) {
            console.error('VAPID_PRIVATE_KEY is missing');
            // Fail gracefully so we don't crash, but log it
            return new Response('Configuration Error: Missing Private Key', { status: 500 });
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

        // Fetch Subscriptions
        const { data: subscriptions } = await supabase
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', notification.recipient_id);

        if (!subscriptions || subscriptions.length === 0) {
            return new Response('No subscriptions found', { status: 200 });
        }

        // Send Pushes
        const pushPayload = JSON.stringify({ title, body, url });
        const results = await Promise.all(subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                }, pushPayload);
                return { success: true, id: sub.id };
            } catch (err) {
                console.error(`Push failed for sub ${sub.id}:`, err);
                if (err.statusCode === 410) {
                    await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                }
                return { success: false, id: sub.id, error: err };
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
