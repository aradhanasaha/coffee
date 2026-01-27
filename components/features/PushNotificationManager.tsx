"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bell, BellOff, Loader2 } from 'lucide-react';

const VAPID_PUBLIC_KEY = 'BKntPVco71jin1umb6iMv8Ct8SDzt0kcq70TUT0W8ata_FXHUVTadyLiRH9vV4FJWatELUzzaLhIWEgr4z6flnY'; // Hardcoded from generation

export default function PushNotificationManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('PushNotificationManager mounted');
        console.log('ServiceWorker support:', 'serviceWorker' in navigator);
        console.log('PushManager support:', 'PushManager' in window);

        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            registerServiceWorker();
        } else {
            console.log('Push notifications NOT supported');
            setIsSupported(false); // Explicitly set false even though it is default
            setLoading(false);
        }
    }, []);

    const registerServiceWorker = async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            const sub = await registration.pushManager.getSubscription();
            setSubscription(sub);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    const subscribeToPush = async () => {
        setLoading(true);
        try {
            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            setSubscription(sub);
            await saveSubscriptionHeight(sub);
            alert('Notifications enabled!');
        } catch (error) {
            console.error('Failed to subscribe to push:', error);
            if (Notification.permission === 'denied') {
                alert('You have blocked notifications. Please enable them in your browser settings.');
            } else {
                alert('Failed to enable notifications.');
            }
        } finally {
            setLoading(false);
        }
    };

    const saveSubscriptionHeight = async (sub: PushSubscription) => {
        const { user } = (await supabase.auth.getUser()).data;
        if (!user) return;

        const p256dh = sub.toJSON().keys?.p256dh;
        const auth = sub.toJSON().keys?.auth;

        if (!p256dh || !auth) {
            console.error('Invalid keys');
            return;
        }

        const { error } = await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                endpoint: sub.endpoint,
                p256dh,
                auth,
                user_agent: navigator.userAgent
            }, { onConflict: 'user_id, endpoint' });

        if (error) {
            console.error('Error saving subscription to DB:', error);
        }
    };

    // We don't usually implement "unsubscribe" from the browser push manager completely in UI often, 
    // but we can just clear backend state or unsubscribe locally.
    // For simplicity, we'll just show "Enabled" state.

    if (loading) {
        return <Loader2 className="w-5 h-5 animate-spin text-journal-brown" />;
    }

    if (subscription) {
        return (
            <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                <Bell className="w-4 h-4" />
                <span>Notifications Active</span>
            </div>
        );
    }

    return (
        <button
            onClick={subscribeToPush}
            className="flex items-center gap-2 px-4 py-2 bg-journal-brown text-[#fbfbfb] rounded-xl text-sm font-medium hover:bg-journal-brown-dark transition-colors w-full justify-center"
        >
            <Bell className="w-4 h-4" />
            Enable Notifications
        </button>
    );
}
