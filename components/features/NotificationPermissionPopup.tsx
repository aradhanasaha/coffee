"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Bell, X } from 'lucide-react';
import Modal from '@/components/common/Modal';

const VAPID_PUBLIC_KEY = 'BKntPVco71jin1umb6iMv8Ct8SDzt0kcq70TUT0W8ata_FXHUVTadyLiRH9vV4FJWatELUzzaLhIWEgr4z6flnY';

export default function NotificationPermissionPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check functionality support
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        // Check if already granted
        if (Notification.permission === 'granted') return;

        // Check if denied (don't pester)
        if (Notification.permission === 'denied') return;

        // Check if user dismissed it recently (e.g., don't show for 7 days or just session?)
        // The user said "when people open the app", so maybe every time until they say yes or no?
        // Let's use a session-based approach or a simple localStorage flag "notification_popup_dismissed"
        const dismissed = localStorage.getItem('notification_popup_dismissed');
        if (dismissed) return;

        // Show popup
        // Add a small delay so it doesn't pop immediately on load
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 3000);

        return () => clearTimeout(timer);
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

    const saveSubscriptionHeight = async (sub: PushSubscription) => {
        const { user } = (await supabase.auth.getUser()).data;
        if (!user) return;

        const p256dh = sub.toJSON().keys?.p256dh;
        const auth = sub.toJSON().keys?.auth;

        if (!p256dh || !auth) return;

        await supabase
            .from('push_subscriptions')
            .upsert({
                user_id: user.id,
                endpoint: sub.endpoint,
                p256dh,
                auth,
                user_agent: navigator.userAgent
            }, { onConflict: 'user_id, endpoint' });
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

            await saveSubscriptionHeight(sub);
            setIsOpen(false);
            alert("Notifications enabled! You won't miss a beat.");
        } catch (error) {
            console.error('Failed to subscribe:', error);
            // If denied during request
            if (Notification.permission === 'denied') {
                setIsOpen(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        setIsOpen(false);
        // Remember dismissal indefinitely (or we could store timestamp to show again later)
        localStorage.setItem('notification_popup_dismissed', 'true');
    };

    return (
        <Modal isOpen={isOpen} onClose={handleDismiss}>
            <div className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="bg-primary/10 p-4 rounded-full mb-2">
                    <Bell className="w-8 h-8 text-primary" />
                </div>

                <h2 className="text-xl font-bold text-foreground">Turn on Notifications?</h2>

                <p className="text-muted-foreground text-sm max-w-xs">
                    Get updates when friends log coffee or interact with your posts. No spam, we promise.
                </p>

                <div className="flex flex-col gap-3 w-full max-w-xs pt-4">
                    <button
                        onClick={handleEnable}
                        disabled={loading}
                        className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Enabling...' : 'Enable Notifications'}
                    </button>

                    <button
                        onClick={handleDismiss}
                        className="w-full py-3 text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </Modal>
    );
}
