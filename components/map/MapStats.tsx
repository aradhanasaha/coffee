"use client";

import type { CoffeeMapStats } from '@/core/types/types';
import { MapPin, Coffee, Star } from 'lucide-react';

interface MapStatsProps {
    stats: CoffeeMapStats;
}

export default function MapStats({ stats }: MapStatsProps) {
    if (stats.total_cafes === 0) return null;

    return (
        <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-journal-card rounded-2xl px-4 py-3 border border-journal-text/8 text-center">
                <Coffee className="w-4 h-4 text-journal-text/40 mx-auto mb-1" />
                <p className="text-2xl font-bold text-journal-text leading-none">{stats.total_cafes}</p>
                <p className="text-[11px] text-journal-text/50 mt-1 lowercase">
                    {stats.total_cafes === 1 ? 'café' : 'cafés'}
                </p>
            </div>

            <div className="bg-journal-card rounded-2xl px-4 py-3 border border-journal-text/8 text-center">
                <MapPin className="w-4 h-4 text-journal-text/40 mx-auto mb-1" />
                <p className="text-2xl font-bold text-journal-text leading-none">{stats.total_cities}</p>
                <p className="text-[11px] text-journal-text/50 mt-1 lowercase">
                    {stats.total_cities === 1 ? 'city' : 'cities'}
                </p>
            </div>

            <div className="bg-journal-card rounded-2xl px-4 py-3 border border-journal-text/8 text-center">
                <Star className="w-4 h-4 text-journal-text/40 mx-auto mb-1" />
                <p className="text-sm font-bold text-journal-text leading-snug line-clamp-1 lowercase">
                    {stats.most_visited?.place_name || '—'}
                </p>
                <p className="text-[11px] text-journal-text/50 mt-1 lowercase">most visited</p>
            </div>
        </div>
    );
}
