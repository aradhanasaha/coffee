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
    createLog: (logData: LogFormData) => Promise<{ success: boolean; error?: string }>;
    updateLog: (logId: string, updates: Partial<LogFormData>) => Promise<{ success: boolean; error?: string }>;
    deleteLog: (logId: string) => Promise<{ success: boolean; error?: string }>;
    refreshLogs: () => Promise<void>;
}

export function useCoffeeLogs(userId: string | null): UseCoffeeLogsReturn {
    const [logs, setLogs] = useState<CoffeeLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch logs
    const fetchLogs = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        const logsData = await coffeeService.fetchUserCoffeeLogs(userId);
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
            return { success: true };
        }

        return { success: false, error: result.error };
    }, [userId]);

    const updateLog = useCallback(async (logId: string, updates: Partial<LogFormData>) => {
        const result = await coffeeService.updateCoffeeLog(logId, updates);

        if (result.success && result.data) {
            setLogs(prev => prev.map(log => log.id === logId ? result.data! : log));
            return { success: true };
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
    error: string | null;
    refreshFeed: () => Promise<void>;
}

export function usePublicCoffeeFeed(options?: {
    limit?: number;
    city?: string;
}): UsePublicFeedReturn {
    const [logs, setLogs] = useState<CoffeeLogWithUsername[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Destructure options to avoid object reference issues in dependency array
    const { limit, city } = options || {};

    const fetchFeed = useCallback(async () => {
        setLoading(true);
        const feedData = await coffeeService.fetchPublicCoffeeFeed({ limit, city });
        setLogs(feedData);
        setError(null);
        setLoading(false);
    }, [limit, city]); // Use individual values instead of the whole options object

    useEffect(() => {
        fetchFeed();
    }, [fetchFeed]);

    const refreshFeed = useCallback(async () => {
        await fetchFeed();
    }, [fetchFeed]);

    return {
        logs,
        loading,
        error,
        refreshFeed,
    };
}
