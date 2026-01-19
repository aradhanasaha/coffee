"use client";

import { usePublicProfile } from '@/hooks/usePublicProfile';
import { useAuth } from '@/hooks/useAuth';
import UserProfileCard from '@/components/features/UserProfileCard';
import Header from '@/components/layout/Header';
import { useState } from 'react';

interface UserProfilePageProps {
    params: {
        username: string;
    };
}

export default function UserProfilePage({ params }: UserProfilePageProps) {
    const { username } = params;
    const { user } = useAuth();
    const { profile, stats, recentLogs, loading, error, refreshStats } = usePublicProfile(username);
    const [selectedCity, setSelectedCity] = useState("Delhi");

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

                {/* Recent Coffee Logs */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        Recent Coffee Logs
                        <span className="text-sm font-normal text-muted-foreground">
                            ({stats.totalLogs} total)
                        </span>
                    </h2>

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
            </div>
        </div>
    );
}
