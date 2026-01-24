"use client";

import JournalLayout from '@/components/layout/JournalLayout';

export default function ExplorePage() {
    return (
        <JournalLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h1 className="text-2xl font-bold text-journal-text">Explore</h1>
                <p className="text-muted-foreground">Discover new cafes and friends. Coming really soon!</p>
            </div>
        </JournalLayout>
    );
}
