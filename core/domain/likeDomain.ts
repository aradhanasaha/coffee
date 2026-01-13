/**
 * Like Domain Logic
 * Platform-agnostic validation and business rules for the like system
 * NO external dependencies (no database, no React, no adapters)
 */

import type { LikeTargetType, ValidationResult } from '../types/types';

/**
 * Validate that a target can be liked
 */
export function validateLikeTarget(
    targetId: string,
    targetType: LikeTargetType
): ValidationResult {
    if (!targetId || targetId.trim() === '') {
        return {
            isValid: false,
            error: 'Target ID is required'
        };
    }

    // UUID format validation (basic)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(targetId)) {
        return {
            isValid: false,
            error: 'Invalid target ID format'
        };
    }

    const validTypes: LikeTargetType[] = ['coffee_log', 'list', 'photo', 'cafe'];
    if (!validTypes.includes(targetType)) {
        return {
            isValid: false,
            error: 'Invalid target type'
        };
    }

    return { isValid: true };
}

/**
 * Check if a user can like (must be authenticated)
 */
export function canUserLike(userId: string | null): ValidationResult {
    if (!userId) {
        return {
            isValid: false,
            error: 'You must be logged in to like'
        };
    }

    return { isValid: true };
}

/**
 * Validate like operation (combines target and user validation)
 */
export function validateLikeOperation(
    userId: string | null,
    targetId: string,
    targetType: LikeTargetType
): ValidationResult {
    // Check user authentication
    const userCheck = canUserLike(userId);
    if (!userCheck.isValid) {
        return userCheck;
    }

    // Check target validity
    const targetCheck = validateLikeTarget(targetId, targetType);
    if (!targetCheck.isValid) {
        return targetCheck;
    }

    return { isValid: true };
}
