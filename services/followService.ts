/**
 * Follow Service
 * Platform-agnostic follow operations using Supabase adapter
 */

import { supabase } from '@/adapters/supabaseClient';
import { validateFollowOperation } from '@/core/domain/followDomain';
import type {
    FollowRelationship,
    FollowStatus,
    ServiceResult
} from '@/core/types/types';
import { createNotification } from './notificationService';

/**
 * Follow a user
 * Inserts follow relationship and updates counts via database triggers
 */
export async function followUser(
    followerId: string,
    followingId: string
): Promise<ServiceResult<void>> {
    try {
        // Validate operation using domain logic
        const validation = validateFollowOperation(followerId, followingId);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        // Insert follow relationship
        // Triggers will automatically update follower_count and following_count
        const { error: insertError } = await supabase
            .from('follows')
            .insert({
                follower_id: followerId,
                following_id: followingId
            });

        if (insertError) {
            // Handle duplicate follow gracefully (unique constraint violation)
            if (insertError.code === '23505') {
                return { success: true }; // Already following, treat as success
            }
            return { success: false, error: insertError.message };
        }

        // Trigger notification
        await createNotification(followingId, followerId, 'follow', null);

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to follow user' };
    }
}

/**
 * Unfollow a user
 * Deletes follow relationship and updates counts via database triggers
 */
export async function unfollowUser(
    followerId: string,
    followingId: string
): Promise<ServiceResult<void>> {
    try {
        // Validate operation using domain logic
        const validation = validateFollowOperation(followerId, followingId);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        // Delete follow relationship
        // Triggers will automatically update follower_count and following_count
        const { error: deleteError } = await supabase
            .from('follows')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', followingId);

        if (deleteError) {
            return { success: false, error: deleteError.message };
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to unfollow user' };
    }
}

/**
 * Get follow status between two users
 * Returns whether follower is following target user
 */
export async function getFollowStatus(
    followerId: string | null,
    targetUserId: string
): Promise<FollowStatus> {
    try {
        // If no follower ID, return not following
        if (!followerId) {
            return { isFollowing: false };
        }

        // Check if follow relationship exists
        const { data, error } = await supabase
            .from('follows')
            .select('id')
            .eq('follower_id', followerId)
            .eq('following_id', targetUserId)
            .maybeSingle();

        if (error) {
            console.error('Error fetching follow status:', error);
            return { isFollowing: false };
        }

        return { isFollowing: !!data };
    } catch (err) {
        console.error('Error fetching follow status:', err);
        return { isFollowing: false };
    }
}

/**
 * Get all users that a user is following
 */
export async function getFollowing(userId: string): Promise<FollowRelationship[]> {
    try {
        const { data, error } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', userId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return data;
    } catch (err) {
        console.error('Error fetching following:', err);
        return [];
    }
}

/**
 * Get all followers of a user
 */
export async function getFollowers(userId: string): Promise<FollowRelationship[]> {
    try {
        const { data, error } = await supabase
            .from('follows')
            .select('*')
            .eq('following_id', userId)
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return data;
    } catch (err) {
        console.error('Error fetching followers:', err);
        return [];
    }
}

/**
 * Get follower count for a user
 * Note: Normally use the denormalized count from profiles table
 * This is for verification/debugging
 */
export async function getFollowerCount(userId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', userId);

        return count || 0;
    } catch (err) {
        console.error('Error fetching follower count:', err);
        return 0;
    }
}

/**
 * Get following count for a user
 * Note: Normally use the denormalized count from profiles table
 * This is for verification/debugging
 */
export async function getFollowingCount(userId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', userId);

        return count || 0;
    } catch (err) {
        console.error('Error fetching following count:', err);
        return 0;
    }
}
