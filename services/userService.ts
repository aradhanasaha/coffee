/**
 * User Service
 * Provides platform-agnostic user profile operations
 */

import { supabase } from '@/adapters/supabaseClient';
import type { UserProfile, UsernameAvailability, ServiceResult } from '@/core/types/types';

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error || !data) return null;

        return {
            user_id: data.user_id,
            username: data.username,
            username_last_changed_at: data.username_last_changed_at,
            is_admin: data.is_admin || false,
            created_at: data.created_at,
        };
    } catch (err) {
        return null;
    }
}

/**
 * Check if username is available
 */
export async function checkUsernameAvailability(
    username: string
): Promise<UsernameAvailability> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('username')
            .eq('username', username.toLowerCase());

        if (error) {
            console.error('Error checking username availability:', error);
            return { available: false, error: 'Could not check availability' };
        }

        if (data && data.length > 0) {
            return { available: false, error: 'Username is already taken' };
        }

        return { available: true };
    } catch (err: any) {
        return { available: false, error: err.message || 'Could not check availability' };
    }
}

/**
 * Update username for a user
 */
export async function updateUsername(
    userId: string,
    newUsername: string
): Promise<ServiceResult<UserProfile>> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({
                username: newUsername.toLowerCase(),
                username_last_changed_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return { success: false, error: 'Username already taken' };
            }
            return { success: false, error: error.message };
        }

        if (!data) {
            return { success: false, error: 'Update failed' };
        }

        return {
            success: true,
            data: {
                user_id: data.user_id,
                username: data.username,
                username_last_changed_at: data.username_last_changed_at,
                is_admin: data.is_admin || false,
                created_at: data.created_at,
            },
        };
    } catch (err: any) {
        return { success: false, error: err.message || 'Update failed' };
    }
}

/**
 * Get multiple user profiles by user IDs
 */
export async function getUserProfiles(userIds: string[]): Promise<UserProfile[]> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('user_id', userIds);

        if (error || !data) return [];

        return data.map(profile => ({
            user_id: profile.user_id,
            username: profile.username,
            username_last_changed_at: profile.username_last_changed_at,
            is_admin: profile.is_admin || false,
            created_at: profile.created_at,
        }));
    } catch (err) {
        return [];
    }
}
