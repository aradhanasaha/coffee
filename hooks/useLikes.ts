/**
 * useLikes Hook
 * React hook for like state and operations
 * Platform-agnostic - delegates to likeService
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import * as likeService from '@/services/likeService';
import type { LikeStatus, LikeTargetType } from '@/core/types/types';

interface UseLikesReturn {
    likeStatus: LikeStatus;
    loading: boolean;
    toggleLike: () => Promise<void>;
}

export function useLikes(
    targetId: string,
    targetType: LikeTargetType
): UseLikesReturn {
    const { user } = useAuth();
    const [likeStatus, setLikeStatus] = useState<LikeStatus>({
        isLiked: false,
        likeCount: 0
    });
    const [loading, setLoading] = useState(true);

    // Fetch initial like status
    useEffect(() => {
        const fetchStatus = async () => {
            setLoading(true);
            const status = await likeService.getLikeStatus(
                user?.id || null,
                targetId,
                targetType
            );
            setLikeStatus(status);
            setLoading(false);
        };

        fetchStatus();
    }, [user?.id, targetId, targetType]);

    // Toggle like
    const toggleLike = useCallback(async () => {
        if (!user) {
            // Optionally show login prompt
            console.warn('User must be logged in to like');
            return;
        }

        // Optimistic update
        setLikeStatus(prev => ({
            isLiked: !prev.isLiked,
            likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1
        }));

        const result = await likeService.toggleLike(
            user.id,
            targetId,
            targetType
        );

        if (!result.success) {
            // Revert optimistic update on error
            setLikeStatus(prev => ({
                isLiked: !prev.isLiked,
                likeCount: prev.isLiked ? prev.likeCount - 1 : prev.likeCount + 1
            }));
            console.error('Failed to toggle like:', result.error);
        } else {
            // Update with actual result
            setLikeStatus(prev => ({
                isLiked: result.data!,
                likeCount: result.data! ? prev.likeCount : prev.likeCount
            }));
        }
    }, [user, targetId, targetType]);

    return {
        likeStatus,
        loading,
        toggleLike
    };
}
