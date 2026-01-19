"use client";

import { ReactNode } from 'react';
import LeftNav from './LeftNav';
import DiscoveryPanel from './DiscoveryPanel';
import TopHeader from './TopHeader';

interface JournalLayoutProps {
    children: ReactNode;
    selectedCity?: string;
    onCityChange?: (city: string) => void;
    onLogCoffeeClick?: () => void;
    onCafeClick?: (cafe: string) => void;
    onListClick?: (listId: string) => void;
    onShareClick?: () => void;
}

export default function JournalLayout({
    children,
    selectedCity,
    onCityChange,
    onLogCoffeeClick,
    onCafeClick,
    onListClick,
    onShareClick
}: JournalLayoutProps) {
    return (
        <div className="min-h-screen bg-journal-bg">
            {/* Top Header - Fixed */}
            <TopHeader
                selectedCity={selectedCity}
                onCityChange={onCityChange}
                onShareClick={onShareClick}
            />

            {/* Main Layout */}
            <div className="flex pt-16">
                {/* Left Navigation - Fixed */}
                <LeftNav onLogCoffeeClick={onLogCoffeeClick} />

                {/* Main Content Area */}
                <main className="flex-1 ml-56 mr-80">
                    {/* Center Feed - Scrollable */}
                    <div className="max-w-2xl mx-auto px-6 py-12">
                        {children}
                    </div>
                </main>

                {/* Right Discovery Panel - Fixed */}
                <div className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 overflow-y-auto py-8 pr-8 bg-journal-bg">
                    <DiscoveryPanel
                        onCafeClick={onCafeClick}
                        onListClick={onListClick}
                    />
                </div>
            </div>
        </div>
    );
}
