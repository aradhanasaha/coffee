import { supabase } from '@/adapters/supabaseClient';
import type { Notification, ServiceResult, NotificationType } from '@/core/types/types';

/**
 * Create a notification (DEPRECATED - Handled by DB Triggers)
 */
export async function createNotification(
    recipientId: string,
    senderId: string,
    type: NotificationType,
    entityId: string | null
): Promise<ServiceResult<void>> {
    // Logic moved to Database Triggers
    return { success: true };
}

/**
 * Fetch notifications for a user
 */
export async function fetchNotifications(userId: string): Promise<ServiceResult<Notification[]>> {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                sender:profiles!notifications_trigger_actor_id_fkey(username)
            `)
            .eq('recipient_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        // Hydrate sender info
        const notifications = (data as any[]).map(n => ({
            ...n,
            sender: n.sender
        }));

        return { success: true, data: notifications };
    } catch (err: any) {
        console.error('Error fetching notifications:', err);
        return { success: false, error: err.message };
    }
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<ServiceResult<void>> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId: string): Promise<ServiceResult<void>> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('recipient_id', userId)
            .eq('read', false);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<ServiceResult<number>> {
    try {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', userId)
            .eq('read', false);

        if (error) throw error;
        return { success: true, data: count || 0 };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
