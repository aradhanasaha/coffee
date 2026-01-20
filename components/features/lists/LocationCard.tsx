"use client";

import { MapPin } from 'lucide-react';
import type { CoffeeLog } from '@/core/types/types';

interface LocationCardProps {
    log: CoffeeLog;
    onClick?: () => void;
}

export default function LocationCard({ log, onClick }: LocationCardProps) {
    return (
        <button
            onClick={onClick}
            className="aspect-square w-full bg-journal-card border border-journal-text/10 rounded-2xl flex flex-col items-center justify-center p-4 hover:border-journal-text/30 transition-all group relative overflow-hidden"
        >
            {/* Placeholder for future photo bg */}
            <div className="absolute inset-0 bg-journal-text/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10 text-center space-y-2">
                <span className="text-sm font-medium text-journal-text lowercase line-clamp-2">
                    {log.place}
                </span>

                {/* Optional: Show area if available later */}
                {/* <p className="text-xs text-journal-text/40 lowercase">location</p> */}
            </div>
        </button>
    );
}
