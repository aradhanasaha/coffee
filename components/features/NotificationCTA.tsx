"use client";

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const VAPID_PUBLIC_KEY = 'BKntPVco71jin1umb6iMv8Ct8SDzt0kcq70TUT0W8ata_FXHUVTadyLiRH9vV4FJWatELUzzaLhIWEgr4z6flnY';

export default function NotificationCTA() {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkPermission = () => {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        // Show if not granted
        if (Notification.permission === 'default') { // || 'denied' but we can't do much if denied
            setVisible(true);
        } else {
            setVisible(false);
        }
    };

    useEffect(() => {
        checkPermission();

        // Listen for changes (hacky check periodically or just on mount)
        // Permissions API might help but simple check is okay
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
