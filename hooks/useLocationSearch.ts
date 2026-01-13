/**
 * Location Search Hook
 * Provides location search functionality to React components
 * Platform-agnostic interface using Google Maps adapter
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { getGoogleMapsAdapter } from '@/adapters/googleMapsAdapter';
import type { LocationDetails, LocationSuggestion } from '@/core/types/types';

interface UseLocationSearchReturn {
    suggestions: LocationSuggestion[];
    loading: boolean;
    initialized: boolean;
    onInputFocus: () => void;
    onInputChange: (value: string) => void;
    onPlaceSelect: (placeId: string, callback: (details: LocationDetails) => void) => void;
    clearSession: () => void;
}

export function useLocationSearch(debounceMs: number = 300): UseLocationSearchReturn {
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const adapter = useRef(getGoogleMapsAdapter());

    // Initialize adapter
    useEffect(() => {
        const init = async () => {
            const success = await adapter.current.initialize();
            setInitialized(success);
        };
        init();
    }, []);

    const onInputFocus = useCallback(() => {
        if (!initialized) return;
        adapter.current.startSession();
    }, [initialized]);

    const onInputChange = useCallback((value: string) => {
        if (!initialized) return;

        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (!value.trim()) {
            setSuggestions([]);
            adapter.current.endSession();
            return;
        }

        // Start session when typing starts
        adapter.current.startSession();

        debounceTimer.current = setTimeout(async () => {
            setLoading(true);
            const results = await adapter.current.searchPlaces(value);
            setSuggestions(results);
            setLoading(false);
        }, debounceMs);
    }, [initialized, debounceMs]);

    const onPlaceSelect = useCallback(
        async (placeId: string, callback: (details: LocationDetails) => void) => {
            if (!initialized) return;

            const details = await adapter.current.getPlaceDetails(placeId);
            if (details) {
                callback(details);
            }
            // Session is ended in the adapter after getting details
        },
        [initialized]
    );

    const clearSession = useCallback(() => {
        setSuggestions([]);
        adapter.current.endSession();
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    return {
        suggestions,
        loading,
        initialized,
        onInputFocus,
        onInputChange,
        onPlaceSelect,
        clearSession,
    };
}
