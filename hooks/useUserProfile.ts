/**
 * User Profile Hook
 * Provides user profile state and operations to React components
 * Platform-agnostic - uses userService
 */

import { useState, useEffect, useCallback } from 'react';
import * as userService from '@/services/userService';
import { validateUsername, getUsernameChangeEligibility } from '@/core/domain/userDomain';
import type { UserProfile, UsernameChangeEligibility } from '@/core/types/types';

interface UseUserProfileReturn {
    profile: UserProfile | null;
    loading: boolean;
    error: string | null;
    usernameAvailable: boolean | null;
    usernameError: string | null;
    changeEligibility: UsernameChangeEligibility | null;
    checkUsernameAvailability: (username: string) => Promise<void>;
    updateUsername: (newUsername: string) => Promise<{ success: boolean; error?: string }>;
    refreshProfile: () => Promise<void>;
}

export function useUserProfile(userId: string | null): UseUserProfileReturn {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [changeEligibility, setChangeEligibility] = useState<UsernameChangeEligibility | null>(null);

    // Fetch profile
    const fetchProfile = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const profileData = await userService.getUserProfile(userId);

        if (profileData) {
            setProfile(profileData);
            setChangeEligibility(
                getUsernameChangeEligibility(profileData.username_last_changed_at)
            );
            setError(null);
        } else {
            setError('Failed to load profile');
        }

        setLoading(false);
    }, [userId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    const checkUsernameAvailability = useCallback(async (username: string) => {
        if (username.length < 3) {
            setUsernameError(null);
            setUsernameAvailable(null);
            return;
        }

        // Validate format first
        const validation = validateUsername(username);
        if (!validation.isValid) {
            setUsernameError(validation.error || 'Invalid username');
            setUsernameAvailable(null);
            return;
        }

        setUsernameError(null);

        // Check availability
        const availability = await userService.checkUsernameAvailability(username);

        if (availability.available) {
            setUsernameAvailable(true);
            setUsernameError(null);
        } else {
            setUsernameAvailable(false);
            setUsernameError(availability.error || 'Username not available');
        }
    }, []);

    const updateUsername = useCallback(async (newUsername: string) => {
        if (!userId) {
            return { success: false, error: 'No user ID' };
        }

        // Validate format
        const validation = validateUsername(newUsername);
        if (!validation.isValid) {
            return { success: false, error: validation.error };
        }

        // Check eligibility
        if (profile && !getUsernameChangeEligibility(profile.username_last_changed_at).canChange) {
            return { success: false, error: 'You can only change username once every 30 days' };
        }

        const result = await userService.updateUsername(userId, newUsername);

        if (result.success && result.data) {
            setProfile(result.data);
            setChangeEligibility(
                getUsernameChangeEligibility(result.data.username_last_changed_at)
            );
            return { success: true };
        }

        return { success: false, error: result.error };
    }, [userId, profile]);

    const refreshProfile = useCallback(async () => {
        await fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        loading,
        error,
        usernameAvailable,
        usernameError,
        changeEligibility,
        checkUsernameAvailability,
        updateUsername,
        refreshProfile,
    };
}
