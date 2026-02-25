"use client";

import { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { Location } from '@/core/types/types';
import { mapStyles } from '@/lib/mapStyle';

interface GoogleMapExploreProps {
    locations: Location[];
    selectedCity: string;
}

const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1rem',
};

// Default center (can be overridden by bounds)
const defaultCenter = {
    lat: 20.5937, // India
    lng: 78.9629
};

const LIBRARIES: ("places")[] = ["places"];

export default function GoogleMapExplore({ locations, selectedCity }: GoogleMapExploreProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
        libraries: LIBRARIES,
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

    // Calculate map bounds whenever locations change
    const bounds = useMemo(() => {
        if (!isLoaded || locations.length === 0) return null;

        const mapBounds = new window.google.maps.LatLngBounds();
        locations.forEach(loc => {
            if (loc.lat && loc.lng) {
                mapBounds.extend({ lat: loc.lat, lng: loc.lng });
            }
        });
        return mapBounds;
    }, [isLoaded, locations]);

    const onLoad = useCallback(function callback(map: google.maps.Map) {
        setMap(map);
        if (bounds && locations.length > 0) {
            map.fitBounds(bounds);
            // Don't zoom in too much if there's only one marker
            if (locations.length === 1) {
                const listener = window.google.maps.event.addListener(map, "idle", function () {
                    if (map.getZoom()! > 15) map.setZoom(15);
                    window.google.maps.event.removeListener(listener);
                });
            }
        }
    }, [bounds, locations]);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    // Also update bounds if locations change while map is already loaded
    useMemo(() => {
        if (map && bounds && locations.length > 0) {
            map.fitBounds(bounds);
            if (locations.length === 1) {
                map.setZoom(15);
            }
        }
    }, [map, bounds, locations]);

    // Custom marker icon using an SVG path (Pin matching the theme colors)
    const markerIcon = useMemo(() => {
        if (!isLoaded) return undefined;
        return {
            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
            fillColor: '#4A2E25', // Espresso brown
            fillOpacity: 1,
            strokeWeight: 1,
            strokeColor: '#F7E9C9', // Outline matching map background
            scale: 1.5,
            anchor: new window.google.maps.Point(12, 24),
        };
    }, [isLoaded]);


    if (loadError) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#F5E6D3] text-[#4A2C2A] p-6 text-center">
                <p className="font-medium">Error loading maps</p>
                <p className="text-sm opacity-60">Please check your API key or connection.</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#F5E6D3]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A2C2A]"></div>
            </div>
        );
    }

    const router = useRouter();

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={defaultCenter}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
                styles: mapStyles,
                disableDefaultUI: true, // Hides map/satellite toggles, street view
                zoomControl: true,
                clickableIcons: false, // Disables clicking on POIs
            }}
            onClick={() => setSelectedLocation(null)} // Close info window when clicking map
        >
            {locations.map((loc) => (
                loc.lat && loc.lng ? (
                    <MarkerF
                        key={loc.id}
                        position={{ lat: loc.lat, lng: loc.lng }}
                        icon={markerIcon}
                        onMouseOver={() => setSelectedLocation(loc)}
                        onClick={() => router.push(`/locations/${loc.id}`)}
                    />
                ) : null
            ))}

            {selectedLocation && selectedLocation.lat && selectedLocation.lng && (
                <InfoWindowF
                    position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                    onCloseClick={() => setSelectedLocation(null)}
                    options={{
                        pixelOffset: new window.google.maps.Size(0, -30),
                    }}
                >
                    <div className="p-2 max-w-[200px]">
                        <h3 className="font-bold text-[#4A2E25] uppercase text-xs mb-1 truncate">{selectedLocation.place_name}</h3>
                        {selectedLocation.place_address && (
                            <p className="text-[10px] text-[#4A2E25]/70 line-clamp-2 mb-2">{selectedLocation.place_address}</p>
                        )}
                        <a
                            href={`/locations/${selectedLocation.id}`}
                            className="inline-block w-full text-center bg-[#4A2E25] text-[#FFF6E5] text-[10px] font-bold py-1.5 px-3 rounded-md hover:bg-[#7A2E2A] transition-colors uppercase tracking-wider"
                        >
                            View Logs
                        </a>
                    </div>
                </InfoWindowF>
            )}
        </GoogleMap>
    );
}
