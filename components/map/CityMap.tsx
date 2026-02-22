import {
    ComposableMap,
    Geographies,
    Geography,
    Marker,
    ZoomableGroup
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import LocationMarker from "./LocationMarker";

interface Location {
    id: string;
    lat: number;
    lng: number;
    place_name: string;
    google_place_id: string;
}

interface CityMapProps {
    geoUrl: string; // URL to the city's geojson boundary
    locations: Location[];
}

export default function CityMap({ geoUrl, locations }: CityMapProps) {
    const router = useRouter();
    const [tooltipContent, setTooltipContent] = useState("");

    // Calculate center based on locations
    const center: [number, number] = useMemo(() => {
        if (locations.length === 0) return [80, 20]; // Default to India roughly or 0,0

        const sumLat = locations.reduce((sum, loc) => sum + loc.lat, 0);
        const sumLng = locations.reduce((sum, loc) => sum + loc.lng, 0);

        return [sumLng / locations.length, sumLat / locations.length];
    }, [locations]);

    return (
        <div className="w-full h-full relative" style={{ background: '#F5E6D3' }}>
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 50000,
                    center: center
                }}
                className="w-full h-full"
            >
                {/* We might need a wrapper to handle the auto-fit logic 
                 or use a library that handles it. 
                 react-simple-maps `ComposableMap` doesn't auto-fit by default.
                 
                 However, if we filter the features to just the city boundary,
                 we can use d3-geo to calculate the center and scale.
                 
                 Let's stick to the requirement: "Auto fit to boundary".
                 I will need `d3-geo` to calculate the projection fit.
             */}
                <ZoomableGroup zoom={1}>
                    <Geographies geography={geoUrl}>
                        {({ geographies }) =>
                            geographies.map((geo: any) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#D4C5B0" // Darker cream/latte for the land
                                    stroke="#FFFFFF" // White borders to separate districts
                                    strokeWidth={0.5}
                                    style={{
                                        default: { outline: "none" },
                                        hover: { fill: "#C3B091", outline: "none", cursor: "default" }, // Slightly darker on hover
                                        pressed: { outline: "none" },
                                    }}
                                />
                            ))
                        }
                    </Geographies>

                    {locations.map((loc) => (
                        <LocationMarker
                            key={loc.id}
                            lat={loc.lat}
                            lng={loc.lng}
                            name={loc.place_name}
                            onClick={() => router.push(`/location/${loc.google_place_id}`)}
                        />
                    ))}
                </ZoomableGroup>
            </ComposableMap>
        </div>
    );
}
