import { useState, useEffect } from 'react';
import { supabase } from '@/adapters/supabaseClient';
import { getUnreadCount } from '@/services/notificationService';
import { useAuth } from './useAuth';

export function useUnreadNotifications() {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

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
            .channel(`notifications:${user.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'notifications',
                    filter: `recipient_id=eq.${user.id}`
                },
                () => {
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
        hasUnread: unreadCount > 0
    };
}
