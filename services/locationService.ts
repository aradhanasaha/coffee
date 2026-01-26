import { supabase } from '@/adapters/supabaseClient';
import { CoffeeLog, Location, ServiceResult } from '@/core/types/types';

export interface LocationDetailsExtended extends Location {
    average_rating: number;
    review_count: number;
    cover_image_url: string | null;
    logs: CoffeeLog[];
    // description field is not in DB yet, but we'll include it in the type for UI readiness
    description?: string;
}

export async function fetchLocationDetails(locationId: string): Promise<ServiceResult<LocationDetailsExtended>> {
    try {
        // 1. Fetch the basic location details
        const { data: location, error: locError } = await supabase
            .from('locations')
            .select('*')
            .eq('id', locationId)
            .single();

        if (locError || !location) {
            return { success: false, error: locError?.message || 'Location not found' };
        }

        // 2. Fetch all coffee logs for this location
        const { data: logs, error: logsError } = await supabase
            .from('coffee_logs')
            .select('*')
            .eq('location_id', locationId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

        if (logsError) {
            return { success: false, error: logsError.message };
        }

        let validLogs: CoffeeLog[] = logs || [];

        // 2.5 Manual Join for Profiles (to fix PGRST200 error)
        if (validLogs.length > 0) {
            const userIds = Array.from(new Set(validLogs.map(l => l.user_id)));
            const { data: profiles } = await supabase
                .from('profiles')
                .select('user_id, username')
                .in('user_id', userIds);

            if (profiles) {
                const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p.username]));
                validLogs = validLogs.map(log => ({
                    ...log,
                    username: profileMap[log.user_id]
                }));
            }
        }

        // 3. Aggregate Stats
        const reviewCount = validLogs.length;
        const totalRating = validLogs.reduce((sum, log) => sum + log.rating, 0);
        const averageRating = reviewCount > 0 ? Number((totalRating / reviewCount).toFixed(1)) : 0;

        // 4. Find best cover image (using the most recent log with an image)
        const coverLog = validLogs.find(log => log.image_url && !log.image_deleted_at);
        const coverImageUrl = coverLog?.image_url || null;

        return {
            success: true,
            data: {
                ...location,
                average_rating: averageRating,
                review_count: reviewCount,
                cover_image_url: coverImageUrl,
                logs: validLogs,
                description: 'A quiet spot for coffee lovers.' // Placeholder as requested
            }
        };

    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * Find or create a location in the database
 */
export async function findOrCreateLocation(locationDetails: {
    place_name: string;
    place_address: string;
    lat: number;
    lng: number;
    google_place_id: string;
}): Promise<ServiceResult<Location>> {
    try {
        // 1. Try to find existing location
        const { data: existing, error: findError } = await supabase
            .from('locations')
            .select('*')
            .eq('google_place_id', locationDetails.google_place_id)
            .single();

        if (existing) {
            return { success: true, data: existing };
        }

        // 2. Create new location
        const { data: newLocation, error: createError } = await supabase
            .from('locations')
            .insert([{
                place_name: locationDetails.place_name,
                place_address: locationDetails.place_address,
                lat: locationDetails.lat,
                lng: locationDetails.lng,
                google_place_id: locationDetails.google_place_id
            }])
            .select()
            .single();

        if (createError) {
            return { success: false, error: createError.message };
        }

        return { success: true, data: newLocation };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
