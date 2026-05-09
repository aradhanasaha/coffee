import { useEffect, useState } from 'react';
import CafeRecommendationCard from '../discovery/CafeRecommendationCard';
import * as coffeeService from '@/services/coffeeService';
import type { TopLocation } from '@/core/types/types';

interface DiscoveryPanelProps {
    onCafeClick?: (cafe: string) => void;
}

export default function DiscoveryPanel({ onCafeClick }: DiscoveryPanelProps) {
    const [recommendations, setRecommendations] = useState<TopLocation[]>([]);

    useEffect(() => {
        coffeeService.fetchTopLocations(5).then(setRecommendations);
    }, []);

    return (
        <aside className="w-full space-y-6 lowercase">
            <section>
                <h2 className="text-journal-text font-semibold text-sm mb-2 px-3">
                    places you might like
                </h2>
                <div className="space-y-1">
                    {recommendations.length > 0 ? (
                        recommendations.map((cafe) => (
                            <CafeRecommendationCard
                                key={cafe.id}
                                name={cafe.name}
                                onClick={() => onCafeClick?.(cafe.id)}
                            />
                        ))
                    ) : (
                        <div className="px-3 py-4 text-xs text-journal-text/40 text-center italic">
                            log some coffee to see top places...
                        </div>
                    )}
                </div>
            </section>
        </aside>
    );
}
