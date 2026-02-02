"use client";

import { ReactNode } from 'react';
import LeftNav from './LeftNav';
import DiscoveryPanel from './DiscoveryPanel';
import TopHeader from './TopHeader';
import BottomNav from './BottomNav';
import NotificationCTA from '@/components/features/NotificationCTA';

interface JournalLayoutProps {
    children: ReactNode;
    onLogCoffeeClick?: () => void;
    onCafeClick?: (cafe: string) => void;
    onListClick?: (listId: string) => void;
    onShareClick?: () => void;
    showRightPanel?: boolean;
    rightPanel?: ReactNode;
}

export default function JournalLayout({
    children,
    onLogCoffeeClick,
    onCafeClick,
    onListClick,
    onShareClick,
    showRightPanel = true,
    rightPanel
}: JournalLayoutProps) {
    return (
        <div className="min-h-screen bg-journal-bg">
            {/* Top Header - Fixed */}
            <TopHeader
                onShareClick={onShareClick}
            />

            {/* Notification CTA Banner - Fixed below header */}
            <div className="fixed top-16 left-0 right-0 z-40 flex justify-center pointer-events-none">
                <div className="pointer-events-auto mt-2">
                    <NotificationCTA />
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex pt-16">
                {/* Left Navigation - Fixed */}
                <div className="hidden md:flex">
                    <LeftNav onLogCoffeeClick={onLogCoffeeClick} />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 ml-0 md:ml-56 mr-0 md:mr-80 pb-20 md:pb-0">
                    {/* Center Feed - Scrollable */}
                    <div className="max-w-2xl mx-auto px-6 py-12">
                        {children}
                    </div>
                </main>

                {/* Right Discovery Panel - Fixed */}
                {(showRightPanel || rightPanel) && (
                    <div className="hidden md:block fixed right-0 top-16 h-[calc(100vh-4rem)] w-80 overflow-y-auto py-8 pr-8 bg-journal-bg">
                        {rightPanel ? rightPanel : (
                            <DiscoveryPanel
                                onCafeClick={onCafeClick}
                                onListClick={onListClick}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Navigation - Mobile Only */}
            <BottomNav onLogCoffeeClick={onLogCoffeeClick} />
        </div>
    );
}
