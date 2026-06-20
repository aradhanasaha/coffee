"use client";

import { Bell, Loader2, Share } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

interface PushNotificationManagerProps {
    hideWhenActive?: boolean;
}

export default function PushNotificationManager({ hideWhenActive = false }: PushNotificationManagerProps) {
    const { status, enable, error } = usePushNotifications();

    if (status === 'loading') {
        return <Loader2 className="w-5 h-5 animate-spin text-journal-brown" />;
    }

    if (status === 'unsupported') {
        return (
            <p className="text-xs text-journal-brown/70 text-center">
                Notifications aren&apos;t supported on this browser.
            </p>
        );
    }

    if (status === 'needs-install') {
        return (
            <div className="flex items-center gap-2 text-sm text-journal-brown/80 justify-center">
                <Share className="w-4 h-4" />
                <span>Add to Home Screen to enable notifications</span>
            </div>
        );
    }

    if (status === 'subscribed') {
        if (hideWhenActive) return null;
        return (
            <div className="flex items-center gap-2 text-sm text-journal-brown font-medium">
                <Bell className="w-4 h-4" />
                <span>Notifications Active</span>
            </div>
        );
    }

    const label = status === 'denied' ? 'Notifications Blocked' : 'Enable Notifications';

    return (
        <div className="flex flex-col items-center gap-1 w-full">
            <button
                onClick={enable}
                disabled={status === 'denied'}
                className="flex items-center gap-2 px-4 py-2 bg-journal-brown/10 text-journal-brown rounded-xl text-sm font-medium hover:bg-journal-brown/20 transition-colors w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Bell className="w-4 h-4" />
                {label}
            </button>
            {status === 'denied' && (
                <p className="text-xs text-journal-brown/70 text-center">
                    Unblock notifications in your browser settings.
                </p>
            )}
            {error && <p className="text-xs text-red-600 text-center">{error}</p>}
        </div>
    );
}
