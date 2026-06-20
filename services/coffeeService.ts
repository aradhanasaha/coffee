/**
 * Coffee Service
 * Provides platform-agnostic coffee log operations
 */

import { supabase } from '@/adapters/supabaseClient';
import type {
    CoffeeLog,
    CoffeeLogWithUsername,
    LogFormData,
    ServiceResult,
    TopLocation
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
                    image_url: logData.image_url,
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

        // Follower notifications are created server-side by the
        // `on_new_coffee_log_notify` DB trigger (followers-only, aggregated).
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
                image_deleted_at: (updates as any).image_deleted_at,
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
        return data
            .filter((log: any) => !log.deleted_at)
            .map((log: any) => ({
                ...log,
                image_url: log.image_deleted_at ? null : log.image_url
            }));
    } catch (err) {
        return [];
    }
}

/**
 * Fetch public coffee feed with optional filters
 * If currentUserId is provided, prioritizes posts from followed users
 */
export async function fetchPublicCoffeeFeed(options?: {
    limit?: number;
    cursor?: string | null; // created_at of last item — fetch logs older than this
    city?: string;
    currentUserId?: string | null;
}): Promise<CoffeeLogWithUsername[]> {
    const PAGE_SIZE = options?.limit ?? 20;
    try {
        let query = supabase
            .from('coffee_logs')
            .select(`
                *,
                locations:location_id (
                    city
                )
            `)
            .is('deleted_at', null);

        if (options?.cursor) {
            // Pagination: fetch logs strictly older than the cursor
            query = query.lt('created_at', options.cursor);
        }

        const { data: logsData, error: logsError } = await query
            .order('created_at', { ascending: false })
            .limit(options?.cursor ? PAGE_SIZE : PAGE_SIZE * 2); // extra on first page for weighted sort

        if (logsError) {
            console.error('Error fetching logs:', logsError);
            return [];
        }

        if (!logsData || logsData.length === 0) {
            return [];
        }

        // Filter out deleted logs
        let activeLogs = logsData.filter((log: any) => !log.deleted_at);

        // If city filter is provided, prefer logs from that city, but fall back to all logs if none match
        if (options?.city && activeLogs.length > 0) {
            const cityFilteredLogs = activeLogs.filter(
                (log: any) => log.locations?.city === options.city
            );

            // Only use city-filtered logs if we found some
            if (cityFilteredLogs.length > 0) {
                activeLogs = cityFilteredLogs;
            }
        }

        if (activeLogs.length === 0) {
            return [];
        }

        // If currentUserId is provided, fetch follow relationships and prioritize
        let followedUserIds = new Set<string>();
        if (options?.currentUserId) {
            const { data: followsData, error: followsError } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', options.currentUserId);

            if (!followsError && followsData) {
                followedUserIds = new Set(followsData.map((f: any) => f.following_id));
            }
        }

        // Fetch usernames for these logs
        const userIds = Array.from(new Set(activeLogs.map((log: any) => log.user_id)));
        const { data: profilesData, error: profilesError } = await supabase
            .from('profiles')
            .select('user_id, username')
            .in('user_id', userIds);

        let enrichedLogs: CoffeeLogWithUsername[] = activeLogs;

        if (!profilesError && profilesData) {
            const profileMap = Object.fromEntries(
                profilesData.map((p: any) => [p.user_id, p.username])
            );

            enrichedLogs = activeLogs.map((log: any) => ({
                ...log,
                username: profileMap[log.user_id],
            }));
        }

        // Weighted sort only on first page (no cursor) — boosts followed/self posts
        if (!options?.cursor && options?.currentUserId) {
            const BOOST_MS = 12 * 60 * 60 * 1000;
            enrichedLogs.sort((a, b) => {
                const score = (log: CoffeeLogWithUsername) => {
                    const t = new Date(log.created_at).getTime();
                    const relevant = log.user_id === options.currentUserId || followedUserIds.has(log.user_id);
                    return t + (relevant ? BOOST_MS : 0);
                };
                return score(b) - score(a);
            });
        }

        enrichedLogs = enrichedLogs.slice(0, PAGE_SIZE);

        // Filter out soft-deleted images from the result
        return enrichedLogs.map((log: any) => ({
            ...log,
            image_url: log.image_deleted_at ? null : log.image_url
        }));
    } catch (err) {
        console.error('Error fetching public feed:', err);
        return [];
    }
}

/**
 * Fetch top locations based on log count
 */
export async function fetchTopLocations(limit: number = 5): Promise<TopLocation[]> {
    try {
        const { data, error } = await supabase
            .from('coffee_logs')
            .select(`
                place,
                image_url,
                image_deleted_at,
                location_id,
                locations:location_id (
                    city
                )
            `)
            .is('deleted_at', null);

        if (error || !data) return [];

        // Aggregate by place name
        const placeCounts: Record<string, { count: number; area: string; image?: string; locationId?: string }> = {};

        data.forEach((log: any) => {
            const placeName = log.place.toLowerCase().trim();
            if (!placeName || placeName === 'home') return;

            if (!placeCounts[placeName]) {
                placeCounts[placeName] = {
                    count: 0,
                    area: log.locations?.city || 'Unknown Area',
                    image: (!log.image_deleted_at && log.image_url) ? log.image_url : undefined,
                    locationId: log.location_id
                };
            }

            placeCounts[placeName].count++;

            // Prefer keeping an image if we found one
            if (!placeCounts[placeName].image && !log.image_deleted_at && log.image_url) {
                placeCounts[placeName].image = log.image_url;
            }

            // Update area if we found a better one
            if (placeCounts[placeName].area === 'Unknown Area' && log.locations?.city) {
                placeCounts[placeName].area = log.locations.city;
            }

            // Capture location ID if we missed it
            if (!placeCounts[placeName].locationId && log.location_id) {
                placeCounts[placeName].locationId = log.location_id;
            }
        });

        const sortedPlaces = Object.entries(placeCounts)
            .filter(([_, stats]) => stats.locationId) // FILTER: Only include places with a valid location_id
            .map(([name, stats]) => ({
                id: stats.locationId!, // We know it's defined now
                name: name,
                area: stats.area,
                count: stats.count,
                image: stats.image
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);

        return sortedPlaces;
    } catch (err) {
        console.error('Error fetching top locations:', err);
        return [];
    }
}
