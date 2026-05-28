"use client";

import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useAuth } from '@/hooks/useAuth';
import { useCoffeeMap } from '@/hooks/useCoffeeMap';
import UserProfileCard from '@/components/features/UserProfileCard';
import Header from '@/components/layout/Header';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import LogCoffeeForm from '@/components/features/LogCoffeeForm';
import Modal from '@/components/common/Modal';
import ProfileFeedCard from '@/components/features/ProfileFeedCard';
import type { CoffeeLog } from '@/core/types/types';

const CoffeeMap = dynamic(
    () => import('@/components/map/CoffeeMap'),
    {
        ssr: false,
        loading: () => (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 rounded-2xl bg-journal-text/5 animate-pulse" />
                    ))}
                </div>
                <div className="w-full h-[380px] md:h-[460px] rounded-2xl bg-journal-text/5 animate-pulse" />
            </div>
        ),
    }
);

type ProfileTab = 'logs' | 'map';

interface UserProfilePageProps {
    params: {
        username: string;
    };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
    const { username } = params;
    const { user } = useAuth();
    const { profile, stats, recentLogs, loading, error, refreshStats } = usePublicProfile(username);
    const [activeTab, setActiveTab] = useState<ProfileTab>('logs');
    const [editingLogId, setEditingLogId] = useState<string | null>(null);

    const { pins, stats: mapStats, loading: mapLoading } = useCoffeeMap(
        activeTab === 'map' ? (profile?.user_id ?? null) : null
    );

    const handleEditClick = (log: CoffeeLog) => setEditingLogId(log.id);
    const handleUpdateLog = () => {
        setEditingLogId(null);
        window.location.reload();
    };

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
                        <p className="text-muted-foreground">The user @{username} doesn't exist.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream flex flex-col">
            <Header user={user} hideCitySelector />

            <div className="container mx-auto max-w-4xl px-3 md:px-4 py-4 md:py-8 space-y-4 md:space-y-6">
                <UserProfileCard
                    profile={profile}
                    stats={stats}
                    currentUserId={user?.id || null}
                    onFollowChange={refreshStats}
                />

                {/* Tabs */}
                <div className="flex gap-6 border-b border-journal-text/10">
                    {(['logs', 'map'] as ProfileTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-2.5 text-sm font-medium transition-colors lowercase tracking-wide ${
                                activeTab === tab
                                    ? 'text-journal-text border-b-2 border-journal-text'
                                    : 'text-journal-text/40 hover:text-journal-text/70'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab content */}
                {activeTab === 'logs' && (
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
                )}

                {activeTab === 'map' && (
                    <CoffeeMap pins={pins} stats={mapStats} loading={mapLoading} />
                )}
            </div>

            <Modal isOpen={!!editingLogId} onClose={() => setEditingLogId(null)}>
                <div className="p-1">
                    {editingLogId && recentLogs.find(l => l.id === editingLogId) && (
                        <LogCoffeeForm
                            initialData={recentLogs.find(l => l.id === editingLogId)}
                            onSuccess={handleUpdateLog}
                            submitLabel="Save Changes"
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
}
