/**
 * Coffee Service
 * Provides platform-agnostic coffee log operations
 */

import { supabase } from '@/adapters/supabaseClient';
import type {
    CoffeeLog,
    CoffeeLogWithUsername,
    LogFormData,
    ServiceResult
} from '@/core/types/types';

/**
 * Create a new coffee log
 */
export async function createCoffeeLog(
    userId: string,
    logData: LogFormData
): Promise<ServiceResult<CoffeeLog>> {
    try {
        const { data, error } = await supabase
            .from('coffee_logs')
            .insert([
                {
                    user_id: userId,
                    coffee_name: logData.coffee_name,
                    place: logData.place,
                    price_feel: logData.price_feel || null,
                    rating: logData.rating,
                    review: logData.review || null,
                    flavor_notes: logData.flavor_notes || null,
                    location_id: logData.location_id || null,
                }
            ])
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data) {
            return { success: false, error: 'Failed to create log' };
        }

        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to create log' };
    }
}

/**
 * Update an existing coffee log
 */
export async function updateCoffeeLog(
    logId: string,
    updates: Partial<LogFormData>
): Promise<ServiceResult<CoffeeLog>> {
    try {
        const { data, error } = await supabase
            .from('coffee_logs')
            .update({
                coffee_name: updates.coffee_name,
                place: updates.place,
                price_feel: updates.price_feel || null,
                rating: updates.rating,
                review: updates.review || null,
                flavor_notes: updates.flavor_notes || null,
                location_id: updates.location_id || null,
            })
            .eq('id', logId)
            .select()
            .single();

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data) {
            return { success: false, error: 'Failed to update log' };
        }

        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update log' };
    }
}

/**
 * Soft delete a coffee log
 */
export async function deleteCoffeeLog(
    logId: string,
    userId: string
): Promise<ServiceResult<void>> {
    try {
        const { error } = await supabase
            .from('coffee_logs')
            .update({
                deleted_at: new Date().toISOString(),
                deleted_by: userId,
                deletion_reason: 'user_deleted',
            })
            .eq('id', logId);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to delete log' };
    }
}

/**
 * Fetch all coffee logs for a user
 */
export async function fetchUserCoffeeLogs(userId: string): Promise<CoffeeLog[]> {
    try {
        const { data, error } = await supabase
            .from('coffee_logs')
            .select('*')
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (error || !data) return [];

        // Filter out any deleted logs as a frontend fallback
        return data.filter(log => !log.deleted_at);
    } catch (err) {
        return [];
    }
}

/**
 * Fetch public coffee feed with optional filters
 */
export async function fetchPublicCoffeeFeed(options?: {
    limit?: number;
    city?: string;
}): Promise<CoffeeLogWithUsername[]> {
    try {
        // First, try to get logs with location data if city filter is provided
        let query = supabase
            .from('coffee_logs')
            .select(`
                *,
                locations:location_id (
                    city
                )
            `)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        const { data: logsData, error: logsError } = await query;

        if (logsError) {
            console.error('Error fetching logs:', logsError);
            return [];
        }

        if (!logsData || logsData.length === 0) {
            console.log('No logs found in database');
            return [];
        }

        // Filter out deleted logs
        let activeLogs = logsData.filter(log => !log.deleted_at);

        // If city filter is provided, prefer logs from that city, but fall back to all logs if none match
        if (options?.city && activeLogs.length > 0) {
            const cityFilteredLogs = activeLogs.filter(
                log => log.locations?.city === options.city
            );

            // Only use city-filtered logs if we found some
            if (cityFilteredLogs.length > 0) {
                activeLogs = cityFilteredLogs;
            }
        }

        if (activeLogs.length === 0) {
            return [];
        }

        // Fetch usernames for these logs
        const userIds = Array.from(new Set(activeLogs.map(log => log.user_id)));
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, username')
            .in('user_id', userIds);

        if (!profilesError && profilesData) {
            const profileMap = Object.fromEntries(
                profilesData.map(p => [p.user_id, p.username])
            );

            return activeLogs.map(log => ({
                ...log,
                username: profileMap[log.user_id],
            }));
        }

        return activeLogs;
    } catch (err) {
        console.error('Error fetching public feed:', err);
        return [];
    }
}
