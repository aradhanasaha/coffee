"use client";

import { useEffect, useState } from 'react';
import { Bell, Share } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const DISMISS_KEY = 'notification_popup_dismissed';

export default function NotificationPermissionPopup() {
    const { status, enable, error } = usePushNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Decide whether to surface the popup based on the resolved push status.
    useEffect(() => {
        if (status === 'loading') return;

        // Permission already granted but the subscription isn't saved (rotation,
        // failed save, new device) — quietly re-sync without bothering the user.
        if (status === 'granted-unsubscribed') {
            enable();
            return;
        }

        // Only the "default" (never-asked) and iOS "needs-install" states warrant
        // a prompt, and only if the user hasn't dismissed it before.
        if (status !== 'default' && status !== 'needs-install') return;
        if (localStorage.getItem(DISMISS_KEY)) return;

        const timer = setTimeout(() => setIsOpen(true), 3000);
        return () => clearTimeout(timer);
    }, [status, enable]);

    const handleEnable = async () => {
        setLoading(true);
        try {
            await enable();
        } finally {
            setLoading(false);
            // Close on success; if denied, the modal closing is fine too.
            setIsOpen(false);
        }
    };

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem(DISMISS_KEY, 'true');
    };

    // iOS Safari tab: push is impossible until the PWA is installed. Guide instead.
    if (status === 'needs-install') {
        return (
            <Modal isOpen={isOpen} onClose={handleDismiss}>
                <div className="p-8 flex flex-col items-center text-center space-y-4">
                    <div className="bg-primary/10 p-4 rounded-full mb-2">
                        <Share className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Install to get notifications</h2>
                    <p className="text-muted-foreground text-sm max-w-xs">
                        On iPhone &amp; iPad, notifications only work after you add this app to your
                        Home Screen.
                    </p>
                    <ol className="text-left text-sm space-y-3 bg-secondary/30 p-4 rounded-xl text-muted-foreground w-full max-w-xs">
                        <li className="flex gap-3">
                            <span className="bg-primary/20 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-primary">1</span>
                            <span>Tap the <span className="font-bold">Share</span> button</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="bg-primary/20 w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-primary">2</span>
                            <span>Select <span className="font-bold">&quot;Add to Home Screen&quot;</span></span>
                        </li>
                    </ol>
                    <button
                        onClick={handleDismiss}
                        className="w-full max-w-xs py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:opacity-90 transition-opacity"
                    >
                        Got it
                    </button>
                </div>
            </Modal>
        );
    }

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

                {error && (
                    <p className="text-destructive text-xs max-w-xs">{error}</p>
                )}

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
