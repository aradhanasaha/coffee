"use client";

import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useAuth } from '@/hooks/useAuth';
import UserProfileCard from '@/components/features/UserProfileCard';
import Header from '@/components/layout/Header';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Added for list navigation
import * as listService from '@/services/listService';
import ExploreListCard from '@/components/discovery/ExploreListCard';
import LogCoffeeForm from '@/components/features/LogCoffeeForm';
import Modal from '@/components/common/Modal';
import ProfileFeedCard from '@/components/features/ProfileFeedCard';
import type { ListWithItems, CoffeeLog } from '@/core/types/types';

interface UserProfilePageProps {
    params: {
        username: string;
    };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
    const { username } = params;
    const { user } = useAuth();
    const router = useRouter(); // Hook for navigation
    const { profile, stats, recentLogs, loading, error, refreshStats } = usePublicProfile(username);
    const [activeTab, setActiveTab] = useState<'history' | 'lists'>('history');
    const [myLists, setMyLists] = useState<ListWithItems[]>([]);
    const [listsLoading, setListsLoading] = useState(false);
    const [editingLogId, setEditingLogId] = useState<string | null>(null);

    const handleEditClick = (log: CoffeeLog) => {
        setEditingLogId(log.id);
    };

    const handleUpdateLog = () => {
        setEditingLogId(null);
        // Optimally we would refresh logs here, but usePublicProfile doesn't expose it yet.
        // We could force a reload or just let it be.
        window.location.reload();
    };

    // Fetch lists when tab changes to 'lists' and we have a profile
    useEffect(() => {
        const fetchLists = async () => {
            if (activeTab === 'lists' && profile) {
                setListsLoading(true);
                try {
                    // Check if viewing own profile
                    const isOwnProfile = user?.id === profile.user_id;

                    if (isOwnProfile) {
                        // Fetch own lists (public & private)
                        const ownListsResult = await listService.fetchUserLists(user.id);
                        // Fetch saved lists
                        const savedListsResult = await listService.fetchSavedLists(user.id);

                        const combinedLists = [
                            ...(ownListsResult.data || []),
                            ...(savedListsResult.data || [])
                        ];

                        // Remove duplicates if any (though logic suggests they shouldn't overlap in ID)
                        // But strictly getting unique by ID is safer
                        const uniqueLists = Array.from(new Map(combinedLists.map(list => [list.id, list])).values());

                        setMyLists(uniqueLists);
                    } else {
                        // Viewing someone else: Fetch ONLY their PUBLIC lists
                        // We reuse fetchUserLists but filter by visibility
                        const result = await listService.fetchUserLists(profile.user_id);
                        if (result.success && result.data) {
                            setMyLists(result.data.filter(l => l.visibility === 'public'));
                        } else if (result.data) {
                            setMyLists(result.data.filter(l => l.visibility === 'public'));
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch lists", err);
                } finally {
                    setListsLoading(false);
                }
            }
        };

        fetchLists();
    }, [activeTab, profile, user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-cream flex flex-col">
                <Header user={user} hideCitySelector />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-primary font-bold">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (error || !profile || !stats) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header user={user} hideCitySelector />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-primary mb-2">User Not Found</h1>
                        <p className="text-muted-foreground">
                            The user @{username} doesn't exist.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Header user={user} hideCitySelector />

            <div className="container mx-auto max-w-4xl px-3 md:px-4 py-4 md:py-8 space-y-4 md:space-y-8">
                {/* Profile Card */}
                <UserProfileCard
                    profile={profile}
                    stats={stats}
                    currentUserId={user?.id || null}
                    onFollowChange={refreshStats}
                />

                {/* Tabs */}
                {/* Tabs - Only for own profile */}
                {user?.id === profile.user_id ? (
                    <div className="flex items-center gap-6 border-b border-primary/10 mb-6">
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'history'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-primary/70'
                                }`}
                        >
                            <span>
                                My Coffee History
                            </span>
                            {activeTab === 'history' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('lists')}
                            className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'lists'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-primary/70'
                                }`}
                        >
                            <span>
                                My Lists
                            </span>
                            {activeTab === 'lists' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-primary">Coffee Logs</h2>
                    </div>
                )}

                {/* Content */}
                {activeTab === 'history' ? (
                    <section>
                        {recentLogs.length === 0 ? (
                            <div className="bg-card rounded-2xl border-2 border-dashed border-primary/20 p-12 text-center text-muted-foreground">
                                No coffee logs yet
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {recentLogs.map((log) => (
                                    <ProfileFeedCard
                                        key={log.id}
                                        log={log}
                                        author={profile}
                                        isOwner={user?.id === log.user_id}
                                        onEdit={handleEditClick}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                ) : (
                    <section>
                        {listsLoading ? (
                            <div className="text-center py-12 text-muted-foreground">Loading lists...</div>
                        ) : myLists.length === 0 ? (
                            <div className="bg-card rounded-2xl border-2 border-dashed border-primary/20 p-12 text-center text-muted-foreground">
                                No lists found
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {myLists.map((list) => (
                                    <ExploreListCard
                                        key={list.id}
                                        title={list.title}
                                        subtitle={`${list.item_count || 0} items`}
                                        curatedBy={list.owner?.username}
                                        onClick={() => router.push(`/lists/${list.id}?from=profile`)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div >
    );
}
