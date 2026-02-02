
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Logic: Find users inactive for 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 1. Get all users
        const { data: allUsers } = await supabase.from('profiles').select('user_id');

        // 2. Get active users (logs in last 7 days)
        const { data: recentLogs } = await supabase
            .from('coffee_logs')
            .select('user_id')
            .gt('created_at', sevenDaysAgo.toISOString());

        if (!allUsers) return new Response('No users found', { status: 200 });

        const activeUserIds = new Set((recentLogs || []).map(l => l.user_id));
        const usersToNudge = allUsers.filter(u => !activeUserIds.has(u.user_id));

        console.log(`Found ${usersToNudge.length} users to nudge`);

        // 3. Create Nudge Notifications
        // We limit to 50 at a time for safety in this demo implementation
        const batch = usersToNudge.slice(0, 50).map(u => ({
            recipient_id: u.user_id,
            type: 'nudge',
            read: false,
            // Assuming 'sender_id' or 'trigger_actor_id' might be needed depending on DB constraints
            // If sender_id is NOT NULL foreign key, you might need a dedicated 'System' user ID in your DB.
            // For now, we assume nullable or RLS allows system inserts.
        }));

        if (batch.length > 0) {
            const { error: insertError } = await supabase
                .from('notifications')
                .insert(batch);

            if (insertError) {
                console.error('Insert Error:', insertError);
                throw insertError;
            }
        }

        return new Response(JSON.stringify({ nudged_count: batch.length }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('Scheduler error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
});
