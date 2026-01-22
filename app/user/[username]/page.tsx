"use client";

import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useAuth } from '@/hooks/useAuth';
import UserProfileCard from '@/components/features/UserProfileCard';
import Header from '@/components/layout/Header';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Added for list navigation
import * as listService from '@/services/listService';
import ExploreListCard from '@/components/discovery/ExploreListCard';
import type { ListWithItems } from '@/core/types/types';

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
    const [selectedCity, setSelectedCity] = useState("Delhi");
    const [activeTab, setActiveTab] = useState<'history' | 'lists'>('history');
    const [myLists, setMyLists] = useState<ListWithItems[]>([]);
    const [listsLoading, setListsLoading] = useState(false);

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
                <Header selectedCity={selectedCity} onSelectCity={setSelectedCity} user={user} />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-primary font-bold">Loading profile...</div>
                </div>
            </div>
        );
    }

    if (error || !profile || !stats) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header selectedCity={selectedCity} onSelectCity={setSelectedCity} user={user} />
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
            <Header selectedCity={selectedCity} onSelectCity={setSelectedCity} user={user} />

            <div className="container mx-auto max-w-4xl px-3 md:px-4 py-4 md:py-8 space-y-4 md:space-y-8">
                {/* Profile Card */}
                <UserProfileCard
                    profile={profile}
                    stats={stats}
                    currentUserId={user?.id || null}
                    onFollowChange={refreshStats}
                />

                {/* Tabs */}
                <div>
                    <div className="flex items-center gap-6 border-b border-primary/10 mb-6">
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`pb-3 text-sm font-bold transition-colors relative ${activeTab === 'history'
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-primary/70'
                                }`}
                        >
                            <span className="flex items-center gap-2">
                                📅 My Coffee History
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
                            <span className="flex items-center gap-2">
                                📋 My Lists
                            </span>
                            {activeTab === 'lists' && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                            )}
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'history' ? (
                        <section>
                            {recentLogs.length === 0 ? (
                                <div className="bg-card rounded-2xl border-2 border-dashed border-primary/20 p-12 text-center text-muted-foreground">
                                    No coffee logs yet
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className="bg-card p-5 rounded-2xl border-2 border-primary/10 hover:border-primary/20 transition-all"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-lg">{log.coffee_name}</h3>
                                                    <p className="text-sm text-muted-foreground">{log.place}</p>
                                                </div>
                                                <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
                                                    <span className="font-bold text-primary">{log.rating}</span>
                                                    <span className="text-xs text-primary">★</span>
                                                </div>
                                            </div>

                                            {log.review && (
                                                <p className="mt-3 text-sm text-foreground/80 italic">
                                                    "{log.review}"
                                                </p>
                                            )}

                                            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                                                <span>{new Date(log.created_at).toLocaleDateString()}</span>
                                                {log.price_feel && (
                                                    <span className="px-2 py-1 rounded-full bg-secondary text-secondary-foreground font-bold">
                                                        {log.price_feel === 'steal' && '💰 Steal'}
                                                        {log.price_feel === 'fair' && '✓ Fair'}
                                                        {log.price_feel === 'expensive' && '💸 Pricey'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
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
                                            onClick={() => router.push(`/lists/${list.id}`)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}
