/**
 * useFollowUser Hook
 * React hook for managing follow/unfollow state and operations
 * Platform-agnostic - delegates to followService
 */

import { useState, useEffect, useCallback } from 'react';
import * as followService from '@/services/followService';

interface UseFollowUserReturn {
    isFollowing: boolean;
    isLoading: boolean;
    error: string | null;
    followUser: () => Promise<void>;
    unfollowUser: () => Promise<void>;
    toggleFollow: () => Promise<void>;
}

/**
 * Hook for managing follow state for a specific user
 * @param currentUserId - ID of the logged-in user (null if not logged in)
 * @param targetUserId - ID of the user to follow/unfollow
 */
export function useFollowUser(
    currentUserId: string | null,
    targetUserId: string
): UseFollowUserReturn {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch initial follow status
    useEffect(() => {
        const fetchFollowStatus = async () => {
            if (!currentUserId || currentUserId === targetUserId) {
                setIsFollowing(false);
                return;
            }

            const status = await followService.getFollowStatus(currentUserId, targetUserId);
            setIsFollowing(status.isFollowing);
        };

        fetchFollowStatus();
    }, [currentUserId, targetUserId]);

    /**
     * Follow the target user
     */
    const followUser = useCallback(async () => {
        if (!currentUserId || currentUserId === targetUserId) {
            setError('Cannot follow this user');
            return;
        }

        // Optimistic update
        const previousState = isFollowing;
        setIsFollowing(true);
        setIsLoading(true);
        setError(null);

        try {
            const result = await followService.followUser(currentUserId, targetUserId);

            if (!result.success) {
                // Rollback on error
                setIsFollowing(previousState);
                setError(result.error || 'Failed to follow user');
            }
        } catch (err: any) {
            // Rollback on error
            setIsFollowing(previousState);
            setError(err.message || 'Failed to follow user');
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, targetUserId, isFollowing]);

    /**
     * Unfollow the target user
     */
    const unfollowUser = useCallback(async () => {
        if (!currentUserId || currentUserId === targetUserId) {
            setError('Cannot unfollow this user');
            return;
        }

        // Optimistic update
        const previousState = isFollowing;
        setIsFollowing(false);
        setIsLoading(true);
        setError(null);

        try {
            const result = await followService.unfollowUser(currentUserId, targetUserId);

            if (!result.success) {
                // Rollback on error
                setIsFollowing(previousState);
                setError(result.error || 'Failed to unfollow user');
            }
        } catch (err: any) {
            // Rollback on error
            setIsFollowing(previousState);
            setError(err.message || 'Failed to unfollow user');
        } finally {
            setIsLoading(false);
        }
    }, [currentUserId, targetUserId, isFollowing]);

    /**
     * Toggle follow status (convenience function)
     */
    const toggleFollow = useCallback(async () => {
        if (isFollowing) {
            await unfollowUser();
        } else {
            await followUser();
        }
    }, [isFollowing, followUser, unfollowUser]);

    return {
        isFollowing,
        isLoading,
        error,
        followUser,
        unfollowUser,
        toggleFollow
    };
}
