"use client";

import Script from "next/script";

export default function MapsProvider({ children }: { children: React.ReactNode }) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    return (
        <>
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
                strategy="afterInteractive"
                onLoad={() => window.dispatchEvent(new CustomEvent('google-maps-loaded'))}
            />
            {children}
        </>
    );
}
