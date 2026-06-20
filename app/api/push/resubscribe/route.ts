import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Called by the service worker's `pushsubscriptionchange` handler when the
 * browser rotates a push subscription — possibly while the app isn't open, so
 * there's no user session to rely on.
 *
 * We authenticate by capability: the caller must present the *old* endpoint,
 * which only the browser that held that subscription knows. We look up the row
 * by old endpoint to recover the user_id, then move it to the new endpoint/keys.
 */
export const runtime = 'nodejs';

function serviceClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        { auth: { persistSession: false } }
    );
}

export async function POST(request: Request) {
    try {
        const { oldEndpoint, endpoint, p256dh, auth } = await request.json();

        if (!endpoint || !p256dh || !auth) {
            return NextResponse.json({ error: 'Missing subscription fields' }, { status: 400 });
        }
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        const supabase = serviceClient();

        // Recover the owning user from the old endpoint (capability proof).
        let userId: string | null = null;
        if (oldEndpoint) {
            const { data } = await supabase
                .from('push_subscriptions')
                .select('user_id')
                .eq('endpoint', oldEndpoint)
                .maybeSingle();
            userId = data?.user_id ?? null;

            // Drop the now-dead subscription row.
            await supabase.from('push_subscriptions').delete().eq('endpoint', oldEndpoint);
        }

        if (!userId) {
            // Can't attribute the new subscription — the next app open will re-save
            // it via the client hook. Acknowledge so the SW doesn't retry-loop.
            return NextResponse.json({ ok: true, attributed: false });
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert(
                { user_id: userId, endpoint, p256dh, auth, user_agent: 'pushsubscriptionchange' },
                { onConflict: 'user_id, endpoint' }
            );

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, attributed: true });
    } catch (err: any) {
        return NextResponse.json({ error: err?.message || 'Bad request' }, { status: 400 });
    }
}
