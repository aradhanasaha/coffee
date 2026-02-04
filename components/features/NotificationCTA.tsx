"use client";

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const VAPID_PUBLIC_KEY = 'BKntPVco71jin1umb6iMv8Ct8SDzt0kcq70TUT0W8ata_FXHUVTadyLiRH9vV4FJWatELUzzaLhIWEgr4z6flnY';

export default function NotificationCTA() {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkPermission = async () => {
        // Safety check for SSR
        if (typeof window === 'undefined' || typeof Notification === 'undefined') return;

        // 1. If permission is denied/default, show button
        if (Notification.permission !== 'granted') {
            setVisible(true);
            return;
        }

        // 2. "Limbo" Check: Permission is granted, but are we in the DB?
        try {
            if (!('serviceWorker' in navigator)) return;

            const registration = await navigator.serviceWorker.ready;
            const sub = await registration.pushManager.getSubscription();

            if (!sub) {
                // Permissions granted but no active subscription in browser -> Show button
                setVisible(true);
                return;
            }

            // Check DB
            const { supabase } = await import('@/lib/supabaseClient');
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('push_subscriptions')
                    .select('id')
                    .eq('endpoint', sub.endpoint)
                    .single();

                if (!data) {
                    // Critical: Browser has sub, but DB does not. Show button to allow re-sync.
                    console.log('User in Limbo state: Browser subscribed, DB missing. Showing CTA.');
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            }
        } catch (err) {
            console.error('Error checking subscription status:', err);
            // On error, default to showing button if we aren't sure, or hide it? 
            // Better to hide to avoid annoying people if DB is unreachable.
            setVisible(false);
        }
    };

    useEffect(() => {
        checkPermission();

        // Poll less frequently to avoid DB hammer, or just rely on focus
        const onFocus = () => checkPermission();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, []);

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

    const handleEnable = async () => {
        setLoading(true);
        try {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
                alert("Push notifications are not supported on this device/browser. Please try adding to Home Screen (iOS) or ensuring HTTPS.");
                return;
            }

            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            // Save to DB (We can import supabase here or assume the service worker/popup logic handles it? 
            // We should save it. I'll duplicate the save logic for robustness or extract it.
            // For conciseness, I'll assume the Popup logic covers the DB save if we import it or just do it here.)
            // Let's copy the save logic to be safe.
            const { supabase } = await import('@/lib/supabaseClient');
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const p256dh = sub.toJSON().keys?.p256dh;
                const auth = sub.toJSON().keys?.auth;
                if (p256dh && auth) {
                    await supabase.from('push_subscriptions').upsert({
                        user_id: user.id,
                        endpoint: sub.endpoint,
                        p256dh,
                        auth,
                        user_agent: navigator.userAgent
                    }, { onConflict: 'user_id, endpoint' });
                }
            }

            setVisible(false);
            alert("Notifications enabled!");
        } catch (error) {
            console.error('Failed to enable:', error);
            if (Notification.permission === 'denied') {
                alert('Notifications are blocked. Please enable them in your browser settings.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <button
            onClick={handleEnable}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-journal-brown text-journal-bg rounded-full shadow-md hover:opacity-90 transition-all animate-in fade-in slide-in-from-top-4 duration-500"
            title="Enable Notifications"
        >
            <Bell className="w-3 h-3 fill-current" />
            <span className="text-xs font-bold uppercase tracking-wide">Enable Notifications</span>
        </button>
    );
}
