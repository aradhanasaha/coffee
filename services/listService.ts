import { supabase } from '@/adapters/supabaseClient';
import type {
    List,
    ListItem,
    ListFormData,
    ServiceResult,
    ListWithItems,
    CoffeeLog
} from '@/core/types/types';
import { createNotification } from './notificationService';

/**
 * Create a new list
 */
export async function createList(
    userId: string,
    formData: ListFormData
): Promise<ServiceResult<List>> {
    try {
        const { data, error } = await supabase
            .from('lists')
            .insert([{
                owner_id: userId,
                title: formData.title,
                description: formData.description || null,
                visibility: formData.visibility
            }])
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Fetch lists owned by a user
 */
export async function fetchUserLists(userId: string): Promise<ServiceResult<ListWithItems[]>> {
    try {
        const { data, error } = await supabase
            .from('lists')
            .select(`
                *,
                owner:profiles!lists_owner_id_fkey(username),
                items:list_items(count)
            `)
            .eq('owner_id', userId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map to ListWithItems structure
        const lists = (data as any[]).map((list) => ({
            ...list,
            items: [],
            item_count: list.items?.[0]?.count || 0,
            owner: list.owner
        }));

        return { success: true, data: lists };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Fetch public lists for discovery
 */
export async function fetchPublicLists(): Promise<ServiceResult<ListWithItems[]>> {
    try {
        const { data, error } = await supabase
            .from('lists')
            .select(`
                *,
                owner:profiles!lists_owner_id_fkey(username),
                items:list_items(count)
            `)
            .eq('visibility', 'public')
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        // Type safety for the complex join result
        interface PublicListResponse extends List {
            owner: { username: string };
            items: { count: number }[];
        }

        const lists = (data as unknown as PublicListResponse[]).map((list) => ({
            ...list,
            items: [], // Structure requires items array, but we only fetched count
            item_count: list.items[0]?.count || 0,
            owner: list.owner
        }));

        return { success: true, data: lists };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Add a coffee log to a list
 */
export async function addListItem(
    listId: string,
    coffeeLogId: string
): Promise<ServiceResult<ListItem>> {
    try {
        const { data, error } = await supabase
            .from('list_items')
            .insert([{
                list_id: listId,
                coffee_log_id: coffeeLogId
            }])
            .select()
            .single();

        if (error) throw error;
        if (error) throw error;

        // Fetch coffee log details to get owner and trigger notification
        const { data: logData } = await supabase
            .from('coffee_logs')
            .select('user_id')
            .eq('id', coffeeLogId)
            .single();

        // Fetch list owner (who is performing the action usually)
        const { data: listOwner } = await supabase
            .from('lists')
            .select('owner_id')
            .eq('id', listId)
            .single();

        if (logData && listOwner && logData.user_id !== listOwner.owner_id) {
            // Create notification: Recipient=LogOwner, Sender=ListOwner(Saver)
            await createNotification(logData.user_id, listOwner.owner_id, 'save_list', coffeeLogId);
        }

        return { success: true, data };
    } catch (err: any) {
        // Check for duplicate error code if needed, but UI should prevent it
        return { success: false, error: err.message };
    }
}

/**
 * Remove a coffee log from a list
 */
export async function removeListItem(
    listId: string,
    coffeeLogId: string
): Promise<ServiceResult<void>> {
    try {
        const { error } = await supabase
            .from('list_items')
            .delete()
            .match({ list_id: listId, coffee_log_id: coffeeLogId });

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Fetch list details with items and hydrated logs
 */
export async function fetchListDetails(listId: string): Promise<ServiceResult<ListWithItems>> {
    try {
        // Fetch list info + owner
        const { data: listData, error: listError } = await supabase
            .from('lists')
            .select(`
                *,
                owner:profiles!lists_owner_id_fkey(username)
            `)
            .eq('id', listId)
            .single();

        if (listError) throw listError;
        if (!listData) throw new Error('List not found');

        const list = listData as List & { owner: { username: string } };

        // Fetch items with log details
        const { data: items, error: itemsError } = await supabase
            .from('list_items')
            .select(`
                *,
                log:coffee_logs(*)
            `)
            .eq('list_id', listId)
            .order('added_at', { ascending: false });

        if (itemsError) throw itemsError;

        // Filter and map items
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const validItems = (items || []).filter((item: any) => item.log && !item.log.deleted_at);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const logs = validItems.map((item: any) => item.log);

        return {
            success: true,
            data: {
                ...list,
                items: validItems.map((item: any) => ({
                    id: item.id,
                    list_id: item.list_id,
                    coffee_log_id: item.coffee_log_id,
                    added_at: item.added_at
                })),
                logs: logs,
                owner: list.owner
            }
        };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Save a list (bookmark)
 */
export async function saveList(userId: string, listId: string): Promise<ServiceResult<void>> {
    try {
        const { error } = await supabase
            .from('list_saves')
            .insert([{ user_id: userId, list_id: listId }]);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Fetch lists saved by a user
 */
export async function fetchSavedLists(userId: string): Promise<ServiceResult<ListWithItems[]>> {
    try {
        const { data, error } = await supabase
            .from('list_saves')
            .select(`
                list:lists(
                    *,
                    owner:profiles!lists_owner_id_fkey(username),
                    items:list_items(count)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the nested result to match ListWithItems
        const lists = (data as any[]).map((item) => {
            const list = item.list;
            return {
                ...list,
                items: [],
                item_count: list.items?.[0]?.count || 0,
                owner: list.owner
            };
        });

        return { success: true, data: lists };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Update a list's details
 */
export async function updateList(
    listId: string,
    updates: Partial<{ title: string; description: string; visibility: 'public' | 'private' }>
): Promise<ServiceResult<void>> {
    try {
        const { error } = await supabase
            .from('lists')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', listId);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Soft delete a list (using RPC)
 */
export async function deleteList(listId: string): Promise<ServiceResult<void>> {
    try {
        const { error } = await supabase
            .rpc('delete_list', { target_list_id: listId });

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
