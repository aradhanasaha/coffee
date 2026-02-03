"use client";

import { useState } from 'react';
import JournalLayout from '@/components/layout/JournalLayout';
import ExploreTabs from '@/components/features/explore/ExploreTabs';
import ExploreListsGrid from '@/components/features/explore/ExploreListsGrid';
import MapPlaceholder from '@/components/features/explore/MapPlaceholder';
import { ArrowLeft } from 'lucide-react';

export default function ExplorePage() {
    const [activeTab, setActiveTab] = useState<'lists' | 'map'>('lists');

    return (
        <JournalLayout showRightPanel={false}>
            <div className="min-h-screen">
                {/* Back Link Header */}
                <div className="flex items-center p-4">
                    <a href="/home" className="flex items-center gap-1 text-journal-text/60 hover:text-journal-text transition-colors text-sm lowercase">
                        <ArrowLeft className="w-4 h-4" />
                        back to feed
                    </a>
                </div>

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
