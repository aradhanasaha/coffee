/**
 * Google Maps Adapter
 * Platform-specific implementation for Google Places API
 * Abstracts away browser-specific APIs (window.google, document)
 */

import type { LocationDetails, LocationSuggestion } from '@/core/types/types';

/**
 * Interface for location search adapter
 * This allows swapping to a different provider (Mapbox, HERE, etc.) in the future
 */
export interface LocationSearchAdapter {
    initialize(): Promise<boolean>;
    searchPlaces(query: string): Promise<LocationSuggestion[]>;
    getPlaceDetails(placeId: string): Promise<LocationDetails | null>;
    startSession(): void;
    endSession(): void;
}

/**
 * Google Maps implementation of LocationSearchAdapter
 */
export class GoogleMapsAdapter implements LocationSearchAdapter {
    private autocompleteService: google.maps.places.AutocompleteService | null = null;
    private placesService: google.maps.places.PlacesService | null = null;
    private sessionToken: google.maps.places.AutocompleteSessionToken | null = null;

    /**
     * Initialize Google Maps services
     * Returns false if Google Maps API is not available (e.g., on mobile)
     */
    async initialize(): Promise<boolean> {
        if (typeof window === 'undefined' || !window.google || !window.google.maps) {
            return false;
        }

        if (!this.autocompleteService) {
            this.autocompleteService = new google.maps.places.AutocompleteService();
        }

        if (!this.placesService) {
            // PlacesService requires an HTML element, even if not used for display
            const dummyDiv = document.createElement('div');
            this.placesService = new google.maps.places.PlacesService(dummyDiv);
        }

        return true;
    }

    /**
     * Start a new session for billing optimization
     */
    startSession(): void {
        if (typeof window !== 'undefined' && window.google && !this.sessionToken) {
            this.sessionToken = new google.maps.places.AutocompleteSessionToken();
        }
    }

    /**
     * End the current session
     */
    endSession(): void {
        this.sessionToken = null;
    }

    /**
     * Search for places based on query
     */
    async searchPlaces(query: string): Promise<LocationSuggestion[]> {
        if (!this.autocompleteService || !query.trim()) {
            return [];
        }

        return new Promise((resolve) => {
            this.autocompleteService!.getPlacePredictions(
                {
                    input: query,
                    sessionToken: this.sessionToken || undefined,
                    componentRestrictions: { country: 'in' }, // Restrict to India
                    types: ['establishment'], // Focus on cafes/businesses
                },
                (results, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        const suggestions: LocationSuggestion[] = results.map((result) => ({
                            place_id: result.place_id,
                            description: result.description,
                            main_text: result.structured_formatting.main_text,
                            secondary_text: result.structured_formatting.secondary_text,
                        }));
                        resolve(suggestions);
                    } else {
                        resolve([]);
                    }
                }
            );
        });
    }

    /**
     * Get detailed information about a place
     */
    async getPlaceDetails(placeId: string): Promise<LocationDetails | null> {
        if (!this.placesService) {
            return null;
        }

        return new Promise((resolve) => {
            this.placesService!.getDetails(
                {
                    placeId,
                    sessionToken: this.sessionToken || undefined,
                    fields: ['name', 'formatted_address', 'geometry', 'place_id', 'address_components'],
                },
                (place, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                        // Extract city
                        let city = '';
                        if (place.address_components) {
                            for (const component of place.address_components) {
                                if (component.types.includes('locality')) {
                                    city = component.long_name;
                                    break;
                                }
                                if (component.types.includes('postal_town') && !city) {
                                    city = component.long_name;
                                }
                                if (component.types.includes('administrative_area_level_2') && !city) {
                                    city = component.long_name;
                                }
                                if (component.types.includes('sublocality_level_1') && !city) { // Fallback for some areas
                                    city = component.long_name;
                                }
                            }
                        }

                        resolve({
                            place_name: place.name || '',
                            place_address: place.formatted_address || '',
                            city: city || undefined,
                            lat: place.geometry?.location?.lat() || 0,
                            lng: place.geometry?.location?.lng() || 0,
                            google_place_id: place.place_id || '',
                        });
                        // End session after getting details
                        this.endSession();
                    } else {
                        resolve(null);
                    }
                }
            );
        });
    }
}

/**
 * Create a singleton instance of the Google Maps adapter
 * This ensures we reuse the same services and session tokens
 */
let googleMapsAdapter: GoogleMapsAdapter | null = null;

export function getGoogleMapsAdapter(): GoogleMapsAdapter {
    if (!googleMapsAdapter) {
        googleMapsAdapter = new GoogleMapsAdapter();
    }
    return googleMapsAdapter;
}
