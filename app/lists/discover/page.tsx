"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as listService from '@/services/listService';
import type { ListWithItems } from '@/core/types/types';
import ExploreListCard from '@/components/discovery/ExploreListCard';
import { ArrowLeft } from 'lucide-react';
import BottomNav from '@/components/layout/BottomNav';

export default function MobileListDiscovery() {
    const [lists, setLists] = useState<ListWithItems[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchLists = async () => {
            const result = await listService.fetchPublicLists();
            if (result.success && result.data) {
                setLists(result.data);
            }
            setLoading(false);
        };
        fetchLists();
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
                <h1 className="text-xl font-bold text-journal-text">explore lists</h1>
            </header>

            <main className="p-4 space-y-4">
                {loading ? (
                    // Loading Skeletons
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 bg-journal-card animate-pulse rounded-2xl" />
                    ))
                ) : lists.length > 0 ? (
                    lists.map((list) => (
                        <div key={list.id} className="bg-journal-card rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform">
                            <ExploreListCard
                                title={list.title}
                                subtitle={`${list.item_count || 0} items`} // Simplified reusing existing card, can optimize later if needed
                                onClick={() => router.push(`/lists/${list.id}`)}
                            />
                            {/* Assuming ExploreListCard is simple, we might want to wrap it or just use it. 
                                Actually ExploreListCard might be too simple (just title/subtitle). 
                                Let's see if we can enhance it or if it's enough. 
                                For now, reusing it inside a container style.
                            */}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-journal-text/60">
                        <p>no public lists found yet.</p>
                    </div>
                )}
            </main>

            {/* Ensure BottomNav is present for mobile context */}
            <BottomNav />
        </div>
    );
}
