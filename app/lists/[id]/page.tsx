"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bookmark, Share2, ArrowLeft, Pencil, Trash2, Check, X, Lock, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import * as listService from '@/services/listService';
import SaveListButton from '@/components/features/lists/SaveListButton';
import JournalLayout from '@/components/layout/JournalLayout';
import ExploreLocationCard from '@/components/features/explore/ExploreLocationCard';
import type { ListWithItems } from '@/core/types/types';

export default function ListDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromProfile = searchParams.get('from') === 'profile';
    const { user } = useAuth();
    const [list, setList] = useState<ListWithItems | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchList = async () => {
            setLoading(true);
            const result = await listService.fetchListDetails(params.id);
            if (result.success && result.data) {
                setList(result.data);
                setEditTitle(result.data.title);


            } else {
                setError(result.error || 'Failed to load list');
            }
            setLoading(false);
        };
        fetchList();
    }, [params.id, user]);



    const handleShare = () => {
        if (typeof navigator !== 'undefined' && navigator.share) {
            navigator.share({
                title: list?.title || 'Coffee List',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    const handleUpdateTitle = async () => {
        if (!list || !editTitle.trim()) return;

        if (editTitle.trim() === list.title) {
            setIsEditing(false);
            return;
        }

        setUpdating(true);
        const result = await listService.updateList(list.id, { title: editTitle.trim() });

        if (result.success) {
            setList(prev => prev ? { ...prev, title: editTitle.trim() } : null);
            setIsEditing(false);
        } else {
            alert('Failed to update list name');
        }
        setUpdating(false);
    };

    const handleDeleteList = async () => {
        if (!list || !confirm('Are you sure you want to delete this list?')) return;

        const result = await listService.deleteList(list.id);

        if (result.success) {
            router.push('/user'); // Redirect to user profile
            router.refresh();
        } else {
            alert('Failed to delete list: ' + (result.error || 'Unknown error'));
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
        <JournalLayout
            onListClick={(listId) => router.push(`/lists/${listId}`)}
            showRightPanel={false} // Minimal mode
        >
            <div className="max-w-2xl mx-auto pb-20">
                {/* Minimal Header */}
                <div className="mb-6 space-y-2">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors text-sm mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="flex items-start justify-between">
                        <h1 className="text-2xl font-bold text-foreground leading-tight tracking-tight">
                            {list.title}
                        </h1>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleShare}
                                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                            {/* Save/Delete logic retained but simplified styles if needed... */}
                            {isOwner && (
                                <button
                                    onClick={handleDeleteList}
                                    className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        by <span className="text-foreground font-medium">@{list.owner?.username || 'unknown'}</span>
                    </p>
                </div>

                {/* Grid Section */}
                {uniqueLogs && uniqueLogs.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {uniqueLogs.map(log => (
                            <div key={log.id}>
                                <ExploreLocationCard log={log} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed border-border">
                        <p>No cafes in this list yet.</p>
                    </div>
                )}
            </div>
        </JournalLayout>
    );
}
