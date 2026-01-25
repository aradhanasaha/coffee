/**
 * Authentication Hook
 * Provides authentication state and operations to React components
 * Platform-agnostic - uses authService
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import * as authService from '@/services/authService';
import type { Session, User } from '@/core/types/types';

interface UseAuthReturn {
    user: User | null;
    session: Session | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithUsername: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    signup: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string; session?: Session }>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
    updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

export function useAuth(): UseAuthReturn {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            const currentSession = await authService.getSession();
            if (currentSession) {
                setSession(currentSession);
                setUser(currentSession.user);
            }
            setLoading(false);
        };

        initAuth();

        // Subscribe to auth state changes
        const unsubscribe = authService.onAuthStateChange((newSession) => {
            setSession(newSession);
            setUser(newSession?.user || null);
        });

        return () => unsubscribe();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const result = await authService.login(email, password);

        if (result.success && result.user && result.session) {
            setUser(result.user);
            setSession(result.session);
            return { success: true };
        }

        return { success: false, error: result.error };
    }, []);

    const loginWithUsername = useCallback(async (username: string, password: string) => {
        const result = await authService.loginWithUsername(username, password);

        if (result.success && result.user && result.session) {
            setUser(result.user);
            setSession(result.session);
            return { success: true };
        }

        return { success: false, error: result.error };
    }, []);

    const signup = useCallback(async (email: string, password: string, username: string) => {
        const result = await authService.signup(email, password, username);

        if (result.success && result.user) {
            setUser(result.user);
            if (result.session) {
                setSession(result.session);
            }
            return { success: true, session: result.session };
        }

        return { success: false, error: result.error };
    }, []);

    const logout = useCallback(async () => {
        await authService.logout();
        setUser(null);
        setSession(null);
    }, []);

    const refreshSession = useCallback(async () => {
        const currentSession = await authService.getSession();
        if (currentSession) {
            setSession(currentSession);
            setUser(currentSession.user);
        } else {
            setUser(null);
            setSession(null);
        }
    }, []);

    const sendPasswordResetEmail = useCallback(async (email: string) => {
        return await authService.sendPasswordResetEmail(email);
    }, []);

    const updatePassword = useCallback(async (newPassword: string) => {
        return await authService.updatePassword(newPassword);
    }, []);

    // Memoize user and session to prevent infinite re-renders
    // Only create new objects when the actual data changes
    const memoizedUser = useMemo(() => user, [user?.id, user?.email]);
    const memoizedSession = useMemo(() => session, [session?.access_token]);

    return {
        user: memoizedUser,
        session: memoizedSession,
        loading,
        login,
        loginWithUsername,
        signup,
        logout,
        refreshSession,
        sendPasswordResetEmail,
        updatePassword,
    };
}
