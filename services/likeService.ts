/**
 * Like Service
 * Platform-agnostic like operations using Supabase adapter
 */

import { supabase } from '@/adapters/supabaseClient';
import { validateLikeOperation } from '@/core/domain/likeDomain';
import type {
    Like,
    LikeStatus,
    LikeTargetType,
    ServiceResult
} from '@/core/types/types';

/**
 * Toggle like status for a target
 * If liked → unlike, if not liked → like
 */
export async function toggleLike(
    userId: string,
    targetId: string,
    targetType: LikeTargetType
): Promise<ServiceResult<boolean>> {
    try {
        // Validate operation using domain logic
        const validation = validateLikeOperation(userId, targetId, targetType);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        // Check if already liked
        const { data: existing, error: checkError } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', userId)
            .eq('target_id', targetId)
            .eq('target_type', targetType)
            .maybeSingle();

        if (checkError) {
            return { success: false, error: checkError.message };
        }

        if (existing) {
            // Unlike: delete the like
            const { error: deleteError } = await supabase
                .from('likes')
                .delete()
                .eq('user_id', userId)
                .eq('target_id', targetId)
                .eq('target_type', targetType);

            if (deleteError) {
                return { success: false, error: deleteError.message };
            }

            return { success: true, data: false }; // false = unliked
        } else {
            // Like: insert new like
            const { error: insertError } = await supabase
                .from('likes')
                .insert({
                    user_id: userId,
                    target_id: targetId,
                    target_type: targetType
                });

            if (insertError) {
                return { success: false, error: insertError.message };
            }

            return { success: true, data: true }; // true = liked
        }
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to toggle like' };
    }
}

/**
 * Get like status for a specific target
 * Returns whether current user has liked it + total like count
 */
export async function getLikeStatus(
    userId: string | null,
    targetId: string,
    targetType: LikeTargetType
): Promise<LikeStatus> {
    try {
        // Get total like count
        const { count, error: countError } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('target_id', targetId)
            .eq('target_type', targetType);

        const likeCount = count || 0;

        // If no user logged in, return not liked
        if (!userId) {
            return { isLiked: false, likeCount };
        }

        // Check if current user has liked
        const { data: userLike, error: likeError } = await supabase
            .from('likes')
            .select('id')
            .eq('user_id', userId)
            .eq('target_id', targetId)
            .eq('target_type', targetType)
            .maybeSingle();

        return {
            isLiked: !!userLike,
            likeCount
        };
    } catch (err) {
        console.error('Error fetching like status:', err);
        return { isLiked: false, likeCount: 0 };
    }
}

/**
 * Get all likes for a target (who liked it)
 */
export async function getLikesForTarget(
    targetId: string,
    targetType: LikeTargetType
): Promise<Like[]> {
    try {
        const { data, error } = await supabase
            .from('likes')
            .select('*')
            .eq('target_id', targetId)
            .eq('target_type', targetType)
            .order('created_at', { ascending: false });

        if (error || !data) return [];
        return data;
    } catch (err) {
        console.error('Error fetching likes:', err);
        return [];
    }
}

/**
 * Get all items a user has liked
 * Optionally filter by target type
 */
export async function getUserLikes(
    userId: string,
    targetType?: LikeTargetType
): Promise<Like[]> {
    try {
        let query = supabase
            .from('likes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (targetType) {
            query = query.eq('target_type', targetType);
        }

        const { data, error } = await query;

        if (error || !data) return [];
        return data;
    } catch (err) {
        console.error('Error fetching user likes:', err);
        return [];
    }
}
