/**
 * Authentication Service
 * Provides platform-agnostic authentication operations
 * Implementation uses Supabase, but interface is portable
 */

import { supabase } from '@/adapters/supabaseClient';
import type { AuthResult, Session, User } from '@/core/types/types';

/**
 * Login with email and password
 */
export async function login(email: string, password: string): Promise<AuthResult> {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (!data.session || !data.user) {
            return { success: false, error: 'Login failed' };
        }

        return {
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email || '',
                created_at: data.user.created_at || new Date().toISOString(),
            },
            session: {
                user: {
                    id: data.user.id,
                    email: data.user.email || '',
                    created_at: data.user.created_at || new Date().toISOString(),
                },
                access_token: data.session.access_token,
                expires_at: data.session.expires_at,
            },
        };
    } catch (err: any) {
        return { success: false, error: err.message || 'Login failed' };
    }
}

/**
 * Get email by username from profiles table
 * Used for username-based login
 */
export async function getEmailByUsername(username: string): Promise<{ email: string | null; error?: string }> {
    try {
        // First get the user_id from profiles
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_id')
            .eq('username', username.toLowerCase())
            .single();

        if (profileError || !profile) {
            return { email: null, error: 'Username not found' };
        }

        // Get user email from auth.users via the admin API or stored email
        // Since we can't directly query auth.users, we need to get email from the session
        // We'll use the approach of looking up via a view or storing email in profiles
        // For now, we'll query the user's email by attempting to find it in our stored data

        // Alternative approach: We'll use a database function or RPC call
        // But simpler approach is to join with auth.users which isn't directly possible
        // So we'll store/cache email in profiles or use a different approach

        // Best approach: Query auth.users via the admin API or use Supabase's built-in lookup
        // Since profiles doesn't have email, we need to call an RPC function
        const { data: userEmail, error: emailError } = await supabase
            .rpc('get_user_email_by_username', { p_username: username.toLowerCase() });

        if (emailError) {
            // Fallback: Try to get from auth if the RPC doesn't exist
            // This won't work directly, so we'll return an error
            console.error('Error getting email:', emailError);
            return { email: null, error: 'Could not retrieve email for this username' };
        }

        return { email: userEmail };
    } catch (err: any) {
        return { email: null, error: err.message || 'Failed to lookup username' };
    }
}

/**
 * Login with username and password
 * Looks up email by username, then authenticates with email/password
 */
export async function loginWithUsername(username: string, password: string): Promise<AuthResult> {
    try {
        // First, get the email associated with this username
        const { email, error: lookupError } = await getEmailByUsername(username);

        if (lookupError || !email) {
            return { success: false, error: 'Invalid username or password' };
        }

        // Now login with the email and password
        return await login(email, password);
    } catch (err: any) {
        return { success: false, error: err.message || 'Login failed' };
    }
}

/**
 * Send password reset email
 * Uses Supabase's built-in password reset functionality
 */
export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to send reset email' };
    }
}

/**
 * Update password after reset
 * Called when user lands on reset-password page with valid token
 */
export async function updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to update password' };
    }
}

/**
 * Sign up with email, password, and username
 */
export async function signup(
    email: string,
    password: string,
    username: string
): Promise<AuthResult> {
    try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            return { success: false, error: authError.message };
        }

        if (!authData.user) {
            return { success: false, error: 'Signup failed' };
        }

        // Profile is auto-created by database trigger with default username
        // We just need to UPDATE it with the user's chosen username
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                username: username.toLowerCase(),
                username_last_changed_at: new Date().toISOString(),
            })
            .eq('user_id', authData.user.id);

        if (profileError) {
            return { success: false, error: profileError.message };
        }

        return {
            success: true,
            user: {
                id: authData.user.id,
                email: authData.user.email || '',
                created_at: authData.user.created_at || new Date().toISOString(),
            },
        };
    } catch (err: any) {
        return { success: false, error: err.message || 'Signup failed' };
    }
}

/**
 * Logout current user
 */
export async function logout(): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message || 'Logout failed' };
    }
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) return null;

        return {
            user: {
                id: session.user.id,
                email: session.user.email || '',
                created_at: session.user.created_at || new Date().toISOString(),
            },
            access_token: session.access_token,
            expires_at: session.expires_at,
        };
    } catch (err) {
        return null;
    }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<User | null> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        return {
            id: user.id,
            email: user.email || '',
            created_at: user.created_at || new Date().toISOString(),
        };
    } catch (err) {
        return null;
    }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
    callback: (session: Session | null) => void
): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
            callback(null);
            return;
        }

        callback({
            user: {
                id: session.user.id,
                email: session.user.email || '',
                created_at: session.user.created_at || new Date().toISOString(),
            },
            access_token: session.access_token,
            expires_at: session.expires_at,
        });
    });

    return () => subscription.unsubscribe();
}
