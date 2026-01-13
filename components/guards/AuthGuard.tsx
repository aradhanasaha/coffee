/**
 * AuthGuard Component
 * Handles authentication checking and redirection
 * Platform-agnostic - uses useAuth hook and accepts navigation callback
 */

"use client";

import { useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';

interface AuthGuardProps {
    children: ReactNode;
    requireAuth?: boolean;
    requireProfile?: boolean;
    onUnauthenticated?: () => void;
    onNoProfile?: () => void;
    loadingComponent?: ReactNode;
}

export default function AuthGuard({
    children,
    requireAuth = true,
    requireProfile = false,
    onUnauthenticated,
    onNoProfile,
    loadingComponent,
}: AuthGuardProps) {
    const { user, loading: authLoading } = useAuth();
    const { profile, loading: profileLoading } = useUserProfile(user?.id || null);

    useEffect(() => {
        if (authLoading || profileLoading) return;

        if (requireAuth && !user && onUnauthenticated) {
            onUnauthenticated();
        }

        if (requireProfile && user && !profile && onNoProfile) {
            onNoProfile();
        }
    }, [
        authLoading,
        profileLoading,
        requireAuth,
        requireProfile,
        user,
        profile,
        onUnauthenticated,
        onNoProfile,
    ]);

    if (authLoading || (requireProfile && profileLoading)) {
        return loadingComponent || (
            <div className="min-h-screen flex items-center justify-center bg-background">
                Loading...
            </div>
        );
    }

    if (requireAuth && !user) {
        return null;
    }

    if (requireProfile && !profile) {
        return null;
    }

    return <>{children}</>;
}
