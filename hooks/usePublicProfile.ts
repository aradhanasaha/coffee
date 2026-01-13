/**
 * usePublicProfile Hook
 * React hook for fetching public user profiles by username
 * Platform-agnostic - delegates to userProfileService
 */

import { useState, useEffect } from 'react';
import * as userProfileService from '@/services/userProfileService';
import type {
    PublicUserProfile,
    UserStats,
    CoffeeLog
} from '@/core/types/types';

interface UsePublicProfileReturn {
    profile: PublicUserProfile | null;
    stats: UserStats | null;
    recentLogs: CoffeeLog[];
    loading: boolean;
    error: string | null;
}

export function usePublicProfile(username: string): UsePublicProfileReturn {
    const [profile, setProfile] = useState<PublicUserProfile | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [recentLogs, setRecentLogs] = useState<CoffeeLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);

            // Fetch user profile
            const profileResult = await userProfileService.getUserByUsername(username);

            if (!profileResult.success || !profileResult.data) {
                setError(profileResult.error || 'User not found');
                setLoading(false);
                return;
            }

            setProfile(profileResult.data);

            // Fetch stats and recent logs in parallel
            const [statsData, logsData] = await Promise.all([
                userProfileService.getUserStats(profileResult.data.user_id),
                userProfileService.getUserRecentLogs(profileResult.data.user_id, 20)
            ]);

            setStats(statsData);
            setRecentLogs(logsData);
            setLoading(false);
        };

        fetchProfile();
    }, [username]);

    return {
        profile,
        stats,
        recentLogs,
        loading,
        error
    };
}
