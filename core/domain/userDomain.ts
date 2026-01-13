/**
 * User Domain Logic
 * Platform-agnostic business rules for user profiles and username management
 */

import { ValidationResult, UsernameChangeEligibility } from '../types/types';

/**
 * Validates a username according to business rules
 */
export function validateUsername(username: string): ValidationResult {
    if (!username || username.trim().length === 0) {
        return { isValid: false, error: 'Username is required' };
    }

    const trimmed = username.trim();

    if (trimmed.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters' };
    }

    if (trimmed.length > 20) {
        return { isValid: false, error: 'Username must be at most 20 characters' };
    }

    // Only allow lowercase letters, numbers, and underscores
    const validPattern = /^[a-z0-9_]+$/;
    if (!validPattern.test(trimmed)) {
        return {
            isValid: false,
            error: 'Username can only contain lowercase letters, numbers, and underscores'
        };
    }

    // Can't start with a number
    if (/^[0-9]/.test(trimmed)) {
        return { isValid: false, error: 'Username cannot start with a number' };
    }

    // Reserved usernames
    const reserved = ['admin', 'root', 'system', 'null', 'undefined', 'home', 'user', 'login', 'signup'];
    if (reserved.includes(trimmed.toLowerCase())) {
        return { isValid: false, error: 'This username is reserved' };
    }

    return { isValid: true };
}

/**
 * Checks if a user can change their username based on the 30-day rule
 */
export function canChangeUsername(lastChangedAt: string | null): boolean {
    if (!lastChangedAt) return true;

    const lastChanged = new Date(lastChangedAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return lastChanged < thirtyDaysAgo;
}

/**
 * Calculates days remaining until next username change is allowed
 */
export function getDaysUntilNextUsernameChange(lastChangedAt: string | null): number {
    if (!lastChangedAt) return 0;

    const lastChanged = new Date(lastChangedAt);
    const nextAvailable = new Date(lastChanged);
    nextAvailable.setDate(nextAvailable.getDate() + 30);

    const diff = nextAvailable.getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return Math.max(0, days);
}

/**
 * Gets username change eligibility information
 */
export function getUsernameChangeEligibility(lastChangedAt: string | null): UsernameChangeEligibility {
    return {
        canChange: canChangeUsername(lastChangedAt),
        daysUntilNextChange: getDaysUntilNextUsernameChange(lastChangedAt)
    };
}
