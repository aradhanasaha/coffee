import { supabase } from '@/adapters/supabaseClient';
import { CoffeeLog, CoffeeLogWithUsername, Location, ServiceResult } from '@/core/types/types';


// Interface for extended location details
export interface LocationDetailsExtended extends Location {
    average_rating: number;
    review_count: number;
    cover_image_url: string | null;
    logs: CoffeeLogWithUsername[];
    description?: string;
}

interface LocationDetails {
    place_name: string;
    place_address: string;
    city?: string | null;
    lat: number;
    lng: number;
    google_place_id: string;
}


/**
 * Find or create a location in the database
 */
export async function findOrCreateLocation(
    locationDetails: {
        place_name: string;
        place_address: string;
        lat: number;
        lng: number;
        google_place_id: string;
        city?: string;
    }
): Promise<ServiceResult<Location>> {
    try {
        // First, try to find existing location by google_place_id
        const { data: existingLoc, error: findError } = await supabase
            .from('locations')
            .select('*')
            .eq('google_place_id', locationDetails.google_place_id)
            .maybeSingle();

        if (findError) {
            return { success: false, error: findError.message };
        }

        if (existingLoc) {
            // If existing location doesn't have a city but we have one now, update it
            if (!existingLoc.city && locationDetails.city) {
                const { data: updatedLoc, error: updateError } = await supabase
                    .from('locations')
                    .update({ city: locationDetails.city })
                    .eq('id', existingLoc.id)
                    .select()
                    .single();

                if (!updateError && updatedLoc) {
                    return { success: true, data: updatedLoc };
                }
            }
            return { success: true, data: existingLoc };
        }

        // If not found, create new location
        const { data: newLoc, error: insertError } = await supabase
            .from('locations')
            .insert({
                place_name: locationDetails.place_name,
                place_address: locationDetails.place_address,
                city: locationDetails.city || null,
                lat: locationDetails.lat,
                lng: locationDetails.lng,
                google_place_id: locationDetails.google_place_id,
            })
            .select()
            .single();

        if (insertError) {
            return { success: false, error: insertError.message };
        }

        if (!newLoc) {
            return { success: false, error: 'Failed to create location' };
        }

        return { success: true, data: newLoc };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to process location' };
    }
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

        let validLogs: CoffeeLogWithUsername[] = (logs || []) as CoffeeLogWithUsername[];

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



export async function getDistinctCities(): Promise<ServiceResult<string[]>> {
    try {
        const { data, error } = await supabase
            .from('locations')
            .select('city')
            .not('city', 'is', null)
            .order('city');

        if (error) {
            return { success: false, error: error.message };
        }

        // Filter valid cities and remove duplicates
        const cities = Array.from(new Set(
            data
                ?.map(item => item.city)
                .filter((city): city is string => !!city && city.trim().length > 0)
        ));

        return { success: true, data: cities };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

export async function getLocationsByCity(city: string): Promise<ServiceResult<Location[]>> {
    try {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('city', city);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, data: data as Location[] };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
