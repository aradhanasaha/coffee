"use client";

import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, UserPlus, Bookmark, Bell, Coffee } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { fetchNotifications, markAllAsRead, markAsRead } from '@/services/notificationService';
import { Notification } from '@/core/types/types';

interface NotificationsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef?: React.RefObject<HTMLElement>;
}

export default function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
    const router = useRouter();
    const { user } = useAuth();
    const panelRef = useRef<HTMLDivElement>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Fetch notifications
    useEffect(() => {
        if (isOpen && user) {
            loadNotifications();
        }
    }, [isOpen, user]);

    const loadNotifications = async () => {
        if (!user) return;
        setLoading(true);
        const result = await fetchNotifications(user.id);
        if (result.success && result.data) {
            setNotifications(result.data);
        }
        setLoading(false);
    };

    const handleMarkAllRead = async () => {
        if (!user) return;
        await markAllAsRead(user.id);
        await loadNotifications();
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
            // Optimistically update UI
            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? { ...n, read: true } : n
            ));
        }

        // Navigate based on type
        if (notification.type === 'follow') {
            router.push(`/user/${notification.sender?.username}`);
        } else if (notification.type === 'post') {
            // Navigate to user profile for now, or specific post if we had a post detail page
            // Assuming post notification links to the post
            // Since we don't have a dedicated post page yet, going to user profile is safest
            router.push(`/user/${notification.sender?.username}`);
        } else if (notification.type === 'like') {
            router.push(`/user/${notification.sender?.username}`);
        } else if (notification.type === 'save_list') {
            // Navigate to the list? Or the user who saved it?
            // Let's go to the user for now
            router.push(`/user/${notification.sender?.username}`);
        }

        onClose();
    };

    const getTimeAgo = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + "y ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + "mo ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + "d ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + "h ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + "m ago";
        return Math.floor(seconds) + "s ago";
    };

    const getNotificationText = (notification: Notification) => {
        const actors = notification.actor_names || [];
        const count = notification.actor_count || 1;
        const triggerUser = notification.sender?.username || 'Someone';

        // Helper to format: "A, B and 2 others"
        let actorText = '';
        if (count === 1) {
            actorText = `@${triggerUser}`;
        } else if (count === 2) {
            // If we have names, use them
            const other = actors.find(a => a !== triggerUser) || 'someone';
            actorText = `@${triggerUser} and @${other}`;
        } else {
            // count > 2
            actorText = `@${triggerUser} and ${count - 1} others`;
        }

        // Bold the actor text
        const actorSpan = <span className="font-bold">{actorText}</span>;

        switch (notification.type) {
            case 'follow':
                return <>{actorSpan} started following you</>;
            case 'post':
                return <>{actorSpan} posted a new coffee log</>;
            case 'like':
                return <>{actorSpan} liked your coffee log</>;
            case 'save_list':
                return <>{actorSpan} saved your coffee log</>;
            default:
                return <>{actorSpan} interacted with you</>;
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={panelRef}
            className="absolute left-full top-0 ml-4 w-full md:w-80 bg-journal-card rounded-xl shadow-xl border border-journal-text/10 overflow-hidden z-40 animate-in fade-in slide-in-from-left-2 h-[calc(100vh-3rem)]"
        >
            <div className="p-3 border-b border-journal-text/5 flex justify-between items-center bg-cream/50">
                <h3 className="font-bold text-sm text-journal-text">Notifications</h3>
                <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-primary hover:underline"
                >
                    mark all read
                </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
                {loading ? (
                    <div className="p-8 text-center text-journal-text/40 text-sm">
                        Loading...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center text-journal-text/40 text-sm flex flex-col items-center gap-2">
                        <Bell className="w-8 h-8 opacity-20" />
                        <span>No notifications yet</span>
                    </div>
                ) : (
                    <div className="divide-y divide-journal-text/5">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-3 cursor-pointer flex gap-3 items-start transition-colors ${notification.read ? 'hover:bg-journal-text/5' : 'bg-primary/5 hover:bg-primary/10'}`}
                            >
                                <div className="mt-1">
                                    {notification.type === 'follow' && <UserPlus className="w-4 h-4 text-blue-500" />}
                                    {notification.type === 'post' && <Coffee className="w-4 h-4 text-amber-700" />}
                                    {notification.type === 'like' && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
                                    {notification.type === 'save_list' && <Bookmark className="w-4 h-4 text-orange-500 fill-orange-500" />}
                                </div>
                                <div>
                                    <p className="text-sm text-journal-text">
                                        {getNotificationText(notification)}
                                    </p>
                                    <p className="text-xs text-journal-text/40 mt-1">{getTimeAgo(notification.created_at)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
