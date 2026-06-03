/**
 * Coffee Logs Hook
 * Provides coffee log state and operations to React components
 * Platform-agnostic - uses coffeeService
 */

import { useState, useEffect, useCallback } from 'react';
import * as coffeeService from '@/services/coffeeService';
import type { CoffeeLog, CoffeeLogWithUsername, LogFormData } from '@/core/types/types';

interface UseCoffeeLogsReturn {
    logs: CoffeeLog[];
    loading: boolean;
    error: string | null;
    createLog: (logData: LogFormData) => Promise<{ success: boolean; data?: CoffeeLog; error?: string }>;
    updateLog: (logId: string, updates: Partial<LogFormData>) => Promise<{ success: boolean; data?: CoffeeLog; error?: string }>;
    deleteLog: (logId: string) => Promise<{ success: boolean; error?: string }>;
    refreshLogs: () => Promise<void>;
}

// Simple in-memory cache for user logs
const userLogsCache: Record<string, { data: CoffeeLog[], timestamp: number }> = {};
const CACHE_TTL = 60 * 1000; // 1 minute

export function useCoffeeLogs(userId: string | null): UseCoffeeLogsReturn {
    const [logs, setLogs] = useState<CoffeeLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch logs
    const fetchLogs = useCallback(async (forceRefresh = false) => {
        if (!userId) {
            setLoading(false);
            return;
        }

        // Check cache first
        const cached = userLogsCache[userId];
        if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_TTL) {
            setLogs(cached.data);
            setLoading(false);
            return;
        }

        if (!cached) setLoading(true); // Only show loading state if we don't have stale cached data

        const logsData = await coffeeService.fetchUserCoffeeLogs(userId);

        // Update cache
        userLogsCache[userId] = { data: logsData, timestamp: Date.now() };

        setLogs(logsData);
        setError(null);
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const createLog = useCallback(async (logData: LogFormData) => {
        if (!userId) {
            return { success: false, error: 'No user ID' };
        }

        const result = await coffeeService.createCoffeeLog(userId, logData);

        if (result.success && result.data) {
            setLogs(prev => [result.data!, ...prev]);
            return { success: true, data: result.data };
        }

        return { success: false, error: result.error };
    }, [userId]);

    const updateLog = useCallback(async (logId: string, updates: Partial<LogFormData>) => {
        const result = await coffeeService.updateCoffeeLog(logId, updates);

        if (result.success && result.data) {
            setLogs(prev => prev.map(log => log.id === logId ? result.data! : log));
            return { success: true, data: result.data };
        }

        return { success: false, error: result.error };
    }, []);

    const deleteLog = useCallback(async (logId: string) => {
        if (!userId) {
            return { success: false, error: 'No user ID' };
        }

        const result = await coffeeService.deleteCoffeeLog(logId, userId);

        if (result.success) {
            setLogs(prev => prev.filter(log => log.id !== logId));
            return { success: true };
        }

        return { success: false, error: result.error };
    }, [userId]);

    const refreshLogs = useCallback(async () => {
        await fetchLogs();
    }, [fetchLogs]);

    return {
        logs,
        loading,
        error,
        createLog,
        updateLog,
        deleteLog,
        refreshLogs,
    };
}

/**
 * Public Feed Hook
 * Fetches public coffee feed for the landing/home page
 */
interface UsePublicFeedReturn {
    logs: CoffeeLogWithUsername[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    error: string | null;
    refreshFeed: () => Promise<void>;
    loadMore: () => Promise<void>;
    addOptimisticLog: (log: CoffeeLogWithUsername) => void;
}

const PAGE_SIZE = 20;

export function usePublicCoffeeFeed(options?: {
    limit?: number;
    city?: string;
    currentUserId?: string | null;
    initialLogs?: CoffeeLogWithUsername[];
}): UsePublicFeedReturn {
    const { city, currentUserId, initialLogs } = options || {};

    const [logs, setLogs] = useState<CoffeeLogWithUsername[]>(initialLogs || []);
    const [loading, setLoading] = useState(!initialLogs);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState((initialLogs?.length ?? 0) >= PAGE_SIZE);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialLogs) return; // SSR-provided first page, skip client fetch
        setLoading(true);
        coffeeService.fetchPublicCoffeeFeed({ limit: PAGE_SIZE, city, currentUserId })
            .then(data => {
                setLogs(data);
                setHasMore(data.length >= PAGE_SIZE);
                setLoading(false);
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId, city]);

    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;
        const cursor = logs[logs.length - 1]?.created_at;
        if (!cursor) return;
        setLoadingMore(true);
        const data = await coffeeService.fetchPublicCoffeeFeed({ limit: PAGE_SIZE, cursor, city, currentUserId });
        setLogs(prev => [...prev, ...data]);
        setHasMore(data.length >= PAGE_SIZE);
        setLoadingMore(false);
    }, [loadingMore, hasMore, logs, city, currentUserId]);

    const refreshFeed = useCallback(async () => {
        setLoading(true);
        const data = await coffeeService.fetchPublicCoffeeFeed({ limit: PAGE_SIZE, city, currentUserId });
        setLogs(data);
        setHasMore(data.length >= PAGE_SIZE);
        setLoading(false);
    }, [city, currentUserId]);

    const addOptimisticLog = useCallback((log: CoffeeLogWithUsername) => {
        setLogs(prev => [log, ...prev]);
    }, []);

    return {
        logs,
        loading,
        loadingMore,
        hasMore,
        error,
        refreshFeed,
        loadMore,
        addOptimisticLog,
    };
}
