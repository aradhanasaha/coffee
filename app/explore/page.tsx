"use client";

import { useState, useEffect } from 'react';
import JournalLayout from '@/components/layout/JournalLayout';
import { useRouter } from 'next/navigation';
import { fetchTopLocations } from '@/services/coffeeService';
import type { TopLocation } from '@/core/types/types';
import { MapPin } from 'lucide-react';

export default function ExplorePage() {
    const router = useRouter();
    const [locations, setLocations] = useState<TopLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchTopLocations(50).then((locs) => {
            setLocations(locs);
            setLoading(false);
        });
    }, []);

    return (
        <JournalLayout showRightPanel={false}>
            <div className="space-y-8">
                <h1 className="text-3xl font-sans font-medium text-journal-text lowercase">explore</h1>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <div key={i} className="aspect-square rounded-2xl bg-journal-text/5 animate-pulse" />
                        ))}
                    </div>
                ) : locations.length === 0 ? (
                    <p className="text-journal-text/50 italic text-center py-20">
                        no places logged yet. start logging!
                    </p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {locations.map((loc) => (
                            <button
                                key={loc.id}
                                onClick={() => router.push(`/locations/${loc.id}`)}
                                className="group relative aspect-square rounded-2xl overflow-hidden bg-card border border-border/50 hover:border-primary/20 transition-all duration-300 text-left"
                            >
                                {loc.image && !failedImages.has(loc.id) ? (
                                    <img
                                        src={loc.image}
                                        alt={loc.name}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={() => setFailedImages(prev => new Set(prev).add(loc.id))}
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-secondary/40 flex items-center justify-center p-4">
                                        <p className="text-journal-text font-serif text-xl font-bold text-center leading-tight opacity-40 uppercase tracking-widest break-words w-full">
                                            {loc.name}
                                        </p>
                                    </div>
                                )}
                                {loc.image && !failedImages.has(loc.id) && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />
                                )}
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <h3 className="text-white font-semibold text-sm line-clamp-2 leading-tight">
                                        {loc.name.toLowerCase()}
                                    </h3>
                                    {loc.area && (
                                        <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {loc.area.toLowerCase()}
                                        </p>
                                    )}
                                    <p className="text-white/50 text-xs mt-0.5">
                                        {loc.count} {loc.count === 1 ? 'log' : 'logs'}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </JournalLayout>
    );
}
