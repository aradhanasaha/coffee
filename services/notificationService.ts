import { supabase } from '@/adapters/supabaseClient';
import type { Notification, ServiceResult, NotificationType } from '@/core/types/types';

/**
 * Create a notification
 */
export async function createNotification(
    recipientId: string,
    senderId: string,
    type: NotificationType,
    entityId: string | null
): Promise<ServiceResult<void>> {
    try {
        if (recipientId === senderId) return { success: true }; // Don't notify self

        const { error } = await supabase
            .from('notifications')
            .insert({
                recipient_id: recipientId,
                sender_id: senderId,
                type: type,
                entity_id: entityId
            });

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error('Error creating notification:', err);
        return { success: false, error: err.message };
    }
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
                sender:profiles!notifications_sender_id_fkey(username)
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
