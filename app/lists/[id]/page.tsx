"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bookmark, Share2, ArrowLeft, Pencil, Trash2, Check, X, Lock, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import * as listService from '@/services/listService';
import SaveListButton from '@/components/features/lists/SaveListButton';
import JournalLayout from '@/components/layout/JournalLayout';
import LocationCard from '@/components/features/lists/LocationCard';
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
        >
            <div className="max-w-2xl mx-auto py-8">
                {/* Back to Feed/Profile */}
                <button
                    onClick={() => fromProfile ? router.push('/user') : router.push('/home')}
                    className="flex items-center gap-2 text-journal-text/60 hover:text-journal-text transition-colors mb-8 text-sm lowercase"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {fromProfile ? 'back to profile' : 'back to feed'}
                </button>

                {/* Header Section */}
                <div className="text-center mb-12 space-y-4 relative">
                    <div className="flex justify-center md:absolute md:right-0 md:top-0 gap-2 mb-4 md:mb-0">
                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-journal-text text-journal-text hover:bg-journal-text/5 transition-all"
                            title="Share List"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>

                        {/* Save Button (non-owners) */}
                        {!isOwner && list && (
                            <SaveListButton listId={list.id} />
                        )}



                        {/* Delete Button (owners) */}
                        {isOwner && (
                            <button
                                onClick={handleDeleteList}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300 transition-all"
                                title="Delete List"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-center gap-3 md:px-48">
                        {isEditing ? (
                            <div className="flex flex-col items-center gap-2 w-full max-w-md">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="text-3xl md:text-4xl font-bold text-journal-text text-center bg-transparent border-b-2 border-primary focus:outline-none w-full"
                                    autoFocus
                                    onBlur={handleUpdateTitle}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                                />
                                <div className="flex justify-center gap-2">
                                    <button
                                        onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                        onClick={handleUpdateTitle}
                                        className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors"
                                        disabled={updating}
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button
                                        onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                                        onClick={() => {
                                            setEditTitle(list.title);
                                            setIsEditing(false);
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 group relative">
                                <h1 className="text-4xl font-bold text-journal-text lowercase tracking-tight mb-2">
                                    {list.title}
                                </h1>
                                {isOwner && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-journal-text/30 hover:text-primary transition-colors p-2"
                                        title="Edit list name"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative flex items-center justify-center w-full">
                        {isOwner && (
                            <button
                                onClick={async () => {
                                    if (!list) return;
                                    const newVisibility = list.visibility === 'public' ? 'private' : 'public';
                                    const result = await listService.updateList(list.id, { visibility: newVisibility });
                                    if (result.success) {
                                        setList({ ...list, visibility: newVisibility });
                                    }
                                }}
                                className={`absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${list.visibility === 'public'
                                    ? 'border-green-200 text-green-700 hover:bg-green-50'
                                    : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                    }`}
                                title={`Make ${list.visibility === 'public' ? 'Private' : 'Public'}`}
                            >
                                {list.visibility === 'public' ? (
                                    <>
                                        <Globe className="w-3.5 h-3.5" />
                                        Public
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-3.5 h-3.5" />
                                        Private
                                    </>
                                )}
                            </button>
                        )}
                        <div className="text-journal-text/60 font-medium">
                            curated by: <span className="text-journal-text hover:underline cursor-pointer" onClick={() => list.owner?.username && router.push(`/user/${list.owner.username}`)}>@{list.owner?.username || 'unknown'}</span>
                        </div>
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
