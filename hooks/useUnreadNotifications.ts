import { useState, useEffect } from 'react';
import { supabase } from '@/adapters/supabaseClient';
import { getUnreadCount } from '@/services/notificationService';
import { useAuth } from './useAuth';
import { Notification } from '@/core/types/types';

export function useUnreadNotifications() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [latestNotification, setLatestNotification] = useState<Notification | null>(null);

    useEffect(() => {
        if (!user) {
            setUnreadCount(0);
            return;
        }

        // 1. Fetch initial count
        const fetchCount = async () => {
            const result = await getUnreadCount(user.id);
            if (result.success && result.data !== undefined) {
                setUnreadCount(result.data);
            }
        };

        fetchCount();

        // 2. Subscribe to realtime changes
        const channel = supabase
            .channel(`notifications:${user.id}`) // Unique channel name
            .on(
                'postgres_changes',
                {
                    event: 'INSERT', // Listen for new notifications specifically for toasts
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${user.id}`
                },
                async (payload) => {
                    fetchCount();

                    // Hydrate sender username for the toast
                    const newNotif = payload.new as any;
                    let username = 'Someone';

                    if (newNotif.trigger_actor_id) {
                        const { data } = await supabase
                            .from('profiles')
                            .select('username')
                            .eq('user_id', newNotif.trigger_actor_id)
                            .single();
                        if (data) username = data.username;
                    }

                    setLatestNotification({
                        ...newNotif,
                        sender: { username }
                    });
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for other changes to update count
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${user.id}`
                },
                () => {
                    // Just update count for other events (UPDATE, DELETE)
                    fetchCount();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return {
        unreadCount,
        hasUnread: unreadCount > 0,
        latestNotification,
        clearLatestNotification: () => setLatestNotification(null)
    };
}
