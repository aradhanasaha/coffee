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
