/**
 * User Profile Service
 * Fetches public user profile data by username
 * Platform-agnostic service layer
 */

import { supabase } from '@/adapters/supabaseClient';
import type {
    PublicUserProfile,
    UserStats,
    CoffeeLog,
    ServiceResult
} from '@/core/types/types';

/**
 * Get public user profile by username
 * Used for /user/[username] pages
 */
export async function getUserByUsername(
    username: string
): Promise<ServiceResult<PublicUserProfile>> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('user_id, username, created_at')
            .eq('username', username.toLowerCase())
            .maybeSingle();

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data) {
            return { success: false, error: 'User not found' };
        }

        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to fetch user profile' };
    }
}

/**
 * Get user statistics for profile page
 */
export async function getUserStats(userId: string): Promise<UserStats> {
    try {
        // Get total coffee logs
        const { count: logCount } = await supabase
            .from('coffee_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .is('deleted_at', null);

        // Get follower and following counts from profiles table
        const { data: profileData } = await supabase
            .from('profiles')
            .select('follower_count, following_count')
            .eq('user_id', userId)
            .single();

        return {
            totalLogs: logCount || 0,
            followerCount: profileData?.follower_count || 0,
            followingCount: profileData?.following_count || 0
        };
    } catch (err) {
        console.error('Error fetching user stats:', err);
        return {
            totalLogs: 0,
            followerCount: 0,
            followingCount: 0
        };
    }
}

/**
 * Get recent coffee logs for a user (for profile page)
 */
export async function getUserRecentLogs(
    userId: string,
    limit: number = 20
): Promise<CoffeeLog[]> {
    try {
        const { data, error } = await supabase
            .from('coffee_logs')
            .select(`
                *,
                locations:location_id (
                    city
                )
            `)
            .eq('user_id', userId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error || !data) return [];
        return data;
    } catch (err) {
        console.error('Error fetching user logs:', err);
        return [];
    }
}
