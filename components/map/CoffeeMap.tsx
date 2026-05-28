"use client";

import { useEffect, useRef, useState, useMemo, memo } from 'react';
import { ChevronLeft } from 'lucide-react';
import type { CoffeeMapPin, CoffeeMapStats } from '@/core/types/types';
import MapsProvider from '@/components/features/MapsProvider';
import MarkerPopup from './MarkerPopup';
import MapStats from './MapStats';

const WARM_MAP_STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#f2e8d9' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#5c3d2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#fdf6f0' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#d9ccbc' }] },
    { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#9a6e59' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#4a2e25' }] },
    { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5ebe0' }] },
    { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#ede0cf' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d4e8c2', visibility: 'on' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b8a5e', visibility: 'on' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e8d5bc' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#d4c0a4' }] },
    { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#8b6b55' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#d4b896' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#c4a882' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#7a5c44' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#a08060' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#b8d4e8' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6b9ab8' }] },
];

const PIN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
  <circle cx="14" cy="14" r="11" fill="#4A2E25" stroke="#FFF6E5" stroke-width="2"/>
  <circle cx="14" cy="14" r="4.5" fill="#FFF6E5"/>
</svg>`;

const PIN_ACTIVE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">
  <circle cx="17" cy="17" r="14" fill="#4A2E25" stroke="#F4C430" stroke-width="2.5"/>
  <circle cx="17" cy="17" r="5.5" fill="#FFF6E5"/>
</svg>`;

function makeBubbleSVG(count: number, type: 'state' | 'city'): string {
    const size = type === 'state' ? 52 : 42;
    const fill = type === 'state' ? '#4A2E25' : '#7B4F3A';
    const label = count > 99 ? '99+' : String(count);
    const fontSize = label.length > 2 ? 10 : 13;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${fill}" stroke="#FFF6E5" stroke-width="2.5"/>
  <text x="${size / 2}" y="${size / 2}" text-anchor="middle" dominant-baseline="central" fill="#FFF6E5" font-size="${fontSize}" font-family="system-ui,sans-serif" font-weight="bold">${label}</text>
</svg>`;
}

type DrillLevel = 'country' | 'state' | 'city';

interface Cluster {
    label: string;
    lat: number;
    lng: number;
    count: number;
    pins: CoffeeMapPin[];
}

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };

interface CoffeeMapInnerProps {
    pins: CoffeeMapPin[];
    stats: CoffeeMapStats;
}

const CoffeeMapInner = memo(function CoffeeMapInner({ pins, stats }: CoffeeMapInnerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<google.maps.Map | null>(null);
    const markersRef = useRef<google.maps.Marker[]>([]);
    const [selectedPin, setSelectedPin] = useState<CoffeeMapPin | null>(null);
    const [mapsReady, setMapsReady] = useState(false);
    const [drillLevel, setDrillLevel] = useState<DrillLevel>('country');
    const [activeState, setActiveState] = useState<string | null>(null);
    const [activeCity, setActiveCity] = useState<string | null>(null);

    // Refs for the selection-sync effect to read without being deps
    const currentIndividualPinsRef = useRef<CoffeeMapPin[]>([]);
    const clusterMarkerCountRef = useRef(0);

    useEffect(() => {
        const check = () => {
            if (typeof window !== 'undefined' && (window as any).google?.maps) {
                setMapsReady(true);
            }
        };
        check();
        window.addEventListener('google-maps-loaded', check, { once: true });
        return () => window.removeEventListener('google-maps-loaded', check);
    }, []);

    useEffect(() => {
        if (!mapsReady || !mapContainerRef.current || mapRef.current) return;
        mapRef.current = new google.maps.Map(mapContainerRef.current, {
            zoom: 5,
            center: INDIA_CENTER,
            styles: WARM_MAP_STYLE as google.maps.MapTypeStyle[],
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: 'cooperative',
            zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
        });
    }, [mapsReady]);

    // Reset drill state when a different user's pins are loaded
    useEffect(() => {
        setDrillLevel('country');
        setActiveState(null);
        setActiveCity(null);
        setSelectedPin(null);
    }, [pins]);

    // Group pins by state
    const stateGroups = useMemo(() => {
        const groups = new Map<string | null, CoffeeMapPin[]>();
        for (const pin of pins) {
            const key = pin.state ?? null;
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(pin);
        }
        return groups;
    }, [pins]);

    // State-level clusters (one bubble per state)
    const stateClusters = useMemo((): Cluster[] => {
        return Array.from(stateGroups.entries())
            .filter(([state]) => state !== null)
            .map(([state, statePins]) => ({
                label: state as string,
                lat: statePins.reduce((s, p) => s + p.lat, 0) / statePins.length,
                lng: statePins.reduce((s, p) => s + p.lng, 0) / statePins.length,
                count: statePins.length,
                pins: statePins,
            }));
    }, [stateGroups]);

    // City-level clusters within the active state
    const cityClusters = useMemo((): Cluster[] => {
        if (!activeState) return [];
        const statePins = stateGroups.get(activeState) ?? [];
        const cityMap = new Map<string, CoffeeMapPin[]>();
        for (const pin of statePins) {
            const city = pin.city || 'Unknown';
            if (!cityMap.has(city)) cityMap.set(city, []);
            cityMap.get(city)!.push(pin);
        }
        return Array.from(cityMap.entries()).map(([city, cityPins]) => ({
            label: city,
            lat: cityPins.reduce((s, p) => s + p.lat, 0) / cityPins.length,
            lng: cityPins.reduce((s, p) => s + p.lng, 0) / cityPins.length,
            count: cityPins.length,
            pins: cityPins,
        }));
    }, [activeState, stateGroups]);

    // Individual pins for the active city
    const cityLevelPins = useMemo((): CoffeeMapPin[] => {
        if (!activeState || !activeCity) return [];
        const statePins = stateGroups.get(activeState) ?? [];
        return statePins.filter(p => (p.city || 'Unknown') === activeCity);
    }, [activeState, activeCity, stateGroups]);

    // Main marker sync — rebuilds all markers when drill level or data changes
    useEffect(() => {
        if (!mapRef.current || !mapsReady) return;

        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        const makeIcon = (svg: string, size: number) => ({
            url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
            scaledSize: new google.maps.Size(size, size),
            anchor: new google.maps.Point(size / 2, size / 2),
        });

        if (drillLevel === 'country') {
            const nullPins = stateGroups.get(null) ?? [];

            stateClusters.forEach(cluster => {
                const size = 52;
                const marker = new google.maps.Marker({
                    position: { lat: cluster.lat, lng: cluster.lng },
                    map: mapRef.current!,
                    title: cluster.label,
                    icon: makeIcon(makeBubbleSVG(cluster.count, 'state'), size),
                    optimized: false,
                });
                marker.addListener('click', () => {
                    setActiveState(cluster.label);
                    setDrillLevel('state');
                    setSelectedPin(null);
                    const bounds = new google.maps.LatLngBounds();
                    cluster.pins.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
                    mapRef.current!.fitBounds(bounds, { top: 80, bottom: 48, left: 48, right: 48 });
                });
                markersRef.current.push(marker);
            });

            clusterMarkerCountRef.current = stateClusters.length;
            currentIndividualPinsRef.current = nullPins;

            nullPins.forEach(pin => {
                const marker = new google.maps.Marker({
                    position: { lat: pin.lat, lng: pin.lng },
                    map: mapRef.current!,
                    title: pin.place_name,
                    icon: makeIcon(PIN_SVG, 28),
                    optimized: false,
                });
                marker.addListener('click', () =>
                    setSelectedPin(prev => prev?.location_id === pin.location_id ? null : pin)
                );
                markersRef.current.push(marker);
            });

            if (pins.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                pins.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
                if (pins.length === 1) {
                    mapRef.current.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
                    mapRef.current.setZoom(12);
                } else {
                    mapRef.current.fitBounds(bounds, { top: 48, bottom: 48, left: 48, right: 48 });
                }
            }
        } else if (drillLevel === 'state') {
            clusterMarkerCountRef.current = cityClusters.length;
            currentIndividualPinsRef.current = [];

            cityClusters.forEach(cluster => {
                const size = 42;
                const marker = new google.maps.Marker({
                    position: { lat: cluster.lat, lng: cluster.lng },
                    map: mapRef.current!,
                    title: cluster.label,
                    icon: makeIcon(makeBubbleSVG(cluster.count, 'city'), size),
                    optimized: false,
                });
                marker.addListener('click', () => {
                    setActiveCity(cluster.label);
                    setDrillLevel('city');
                    setSelectedPin(null);
                    if (cluster.pins.length === 1) {
                        mapRef.current!.setCenter({ lat: cluster.pins[0].lat, lng: cluster.pins[0].lng });
                        mapRef.current!.setZoom(14);
                    } else {
                        const bounds = new google.maps.LatLngBounds();
                        cluster.pins.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
                        mapRef.current!.fitBounds(bounds, { top: 80, bottom: 48, left: 48, right: 48 });
                    }
                });
                markersRef.current.push(marker);
            });
        } else if (drillLevel === 'city') {
            clusterMarkerCountRef.current = 0;
            currentIndividualPinsRef.current = cityLevelPins;

            cityLevelPins.forEach(pin => {
                const marker = new google.maps.Marker({
                    position: { lat: pin.lat, lng: pin.lng },
                    map: mapRef.current!,
                    title: pin.place_name,
                    icon: makeIcon(PIN_SVG, 28),
                    optimized: false,
                });
                marker.addListener('click', () =>
                    setSelectedPin(prev => prev?.location_id === pin.location_id ? null : pin)
                );
                markersRef.current.push(marker);
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [drillLevel, activeState, activeCity, pins, stateClusters, cityClusters, cityLevelPins, stateGroups, mapsReady]);

    // Update pin icons when selection changes (no marker re-creation)
    useEffect(() => {
        if (!mapsReady) return;
        const offset = clusterMarkerCountRef.current;
        markersRef.current.slice(offset).forEach((marker, i) => {
            const pin = currentIndividualPinsRef.current[i];
            if (!pin) return;
            const isSelected = selectedPin?.location_id === pin.location_id;
            const svg = isSelected ? PIN_ACTIVE_SVG : PIN_SVG;
            const size = isSelected ? 34 : 28;
            marker.setIcon({
                url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
                scaledSize: new google.maps.Size(size, size),
                anchor: new google.maps.Point(size / 2, size / 2),
            });
        });
    }, [selectedPin, mapsReady]);

    const drillUp = () => {
        setSelectedPin(null);
        if (drillLevel === 'city') {
            setDrillLevel('state');
            setActiveCity(null);
            if (mapRef.current && activeState && mapsReady) {
                const statePins = stateGroups.get(activeState) ?? [];
                if (statePins.length > 0) {
                    const bounds = new google.maps.LatLngBounds();
                    statePins.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
                    mapRef.current.fitBounds(bounds, { top: 80, bottom: 48, left: 48, right: 48 });
                }
            }
        } else if (drillLevel === 'state') {
            setDrillLevel('country');
            setActiveState(null);
            if (mapRef.current && mapsReady && pins.length > 0) {
                const bounds = new google.maps.LatLngBounds();
                pins.forEach(p => bounds.extend({ lat: p.lat, lng: p.lng }));
                if (pins.length === 1) {
                    mapRef.current.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
                    mapRef.current.setZoom(12);
                } else {
                    mapRef.current.fitBounds(bounds, { top: 48, bottom: 48, left: 48, right: 48 });
                }
            }
        }
    };

    const isEmpty = pins.length === 0;

    return (
        <div className="space-y-4">
            <MapStats stats={stats} />

            <div className="relative rounded-2xl overflow-hidden border border-journal-text/10 shadow-sm">
                <div
                    ref={mapContainerRef}
                    className="w-full h-[380px] md:h-[460px]"
                />

                {/* Breadcrumb drill navigation */}
                {drillLevel !== 'country' && (
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                        <button
                            onClick={drillUp}
                            className="flex items-center gap-0.5 bg-journal-card/95 backdrop-blur-sm border border-journal-text/10 rounded-full px-2.5 py-1.5 text-xs font-medium text-journal-text/60 hover:text-journal-text hover:bg-journal-card transition-colors shadow-sm lowercase"
                        >
                            <ChevronLeft className="w-3 h-3" />
                            {drillLevel === 'state' ? 'india' : activeState?.toLowerCase()}
                        </button>
                        {drillLevel === 'state' && activeState && (
                            <>
                                <span className="text-journal-text/30 text-xs">›</span>
                                <span className="bg-journal-card/95 backdrop-blur-sm border border-journal-text/10 rounded-full px-2.5 py-1.5 text-xs font-medium text-journal-text shadow-sm lowercase">
                                    {activeState.toLowerCase()}
                                </span>
                            </>
                        )}
                        {drillLevel === 'city' && activeCity && (
                            <>
                                <span className="text-journal-text/30 text-xs">›</span>
                                <span className="bg-journal-card/95 backdrop-blur-sm border border-journal-text/10 rounded-full px-2.5 py-1.5 text-xs font-medium text-journal-text shadow-sm lowercase">
                                    {activeCity.toLowerCase()}
                                </span>
                            </>
                        )}
                    </div>
                )}

                {!mapsReady && (
                    <div className="absolute inset-0 bg-[#f2e8d9] flex items-center justify-center">
                        <p className="text-journal-text/40 text-sm lowercase animate-pulse">loading map...</p>
                    </div>
                )}

                {mapsReady && isEmpty && (
                    <div className="absolute inset-0 bg-[#f2e8d9]/80 flex flex-col items-center justify-center gap-2">
                        <p className="text-journal-text/50 text-sm lowercase">no locations logged yet</p>
                        <p className="text-journal-text/30 text-xs lowercase">start logging cafés to see them here</p>
                    </div>
                )}

                {selectedPin && (
                    <MarkerPopup pin={selectedPin} onClose={() => setSelectedPin(null)} />
                )}
            </div>
        </div>
    );
});

interface CoffeeMapProps {
    pins: CoffeeMapPin[];
    stats: CoffeeMapStats;
    loading?: boolean;
}

export default function CoffeeMap({ pins, stats, loading }: CoffeeMapProps) {
    if (loading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 rounded-2xl bg-journal-text/5 animate-pulse" />
                    ))}
                </div>
                <div className="w-full h-[380px] md:h-[460px] rounded-2xl bg-journal-text/5 animate-pulse" />
            </div>
        );
    }

    return (
        <MapsProvider>
            <CoffeeMapInner pins={pins} stats={stats} />
        </MapsProvider>
    );
}
