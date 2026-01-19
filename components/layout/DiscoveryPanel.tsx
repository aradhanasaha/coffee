"use client";

import CafeRecommendationCard from '../discovery/CafeRecommendationCard';
import ExploreListCard from '../discovery/ExploreListCard';

interface DiscoveryPanelProps {
    onCafeClick?: (cafe: string) => void;
    onListClick?: (listId: string) => void;
}

export default function DiscoveryPanel({ onCafeClick, onListClick }: DiscoveryPanelProps) {
    // Mock data for recommendations (we'll fetch real data later)
    const cafeRecommendations = [
        { name: 'Blue tokai', area: 'Priya Market' },
        { name: 'Third Wave', area: 'Priya Market' },
        { name: 'First Coffee', area: 'Priya Market' },
    ];

    const exploreLists = [
        { id: '1', title: 'quiet cafés to sit with yourself', subtitle: '12 cafés · updated this week' },
        { id: '2', title: 'first coffees logged this month', subtitle: '28 cafés · daily updated' },
        { id: '3', title: 'most photographed mugs', subtitle: '45 logs · trending' },
        { id: '4', title: 'cafés people lingered at', subtitle: '19 cafés · curated' },
        { id: '5', title: 'south delhi regulars', subtitle: '31 cafés · by area' },
    ];

    return (
        <aside className="w-full space-y-6 lowercase">
            {/* Places You Might Like */}
            <section>
                <h2 className="text-journal-text font-semibold text-sm mb-2 px-3">
                    places you might like
                </h2>
                <div className="space-y-1">
                    {cafeRecommendations.map((cafe, index) => (
                        <CafeRecommendationCard
                            key={index}
                            name={cafe.name}
                            area={cafe.area}
                            onClick={() => onCafeClick?.(cafe.name)}
                        />
                    ))}
                </div>
                <button className="w-full text-center text-journal-text/60 text-xs mt-3 hover:text-journal-text transition-colors">
                    see more recommendations
                </button>
            </section>

            {/* Explore Lists */}
            <section>
                <h2 className="text-journal-text font-semibold text-sm mb-4 px-3">
                    explore lists
                </h2>
                <div className="space-y-1">
                    {exploreLists.slice(0, 3).map((list) => (
                        <ExploreListCard
                            key={list.id}
                            title={list.title}
                            subtitle={list.subtitle}
                            onClick={() => onListClick?.(list.id)}
                        />
                    ))}
                </div>
                <button className="w-full text-center text-journal-text/60 text-xs mt-3 hover:text-journal-text transition-colors">
                    see more lists
                </button>
            </section>
        </aside>
    );
}
