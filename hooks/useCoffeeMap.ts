import { useState, useEffect } from 'react';
import { fetchCoffeeMap, computeCoffeeMapStats } from '@/services/coffeeMapService';
import type { CoffeeMapPin, CoffeeMapStats } from '@/core/types/types';

interface UseCoffeeMapReturn {
    pins: CoffeeMapPin[];
    stats: CoffeeMapStats;
    loading: boolean;
}

export function useCoffeeMap(userId: string | null): UseCoffeeMapReturn {
    const [pins, setPins] = useState<CoffeeMapPin[]>([]);
    const [stats, setStats] = useState<CoffeeMapStats>({
        total_cafes: 0,
        total_cities: 0,
        most_visited: null,
        recent: null,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;

        setLoading(true);
        fetchCoffeeMap(userId).then((data) => {
            setPins(data);
            setStats(computeCoffeeMapStats(data));
            setLoading(false);
        });
    }, [userId]);

    return { pins, stats, loading };
}
