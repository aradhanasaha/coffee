import { useState, useEffect, useCallback } from 'react';
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
    refreshStats: () => Promise<void>;
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

    // Function to refresh just the stats (for after follow/unfollow)
    const refreshStats = useCallback(async () => {
        if (!profile) return;

        const statsData = await userProfileService.getUserStats(profile.user_id);
        setStats(statsData);
    }, [profile]);

    return {
        profile,
        stats,
        recentLogs,
        loading,
        error,
        refreshStats
    };
}
