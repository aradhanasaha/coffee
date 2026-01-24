/**
 * Location Service
 * Provides platform-agnostic location operations
 * Abstracts Google Places API and location database
 */

import { supabase } from '@/adapters/supabaseClient';
import type {
    Location,
    LocationDetails,
    LocationSuggestion,
    ServiceResult
} from '@/core/types/types';

/**
 * Find or create a location in the database
 */
export async function findOrCreateLocation(
    locationDetails: LocationDetails
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

/**
 * Get location by ID
 */
export async function getLocationById(locationId: string): Promise<Location | null> {
    try {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('id', locationId)
            .single();

        if (error || !data) return null;

        return data;
    } catch (err) {
        return null;
    }
}

/**
 * Get location by Google Place ID
 */
export async function getLocationByPlaceId(
    googlePlaceId: string
): Promise<Location | null> {
    try {
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .eq('google_place_id', googlePlaceId)
            .single();

        if (error || !data) return null;

        return data;
    } catch (err) {
        return null;
    }
}
