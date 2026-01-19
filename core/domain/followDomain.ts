/**
 * Follow Domain
 * Platform-agnostic business logic for follow/unfollow operations
 */

import type { ValidationResult } from '@/core/types/types';

/**
 * Validate a follow operation
 * Ensures follower and following IDs are valid and different
 */
export function validateFollowOperation(
    followerId: string,
    followingId: string
): ValidationResult {
    // Check if follower ID is provided
    if (!followerId || followerId.trim().length === 0) {
        return {
            isValid: false,
            error: 'Follower ID is required'
        };
    }

    // Check if following ID is provided
    if (!followingId || followingId.trim().length === 0) {
        return {
            isValid: false,
            error: 'Following ID is required'
        };
    }

    // Prevent self-follow
    if (followerId === followingId) {
        return {
            isValid: false,
            error: 'Cannot follow yourself'
        };
    }

    return { isValid: true };
}

/**
 * Check if a user can follow another user
 * Wrapper around validateFollowOperation with more semantic naming
 */
export function canFollowUser(
    currentUserId: string,
    targetUserId: string
): ValidationResult {
    return validateFollowOperation(currentUserId, targetUserId);
}

/**
 * Validate unfollow operation
 * Same validation as follow (ensures valid IDs)
 */
export function validateUnfollowOperation(
    followerId: string,
    followingId: string
): ValidationResult {
    return validateFollowOperation(followerId, followingId);
}
