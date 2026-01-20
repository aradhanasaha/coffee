import { useState, useCallback } from 'react';
import * as listService from '@/services/listService';
import type { ListWithItems, ListFormData } from '@/core/types/types';

export function useLists(userId: string | null) {
    const [lists, setLists] = useState<ListWithItems[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLists = useCallback(async () => {
        if (!userId) return;
        setLoading(true);
        const result = await listService.fetchUserLists(userId);
        if (result.success && result.data) {
            setLists(result.data);
            setError(null);
        } else {
            setError(result.error || 'Failed to fetch lists');
        }
        setLoading(false);
    }, [userId]);

    const createList = useCallback(async (data: ListFormData) => {
        if (!userId) return { success: false, error: 'Not authenticated' };

        const result = await listService.createList(userId, data);
        if (result.success && result.data) {
            const newList: ListWithItems = { ...result.data, items: [] };
            setLists(prev => [newList, ...prev]);
            return { success: true, data: result.data };
        }
        return result;
    }, [userId]);

    const addToList = useCallback(async (listId: string, coffeeLogId: string) => {
        // Optimistic update
        setLists(prev => prev.map(list => {
            if (list.id === listId) {
                // Check if already exists to prevent duplicates in state
                if (list.items.some(item => item.coffee_log_id === coffeeLogId)) return list;

                return {
                    ...list,
                    items: [...list.items, {
                        id: 'optimistic-' + Date.now(),
                        list_id: listId,
                        coffee_log_id: coffeeLogId,
                        added_at: new Date().toISOString()
                    }]
                };
            }
            return list;
        }));

        const result = await listService.addListItem(listId, coffeeLogId);

        if (!result.success) {
            // Revert on failure
            setLists(prev => prev.map(list => {
                if (list.id === listId) {
                    return {
                        ...list,
                        items: list.items.filter(item => item.coffee_log_id !== coffeeLogId)
                    };
                }
                return list;
            }));
            return result;
        }

        // Update with real ID
        setLists(prev => prev.map(list => {
            if (list.id === listId) {
                return {
                    ...list,
                    items: list.items.map(item =>
                        (item.coffee_log_id === coffeeLogId && item.id.startsWith('optimistic'))
                            ? result.data!
                            : item
                    )
                };
            }
            return list;
        }));

        return result;
    }, []);

    const removeFromList = useCallback(async (listId: string, coffeeLogId: string) => {
        // Optimistic update
        setLists(prev => prev.map(list => {
            if (list.id === listId) {
                return {
                    ...list,
                    items: list.items.filter(item => item.coffee_log_id !== coffeeLogId)
                };
            }
            return list;
        }));

        const result = await listService.removeListItem(listId, coffeeLogId);

        if (!result.success) {
            // Revert on failure (needs refetch or complex undo, simplified as refetch for now or simple error toast)
            fetchLists(); // Fallback to refetch to restore correct state
            return result;
        }

        return result;
    }, [fetchLists]);

    return {
        lists,
        loading,
        error,
        fetchLists,
        createList,
        addToList,
        removeFromList
    };
}
