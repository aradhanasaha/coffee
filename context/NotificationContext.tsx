"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/adapters/supabaseClient';
import { getUnreadCount } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import { Notification } from '@/core/types/types';

interface NotificationContextType {
    unreadCount: number;
    hasUnread: boolean;
    latestNotification: Notification | null;
    clearLatestNotification: () => void;
    refreshCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export default function NotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

    const fetchCount = async () => {
        if (!user) return;
        const result = await getUnreadCount(user.id);
        if (result.success && result.data !== undefined) {
            setUnreadCount(result.data);
        }
    };

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        // 1. Fetch initial count
        fetchCount();

        // 2. Subscribe to realtime changes
        // Use a single channel for both logic updates and toast triggers
        const channel = supabase
            .channel(`notifications-context:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for ALL events
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${user.id}`
                },
                async (payload) => {
                    // Always refresh the count
                    fetchCount();

                    // Handle Toasts:
                    const eventType = payload.eventType;
                    const newRecord = payload.new as any;

                    // Trigger toast on INSERT or relevant UPDATE (unread)
                    if (eventType === 'INSERT' || (eventType === 'UPDATE' && newRecord.read === false)) {

                        // Hydrate sender username
                        let username = 'Someone';
                        if (newRecord.trigger_actor_id) {
                            const { data } = await supabase
                                .from('profiles')
                                .select('username')
                                .eq('user_id', newRecord.trigger_actor_id)
                                .single();
                            if (data) username = data.username;
                        }



                        setLatestNotification({
                            ...newRecord,
                            sender: { username }
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const value = {
        unreadCount,
        hasUnread: unreadCount > 0,
        latestNotification,
        clearLatestNotification: () => setLatestNotification(null),
        refreshCount: fetchCount
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotificationContext() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
}
