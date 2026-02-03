"use client";

import { useState } from 'react';
import JournalLayout from '@/components/layout/JournalLayout';
import ExploreTabs from '@/components/features/explore/ExploreTabs';
import ExploreListsGrid from '@/components/features/explore/ExploreListsGrid';
import MapPlaceholder from '@/components/features/explore/MapPlaceholder';

export default function ExplorePage() {
    const [activeTab, setActiveTab] = useState<'lists' | 'map'>('lists');

    return (
        <JournalLayout showRightPanel={false}>
            <div className="min-h-screen">
                {/* Tab Switcher */}
                <ExploreTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {/* Content Area */}
                <div className="mt-2 animate-in fade-in duration-500">
                    {activeTab === 'lists' ? (
                        <ExploreListsGrid />
                    ) : (
                        <MapPlaceholder />
                    )}
                </div>
            </div>
        </JournalLayout>
    );
}
