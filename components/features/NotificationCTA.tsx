"use client";

import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function NotificationCTA() {
    const { status, enable, refresh } = usePushNotifications();

    // Re-check when the user returns to the tab — catches subscriptions that
    // rotated or were granted on another surface.
    useEffect(() => {
        const onFocus = () => refresh();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [refresh]);

    // Only surface the nudge when enabling can actually help: never asked yet, or
    // "limbo" (permission granted but no saved subscription).
    const visible = status === 'default' || status === 'granted-unsubscribed';
    if (!visible) return null;

    return (
        <button
            onClick={enable}
            className="flex items-center gap-2 px-3 py-1.5 bg-journal-brown text-journal-bg rounded-full shadow-md hover:opacity-90 transition-all animate-in fade-in slide-in-from-top-4 duration-500"
            title="Enable Notifications"
        >
            <Bell className="w-3 h-3 fill-current" />
            <span className="text-xs font-bold uppercase tracking-wide">Enable Notifications</span>
        </button>
    );
}
