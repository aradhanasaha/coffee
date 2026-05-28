import { supabase } from '@/adapters/supabaseClient';
import type { CoffeeMapPin, CoffeeMapStats } from '@/core/types/types';

// Google Places address format: "Place, Area, City, State PostalCode, Country"
// State is the second-to-last comma-separated component, with postal code stripped.
function parseStateFromAddress(address: string | null | undefined): string | null {
    if (!address) return null;
    const parts = address.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length < 2) return null;
    const statePart = parts[parts.length - 2];
    const state = statePart.replace(/\d+/g, '').trim();
    return state || null;
}

export async function fetchCoffeeMap(userId: string): Promise<CoffeeMapPin[]> {
    const { data, error } = await supabase
        .from('coffee_logs')
        .select(`
            id,
            created_at,
            image_url,
            image_deleted_at,
            location_id,
            locations:location_id (
                id,
                place_name,
                place_address,
                city,
                lat,
                lng,
                google_place_id
            )
        `)
        .eq('user_id', userId)
        .is('deleted_at', null)
        .not('location_id', 'is', null)
        .order('created_at', { ascending: false });

    if (error || !data) return [];

    const pinMap = new Map<string, CoffeeMapPin>();

    for (const log of data as any[]) {
        const loc = log.locations;
        if (!loc || loc.lat == null || loc.lng == null) continue;

        const key: string = loc.id;

        if (pinMap.has(key)) {
            const pin = pinMap.get(key)!;
            pin.visit_count++;
            pin.log_ids.push(log.id);
        } else {
            pinMap.set(key, {
                location_id: loc.id,
                place_name: loc.place_name,
                city: loc.city || null,
                state: parseStateFromAddress(loc.place_address),
                lat: loc.lat,
                lng: loc.lng,
                google_place_id: loc.google_place_id || null,
                visit_count: 1,
                last_visited: log.created_at,
                latest_image: (log.image_url && !log.image_deleted_at) ? log.image_url : null,
                log_ids: [log.id],
            });
        }
    }

    return Array.from(pinMap.values());
}

export function computeCoffeeMapStats(pins: CoffeeMapPin[]): CoffeeMapStats {
    if (pins.length === 0) {
        return { total_cafes: 0, total_cities: 0, most_visited: null, recent: null };
    }

    const cities = new Set(pins.map(p => p.city).filter(Boolean));
    const most_visited = pins.reduce((a, b) => (b.visit_count > a.visit_count ? b : a), pins[0]);
    const recent = pins.reduce((a, b) =>
        new Date(b.last_visited) > new Date(a.last_visited) ? b : a, pins[0]
    );

    return {
        total_cafes: pins.length,
        total_cities: cities.size,
        most_visited,
        recent,
    };
}
