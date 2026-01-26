"use client";

import { useEffect, useState } from 'react';
import ExploreListCard from '@/components/discovery/ExploreListCard';
import * as listService from '@/services/listService';
import { useRouter } from 'next/navigation';
import { ListWithItems } from '@/core/types/types';

export default function FeaturedLists() {
    const router = useRouter();
    const [exploreLists, setExploreLists] = useState<ListWithItems[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLists = async () => {
            setLoading(true);
            const result = await listService.fetchPublicLists();

            if (result.success && result.data) {
                setExploreLists(result.data.slice(0, 3)); // Limit to top 3
            }
            setLoading(false);
        };
        fetchLists();
    }, []);

    return (
        <aside className="w-full space-y-4 lowercase">
            <h2 className="text-journal-text font-semibold text-lg mb-4">
                Featured lists
            </h2>
            <div className="space-y-3">
                {loading ? (
                    <div className="text-journal-text/40 text-sm italic animate-pulse">
                        loading lists...
                    </div>
                ) : exploreLists.length > 0 ? (
                    exploreLists.map((list) => (
                        <ExploreListCard
                            key={list.id}
                            title={list.title}
                            subtitle={`${list.item_count || 0} items`}
                            curatedBy={list.owner?.username}
                            onClick={() => router.push(`/lists/${list.id}`)}
                        />
                    ))
                ) : (
                    <div className="text-journal-text/40 text-sm italic">
                        no public lists yet...
                    </div>
                )}
            </div>
        </aside>
    );
}
