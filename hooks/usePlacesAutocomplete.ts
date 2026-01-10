"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Prediction {
    place_id: string;
    description: string;
    structured_formatting: {
        main_text: string;
        secondary_text: string;
    };
}

interface PlaceDetails {
    place_name: string;
    place_address: string;
    lat: number;
    lng: number;
    google_place_id: string;
}

export const usePlacesAutocomplete = (debounceMs: number = 300) => {
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [loading, setLoading] = useState(false);

    // Google Maps services and session token managed via useRef to avoid re-renders
    // and keep them outside the React render cycle.
    const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
    const placesService = useRef<google.maps.places.PlacesService | null>(null);
    const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Lazy initialization of Google Maps services
    const initServices = useCallback(() => {
        if (!window.google || !window.google.maps) return false;
        if (!autocompleteService.current) {
            autocompleteService.current = new google.maps.places.AutocompleteService();
        }
        if (!placesService.current) {
            // PlacesService requires an HTML element, even if not used for display
            const dummyDiv = document.createElement("div");
            placesService.current = new google.maps.places.PlacesService(dummyDiv);
        }
        return true;
    }, []);

    // Session Token Management
    const startSession = useCallback(() => {
        if (!sessionToken.current && window.google) {
            sessionToken.current = new google.maps.places.AutocompleteSessionToken();
            console.log("DEBUG: New Session Token Created:", sessionToken.current.toString());
        }
    }, []);

    const clearSession = useCallback(() => {
        sessionToken.current = null;
        setPredictions([]);
        console.log("DEBUG: Session Token Cleared");
    }, []);

    const onInputFocus = useCallback(() => {
        startSession();
    }, [startSession]);

    const onInputChange = useCallback((value: string) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        if (!value.trim()) {
            setPredictions([]);
            clearSession();
            return;
        }

        // Ensure session exists when typing starts
        startSession();

        debounceTimer.current = setTimeout(() => {
            if (!initServices() || !autocompleteService.current) return;

            setLoading(true);
            autocompleteService.current.getPlacePredictions(
                {
                    input: value,
                    sessionToken: sessionToken.current!,
                    componentRestrictions: { country: "in" }, // Restrict to India
                    types: ["establishment"], // Focus on cafes/businesses
                },
                (results, status) => {
                    setLoading(false);
                    if (status === google.maps.places.PlacesServiceStatus.OK && results) {
                        setPredictions(results as Prediction[]);
                    } else {
                        setPredictions([]);
                    }
                }
            );
        }, debounceMs);
    }, [debounceMs, initServices, startSession, clearSession]);

    const onPlaceSelect = useCallback((placeId: string, callback: (details: PlaceDetails) => void) => {
        if (!initServices() || !placesService.current) return;

        console.log("DEBUG: Fetching Details with Session Token:", sessionToken.current?.toString());

        placesService.current.getDetails(
            {
                placeId,
                sessionToken: sessionToken.current!, // MUST pass session token for billing-safe behavior
                fields: ["name", "formatted_address", "geometry", "place_id"],
            },
            (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place) {
                    callback({
                        place_name: place.name || "",
                        place_address: place.formatted_address || "",
                        lat: place.geometry?.location?.lat() || 0,
                        lng: place.geometry?.location?.lng() || 0,
                        google_place_id: place.place_id || "",
                    });
                }
                // Reset session after a final selection is made
                clearSession();
            }
        );
    }, [initServices, clearSession]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, []);

    return {
        predictions,
        loading,
        onInputFocus,
        onInputChange,
        onPlaceSelect,
        clearSession,
    };
};
