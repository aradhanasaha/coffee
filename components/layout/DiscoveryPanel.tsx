import { useEffect, useState } from 'react';
import CafeRecommendationCard from '../discovery/CafeRecommendationCard';
import ExploreListCard from '../discovery/ExploreListCard';
import * as listService from '@/services/listService';
import * as coffeeService from '@/services/coffeeService';
import type { ListWithItems, TopLocation } from '@/core/types/types';

interface DiscoveryPanelProps {
    onCafeClick?: (cafe: string) => void;
    onListClick?: (listId: string) => void;
}

export default function DiscoveryPanel({ onCafeClick, onListClick }: DiscoveryPanelProps) {
    const [exploreLists, setExploreLists] = useState<ListWithItems[]>([]);
    const [recommendations, setRecommendations] = useState<TopLocation[]>([]);
    const [showAllRecommendations, setShowAllRecommendations] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            // Fetch lists
            const listResult = await listService.fetchPublicLists();
            if (listResult.success && listResult.data) {
                setExploreLists(listResult.data);
            }

            // Fetch top locations
            const locs = await coffeeService.fetchTopLocations(10);
            setRecommendations(locs);
        };
        fetchData();
    }, []);

    const visibleRecommendations = showAllRecommendations ? recommendations : recommendations.slice(0, 3);

    return (
        <aside className="w-full space-y-6 lowercase">
            {/* Places You Might Like */}
            <section>
                <h2 className="text-journal-text font-semibold text-sm mb-2 px-3">
                    places you might like
                </h2>
                <div className="space-y-1">
                    {visibleRecommendations.length > 0 ? (
                        visibleRecommendations.map((cafe) => (
                            <CafeRecommendationCard
                                key={cafe.id}
                                name={cafe.name}
                                onClick={() => onCafeClick?.(cafe.name)}
                            />
                        ))
                    ) : (
                        <div className="px-3 py-4 text-xs text-journal-text/40 text-center italic">
                            log some coffee to see top places...
                        </div>
                    )}
                </div>
                {recommendations.length > 3 && (
                    <button
                        onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                        className="w-full text-center text-journal-text/60 text-xs mt-3 hover:text-journal-text transition-colors"
                    >
                        {showAllRecommendations ? 'show less' : 'see more recommendations'}
                    </button>
                )}
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
