"use client";

import { Map } from "lucide-react";

export default function MapPlaceholder() {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground animate-in fade-in zoom-in duration-500">
            <div className="bg-secondary/20 p-6 rounded-full mb-4">
                <Map className="w-12 h-12 opacity-50" />
            </div>
            <p className="text-lg font-medium">Map coming soon</p>
            <p className="text-sm opacity-60 max-w-xs text-center mt-2">
                We're mapping out the best coffee spots for you. Stay tuned!
            </p>
        </div>
    );
}
