import { useEffect, useState } from 'react';
import CafeRecommendationCard from '../discovery/CafeRecommendationCard';
import ExploreListCard from '../discovery/ExploreListCard';
import * as listService from '@/services/listService';
import type { ListWithItems } from '@/core/types/types';

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

    const [exploreLists, setExploreLists] = useState<ListWithItems[]>([]);

    useEffect(() => {
        const fetchLists = async () => {
            const result = await listService.fetchPublicLists();
            if (result.success && result.data) {
                setExploreLists(result.data);
            }
        };
        fetchLists();
    }, []);

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
                    {exploreLists.length > 0 ? (
                        exploreLists.map((list) => (
                            <ExploreListCard
                                key={list.id}
                                title={list.title}
                                subtitle={`${list.item_count || 0} items`}
                                onClick={() => onListClick?.(list.id)}
                            />
                        ))
                    ) : (
                        <div className="px-3 py-4 text-xs text-journal-text/40 text-center italic">
                            no public lists yet... be the first?
                        </div>
                    )}
                </div>
                {exploreLists.length > 0 && (
                    <button className="w-full text-center text-journal-text/60 text-xs mt-3 hover:text-journal-text transition-colors">
                        see more lists
                    </button>
                )}
            </section>
        </aside>
    );
}
