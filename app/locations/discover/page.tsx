"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as coffeeService from '@/services/coffeeService';
import type { TopLocation } from '@/core/types/types';
import CafeRecommendationCard from '@/components/discovery/CafeRecommendationCard';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

export default function MobileLocationDiscovery() {
    const [locations, setLocations] = useState<TopLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchLocations = async () => {
            const result = await coffeeService.fetchTopLocations(20);
            setLocations(result);
            setLoading(false);
        };
        fetchLocations();
    }, []);

    return (
        <div className="min-h-screen bg-journal-bg pb-20 lowercase">
            {/* Mobile Header */}
            <header className="sticky top-0 bg-journal-bg/95 backdrop-blur-sm z-10 px-4 py-4 border-b border-primary/5 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="p-1 hover:bg-black/5 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-journal-text" />
                </button>
                <h1 className="text-xl font-bold text-journal-text">places you might like</h1>
            </header>

            <main className="p-4 space-y-2">
                {loading ? (
                    // Loading Skeletons
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-16 bg-journal-card animate-pulse rounded-xl" />
                    ))
                ) : locations.length > 0 ? (
                    locations.map((loc) => (
                        <CafeRecommendationCard
                            key={loc.id}
                            name={loc.name}
                            onClick={() => {
                                // Placeholder for now, or assume standard prop
                                // In DiscoveryPanel it was onCafeClick
                            }}
                        />
                    ))
                ) : (
                    <div className="text-center py-12 text-journal-text/60">
                        <p>no recommendations yet.</p>
                    </div>
                )}
            </main>

            <BottomNav />
        </div>
    );
}
