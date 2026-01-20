"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Share2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import * as listService from '@/services/listService';
import JournalLayout from '@/components/layout/JournalLayout';
import LocationCard from '@/components/features/lists/LocationCard';
import type { ListWithItems } from '@/core/types/types';

export default function ListDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const [list, setList] = useState<ListWithItems | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            const result = await listService.fetchListDetails(params.id);
            if (result.success && result.data) {
                setList(result.data);
            } else {
                setError(result.error || 'Failed to load list');
            }
            setLoading(false);
        };
        fetchList();
    }, [params.id]);

    const handleSaveList = async () => {
        if (!user || !list) return;
        setSaving(true);
        // Toggle save logic here (create/delete list_save)
        // For V1 just implement save
        const result = await listService.saveList(user.id, list.id);
        if (result.success) {
            setIsSaved(true);
        }
        setSaving(false);
    };

    const handleShare = () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: list?.title || 'Coffee List',
                url: window.location.href
            });
        } else {
            // Fallback copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            // toast('Link copied');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-journal-bg flex items-center justify-center">
                <div className="text-journal-text/60 animate-pulse">loading...</div>
            </div>
        );
    }

    if (error || !list) {
        return (
            <div className="min-h-screen bg-journal-bg flex flex-col items-center justify-center p-8 text-center">
                <p className="text-xl font-bold mb-4">List not found</p>
                <button
                    onClick={() => router.back()}
                    className="text-primary hover:underline"
                >
                    Go back
                </button>
            </div>
        );
    }

    const isOwner = user?.id === list.owner_id;

    // Filter unique locations for Featured Cafes
    const uniqueLogs = list.logs?.filter((log, index, self) =>
        index === self.findIndex((t) => (
            (t.location_id && log.location_id && t.location_id === log.location_id) ||
            (!t.location_id && !log.location_id && t.place === log.place)
        ))
    ) || [];

    return (
        <JournalLayout>
            <div className="max-w-2xl mx-auto py-8">
                {/* Back to Feed */}
                <button
                    onClick={() => router.push('/home')}
                    className="flex items-center gap-2 text-journal-text/60 hover:text-journal-text transition-colors mb-8 text-sm lowercase"
                >
                    <ArrowLeft className="w-4 h-4" />
                    back to feed
                </button>

                {/* Header Section */}
                <div className="text-center mb-12 space-y-4 relative">
                    {/* Action Buttons - Absolute positioned on desktop, stacked on mobile? Wireframe shows them top right relative to content or container */}
                    <div className="flex justify-center md:absolute md:right-0 md:top-0 gap-2 mb-4 md:mb-0">
                        {!isOwner && (
                            <button
                                onClick={handleSaveList}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${isSaved
                                    ? 'bg-journal-text text-journal-card border-journal-text'
                                    : 'border-journal-text text-journal-text hover:bg-journal-text/5'
                                    }`}
                            >
                                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                                {isSaved ? 'Saved' : 'Save this list'}
                            </button>
                        )}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-journal-text text-journal-text hover:bg-journal-text/5 transition-all"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>

                    <h1 className="text-4xl font-bold text-journal-text lowercase tracking-tight mb-2">
                        {list.title}
                    </h1>

                    <div className="text-journal-text/60 font-medium">
                        curated by: <span className="text-journal-text hover:underline cursor-pointer" onClick={() => list.owner?.username && router.push(`/user/${list.owner.username}`)}>@{list.owner?.username || 'unknown'}</span>
                    </div>

                    {list.description && (
                        <p className="text-journal-text/80 max-w-md mx-auto mt-4 text-sm leading-relaxed">
                            {list.description}
                        </p>
                    )}
                </div>

                {/* Grid Section */}
                <div className="space-y-6">
                    <h2 className="text-lg font-medium text-journal-text lowercase">
                        featured cafes
                    </h2>

                    {uniqueLogs && uniqueLogs.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {uniqueLogs.map(log => (
                                <LocationCard
                                    key={log.id}
                                    log={log}
                                    onClick={() => { }} // Could open log details modal in future
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 text-journal-text/40 bg-journal-card rounded-3xl border-2 border-dashed border-journal-text/5">
                            <p>No cafes in this list yet.</p>
                        </div>
                    )}
                </div>

                {uniqueLogs && uniqueLogs.length > 9 && (
                    <button className="w-full py-8 text-center text-journal-text/60 font-medium hover:text-journal-text transition-colors mt-8">
                        View More
                    </button>
                )}
            </div>
        </JournalLayout>
    );
}
