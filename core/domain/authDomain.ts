/**
 * Authentication Domain Logic
 * Platform-agnostic business rules for authentication
 */

import { ValidationResult } from '../types/types';

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
    if (!email || email.trim().length === 0) {
        return { isValid: false, error: 'Email is required' };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
    if (!password || password.length === 0) {
        return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 6) {
        return { isValid: false, error: 'Password must be at least 6 characters' };
    }

    return { isValid: true };
}

/**
 * Validates login credentials
 */
export function validateLoginCredentials(email: string, password: string): ValidationResult {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        return emailValidation;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return passwordValidation;
    }

    return { isValid: true };
}

/**
 * Validates signup data
 */
export function validateSignupData(
    email: string,
    password: string,
    username: string
): ValidationResult {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
        return emailValidation;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return passwordValidation;
    }

    // Username validation is in userDomain, but we check length here
    if (!username || username.trim().length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters' };
    }

    return { isValid: true };
}

/**
 * Validates username for login (different from signup validation)
 */
export function validateUsername(username: string): ValidationResult {
    if (!username || username.trim().length === 0) {
        return { isValid: false, error: 'Username is required' };
    }

    if (username.trim().length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters' };
    }

    // Username should only contain alphanumeric characters, underscores, and hyphens
    const usernamePattern = /^[a-zA-Z0-9_-]+$/;
    if (!usernamePattern.test(username)) {
        return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
    }

    return { isValid: true };
}

/**
 * Validates username login credentials
 */
export function validateUsernameLoginCredentials(username: string, password: string): ValidationResult {
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
        return usernameValidation;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return passwordValidation;
    }

    return { isValid: true };
}

/**
 * Validates password reset email
 */
export function validatePasswordResetEmail(email: string): ValidationResult {
    return validateEmail(email);
}

/**
 * Validates new password for reset
 */
export function validateNewPassword(password: string, confirmPassword: string): ValidationResult {
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
        return passwordValidation;
    }

    if (password !== confirmPassword) {
        return { isValid: false, error: 'Passwords do not match' };
    }

    return { isValid: true };
}
