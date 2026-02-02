import { useState, useCallback } from 'react';
import { getFollowerProfiles, getFollowingProfiles } from '@/services/followService';

interface UserProfile {
    user_id: string;
    username: string;
}

type FollowType = 'followers' | 'following';

interface UseFollowsReturn {
    users: UserProfile[];
    loading: boolean;
    error: string | null;
    fetchUsers: (type: FollowType) => Promise<void>;
    resetUsers: () => void;
}

export function useFollows(userId: string): UseFollowsReturn {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async (type: FollowType) => {
        setLoading(true);
        setError(null);
        try {
            let data: UserProfile[] = [];
            if (type === 'followers') {
                data = await getFollowerProfiles(userId);
            } else {
                data = await getFollowingProfiles(userId);
            }
            setUsers(data);
        } catch (err) {
            console.error('Error fetching follows:', err);
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const resetUsers = useCallback(() => {
        setUsers([]);
        setError(null);
    }, []);

    return {
        users,
        loading,
        error,
        fetchUsers,
        resetUsers
    };
}
