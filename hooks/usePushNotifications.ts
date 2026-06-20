"use client";

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from '@/lib/push/vapid';
import { saveSubscription } from '@/lib/push/saveSubscription';

/**
 * Single source of truth for the client-side push lifecycle.
 *
 * status meanings:
 *  - 'loading'              still detecting capability / existing subscription
 *  - 'unsupported'          browser lacks SW / PushManager / Notification APIs
 *  - 'needs-install'        iOS in a browser tab — web push only works once the
 *                           PWA is installed (Add to Home Screen, iOS 16.4+)
 *  - 'denied'               user blocked notifications
 *  - 'default'              permission not yet requested
 *  - 'granted-unsubscribed' permission granted but no active/saved subscription
 *                           ("limbo" — needs a re-subscribe)
 *  - 'subscribed'           fully wired and saved to the DB
 */
export type PushStatus =
    | 'loading'
    | 'unsupported'
    | 'needs-install'
    | 'denied'
    | 'default'
    | 'granted-unsubscribed'
    | 'subscribed';

interface UsePushNotifications {
    status: PushStatus;
    isSupported: boolean;
    /** iOS Safari tab — the user must install the PWA before push can work. */
    needsInstall: boolean;
    error: string | null;
    /** Request permission, subscribe, and persist. Safe to call repeatedly. */
    enable: () => Promise<void>;
    /** Re-check capability / subscription state (e.g. on window focus). */
    refresh: () => Promise<void>;
}

function detectSupport(): boolean {
    return (
        typeof navigator !== 'undefined' &&
        'serviceWorker' in navigator &&
        typeof window !== 'undefined' &&
        'PushManager' in window &&
        'Notification' in window
    );
}

function isIosSafariTab(): boolean {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
    const ua = navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isStandalone =
        window.matchMedia?.('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
    return isIos && !isStandalone;
}

export function usePushNotifications(): UsePushNotifications {
    const [status, setStatus] = useState<PushStatus>('loading');
    const [error, setError] = useState<string | null>(null);

    const computeStatus = useCallback(async (): Promise<PushStatus> => {
        if (!detectSupport()) return 'unsupported';
        if (isIosSafariTab()) return 'needs-install';

        const permission = Notification.permission;
        if (permission === 'denied') return 'denied';
        if (permission === 'default') return 'default';

        // Permission granted — confirm an active subscription exists AND is saved.
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();
            if (!sub) return 'granted-unsubscribed';

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return 'granted-unsubscribed';

            const { data } = await supabase
                .from('push_subscriptions')
                .select('id')
                .eq('user_id', user.id)
                .eq('endpoint', sub.endpoint)
                .maybeSingle();

            return data ? 'subscribed' : 'granted-unsubscribed';
        } catch {
            return 'granted-unsubscribed';
        }
    }, []);

    const refresh = useCallback(async () => {
        const next = await computeStatus();
        setStatus(next);
    }, [computeStatus]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const enable = useCallback(async () => {
        setError(null);

        if (!detectSupport()) {
            setStatus('unsupported');
            setError('Push notifications are not supported on this browser.');
            return;
        }
        if (isIosSafariTab()) {
            setStatus('needs-install');
            return;
        }

        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                setStatus(permission === 'denied' ? 'denied' : 'default');
                return;
            }

            let sub = await registration.pushManager.getSubscription();
            if (!sub) {
                sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
                });
            }

            const saved = await saveSubscription(sub);
            setStatus(saved ? 'subscribed' : 'granted-unsubscribed');
        } catch (err: any) {
            console.error('Failed to enable push notifications:', err);
            setError(err?.message || 'Failed to enable notifications.');
            // Re-derive the true state (e.g. permission flipped to denied mid-flow).
            await refresh();
        }
    }, [refresh]);

    const isSupported = status !== 'unsupported';
    const needsInstall = status === 'needs-install';

    return { status, isSupported, needsInstall, error, enable, refresh };
}
