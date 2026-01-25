"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import JournalLayout from "@/components/layout/JournalLayout";
import JournalFeedCard from "@/components/features/JournalFeedCard";
import Modal from "@/components/common/Modal";
import PhotoFirstLogCoffeeForm from "@/components/features/PhotoFirstLogCoffeeForm";
import InstallAppPrompt from "@/components/features/InstallAppPrompt";
import { usePublicCoffeeFeed } from '@/hooks/useCoffeeLogs';
import { useAuth } from '@/hooks/useAuth';

export default function AuthenticatedHome() {
    const [showLogModal, setShowLogModal] = useState(false);
    const router = useRouter();
    const { user, loading } = useAuth();


    // Fetch public coffee feed
    const { logs, loading: feedLoading, refreshFeed } = usePublicCoffeeFeed({
        currentUserId: user?.id || null
    });



    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);


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

    const handleShareClick = async () => {
        const shareData = {
            title: 'imnotupyet',
            text: 'Check out imnotupyet - your quiet space to log coffee.',
            url: window.location.origin
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                alert('link copied!');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
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
                                onAdminDelete={() => {
                                    // Refresh feed after delete
                                    refreshFeed();
                                }}
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
                        refreshFeed();
                    }}
                    onCancel={() => setShowLogModal(false)}
                />
            </Modal>

            {/* PWA Install Prompt */}
            <InstallAppPrompt />
        </>
    );
}
