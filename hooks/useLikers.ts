import { useState, useCallback } from 'react';
import { getLikersForTarget } from '@/services/likeService';
import { LikeTargetType } from '@/core/types/types';

interface Liker {
    user_id: string;
    username: string;
}

interface UseLikersReturn {
    likers: Liker[];
    loading: boolean;
    error: string | null;
    fetchLikers: () => Promise<void>;
    resetLikers: () => void;
}

export function useLikers(targetId: string, targetType: LikeTargetType): UseLikersReturn {
    const [likers, setLikers] = useState<Liker[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasFetched, setHasFetched] = useState(false);

    const fetchLikers = useCallback(async () => {
        if (hasFetched) return;

        console.log('[useLikers] Fetching for:', targetId, targetType);
        setLoading(true);
        setError(null);
        try {
            const data = await getLikersForTarget(targetId, targetType);
            console.log('[useLikers] Received data:', data);
            setLikers(data);
            setHasFetched(true);
        } catch (err) {
            console.error('[useLikers] Error:', err);
            setError('Failed to load likes');
        } finally {
            setLoading(false);
        }
    }, [targetId, targetType, hasFetched]);

    const resetLikers = useCallback(() => {
        setHasFetched(false);
        setLikers([]);
    }, []);

    return {
        likers,
        loading,
        error,
        fetchLikers,
        resetLikers
    };
}
