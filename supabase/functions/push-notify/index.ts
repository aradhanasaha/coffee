
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Security Check: Ensure the request is authorized
        const authHeader = req.headers.get('Authorization');
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Allow if Authorization header matches Service Role Key (simple check for internal/system calls)
        if (authHeader !== `Bearer ${serviceRoleKey}`) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 401,
            });
        }

        const { user_id, title, body, url, icon, broadcast } = await req.json();

        if ((!user_id && !broadcast) || !title || !body) {
            throw new Error('Missing required fields: user_id (or broadcast: true), title, body');
        }

        // Initialize web-push
        // In production, these should be env vars.
        // For this implementation, I will use the keys generated earlier.
        const vapidSubject = 'mailto:admin@imnotupyet.com';
        const publicKey = 'BKntPVco71jin1umb6iMv8Ct8SDzt0kcq70TUT0W8ata_FXHUVTadyLiRH9vV4FJWatELUzzaLhIWEgr4z6flnY';
        const privateKey = Deno.env.get('VAPID_PRIVATE_KEY');

        if (!privateKey) {
            throw new Error('VAPID_PRIVATE_KEY not set in Edge Function secrets');
        }

        webpush.setVapidDetails(
            vapidSubject,
            publicKey,
            privateKey
        );

        let subscriptions = [];

        if (broadcast) {
            // Fetch ALL subscriptions for broadcast
            // Note: In a large app, you would paginate this.
            const { data: allSubs, error: subError } = await supabase
                .from('push_subscriptions')
                .select('*');

            if (subError) throw subError;
            subscriptions = allSubs || [];
            console.log(`Broadcasting to ${subscriptions.length} subscriptions`);
        } else {
            // Fetch specific user subscriptions
            const { data: userSubs, error: subError } = await supabase
                .from('push_subscriptions')
                .select('*')
                .eq('user_id', user_id);

            if (subError) throw subError;
            subscriptions = userSubs || [];
        }

        if (!subscriptions || subscriptions.length === 0) {
            console.log(`No subscriptions found for targeting`);
            return new Response(JSON.stringify({ message: 'No subscriptions found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        const payload = JSON.stringify({
            title,
            body,
            url,
            icon
        });

        const results = await Promise.all(subscriptions.map(async (sub) => {
            try {
                const pushSubscription = {
                    endpoint: sub.endpoint,
                    keys: {
                        p256dh: sub.p256dh,
                        auth: sub.auth,
                    },
                };

                await webpush.sendNotification(pushSubscription, payload);
                return { success: true, id: sub.id };
            } catch (error) {
                console.error(`Error sending to subscription ${sub.id}:`, error);

                // If 410 Gone, remove the subscription
                if (error.statusCode === 410) {
                    await supabase.from('push_subscriptions').delete().eq('id', sub.id);
                    return { success: false, id: sub.id, error: 'Expired subscription removed' };
                }

                return { success: false, id: sub.id, error: error.message };
            }
        }));

        return new Response(JSON.stringify({ results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Edge Function Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
