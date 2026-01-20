"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import JournalLayout from "@/components/layout/JournalLayout";
import JournalFeedCard from "@/components/features/JournalFeedCard";
import Modal from "@/components/common/Modal";
import PhotoFirstLogCoffeeForm from "@/components/features/PhotoFirstLogCoffeeForm";
import { usePublicCoffeeFeed } from '@/hooks/useCoffeeLogs';
import { useAuth } from '@/hooks/useAuth';

export default function AuthenticatedHome() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState('Delhi');
    const [showLogModal, setShowLogModal] = useState(false);
    const router = useRouter();
    const { user: authUser } = useAuth();

    // Fetch public coffee feed with city filter
    const cityFilter = selectedCity === 'All' ? undefined : selectedCity;
    const { logs, loading: feedLoading } = usePublicCoffeeFeed({
        city: cityFilter,
        currentUserId: authUser?.id || null
    });

    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                // Check if user has a profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('user_id', session.user.id)
                    .single();

                if (!profile) {
                    router.push('/set-username');
                } else {
                    setUser({ ...session.user, username: profile.username });
                }
            }
            setLoading(false);
        };
        checkSession();
    }, [router]);

    // Navigation handlers
    const handleUsernameClick = (username: string) => {
        router.push(`/user/${username}`);
    };

    const handleLogCoffeeClick = () => {
        setShowLogModal(true);
    };

    const handleCafeClick = (cafe: string) => {
        // TODO: Filter feed by café
        console.log('Filter by café:', cafe);
    };

    const handleListClick = (listId: string) => {
        router.push(`/lists/${listId}`);
    };

    const handleShareClick = () => {
        // TODO: Implement share functionality
        console.log('Share with friends');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-journal-bg lowercase">
                <p className="text-journal-text">loading...</p>
            </div>
        );
    }

    if (!user) return null;

    return (
        <>
            <JournalLayout
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                onLogCoffeeClick={handleLogCoffeeClick}
                onCafeClick={handleCafeClick}
                onListClick={handleListClick}
                onShareClick={handleShareClick}
            >
                {/* Feed Cards */}
                <div className="space-y-8">
                    {feedLoading ? (
                        // Loading skeleton
                        <div className="space-y-8">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="bg-journal-card rounded-2xl h-96 animate-pulse"
                                />
                            ))}
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-16 text-journal-text/60 lowercase">
                            <p>no coffee logs yet. be the first to log one!</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <JournalFeedCard
                                key={log.id}
                                log={log}
                                onUsernameClick={handleUsernameClick}
                            />
                        ))
                    )}
                </div>
            </JournalLayout>

            {/* Log Coffee Modal */}
            <Modal
                isOpen={showLogModal}
                onClose={() => setShowLogModal(false)}
            >
                <PhotoFirstLogCoffeeForm
                    onSuccess={() => {
                        setShowLogModal(false);
                        window.location.reload();
                    }}
                    onCancel={() => setShowLogModal(false)}
                />
            </Modal>
        </>
    );
}
