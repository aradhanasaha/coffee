import { supabase } from '@/adapters/supabaseClient';
import type { ServiceResult } from '@/core/types/types';

export interface SearchResultItem {
    id: string; // user_id or place name or coffee name
    type: 'user' | 'place' | 'coffee';
    title: string; // username or place name or coffee name
    subtitle?: string; // e.g. "Coffee Enthusiast" or "New Delhi"
    image?: string;
    metadata?: any;
}

export interface SearchResults {
    users: SearchResultItem[];
    places: SearchResultItem[];
    coffees: SearchResultItem[];
}

/**
 * Search users by username
 */
export async function searchUsers(query: string, limit: number = 5): Promise<SearchResultItem[]> {
    if (!query || query.length < 2) return [];

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('user_id, username, follower_count')
            .ilike('username', `%${query}%`)
            .limit(limit);

        if (error) throw error;

        return (data || []).map(user => ({
            id: user.user_id,
            type: 'user',
            title: user.username,
            subtitle: `${user.follower_count || 0} followers`
        }));
    } catch (err) {
        console.error('Error searching users:', err);
        return [];
    }
}

/**
 * Search places from coffee logs
 * Aggregates unique places matching the query
 */
export async function searchPlaces(query: string, limit: number = 5): Promise<SearchResultItem[]> {
    if (!query || query.length < 2) return [];

    try {
        const { data, error } = await supabase
            .from('coffee_logs')
            .select('place, locations(city)')
            .ilike('place', `%${query}%`)
            .is('deleted_at', null)
            .limit(50); // Fetch more to deduplicate

        if (error) throw error;

        if (!data) return [];

        // Deduplicate places
        const places = new Map<string, { city?: string; count: number }>();

        data.forEach((log: any) => {
            const name = log.place;
            if (!places.has(name)) {
                places.set(name, {
                    city: log.locations?.city,
                    count: 0
                });
            }
            places.get(name)!.count++;
        });

        // Convert to array and sort by occurrence
        return Array.from(places.entries())
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, limit)
            .map(([name, info]) => ({
                id: name,
                type: 'place',
                title: name,
                subtitle: info.city || 'Unknown Location'
            }));
    } catch (err) {
        console.error('Error searching places:', err);
        return [];
    }
}

/**
 * Search coffees from coffee logs
 * Aggregates unique coffee names matching the query
 */
export async function searchCoffees(query: string, limit: number = 5): Promise<SearchResultItem[]> {
    if (!query || query.length < 2) return [];

    try {
        const { data, error } = await supabase
            .from('coffee_logs')
            .select('coffee_name')
            .ilike('coffee_name', `%${query}%`)
            .is('deleted_at', null)
            .limit(50);

        if (error) throw error;

        if (!data) return [];

        // Deduplicate coffees
        const coffees = new Map<string, number>();

        data.forEach((log: any) => {
            const name = log.coffee_name;
            coffees.set(name, (coffees.get(name) || 0) + 1);
        });

        return Array.from(coffees.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([name, count]) => ({
                id: name,
                type: 'coffee',
                title: name,
                subtitle: `${count} mentions`
            }));
    } catch (err) {
        console.error('Error searching coffees:', err);
        return [];
    }
}

/**
 * Perform global search
 */
export async function globalSearch(query: string): Promise<SearchResults> {
    const [users, places, coffees] = await Promise.all([
        searchUsers(query),
        searchPlaces(query),
        searchCoffees(query)
    ]);

    return { users, places, coffees };
}
