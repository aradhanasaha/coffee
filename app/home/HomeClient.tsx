"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import JournalLayout from "@/components/layout/JournalLayout";
import JournalFeedCard from "@/components/features/JournalFeedCard";
import Modal from "@/components/common/Modal";
import dynamic from "next/dynamic";

const PhotoFirstLogCoffeeForm = dynamic(
    () => import('@/components/features/PhotoFirstLogCoffeeForm'),
    { ssr: false, loading: () => <div className="p-12 text-center text-journal-text/60 lowercase animate-pulse">loading form...</div> }
);
import { usePublicCoffeeFeed } from '@/hooks/useCoffeeLogs';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import NotificationPermissionPopup from '@/components/features/NotificationPermissionPopup';
import type { CoffeeLogWithUsername } from '@/core/types/types';

interface HomeClientProps {
    initialLogs: CoffeeLogWithUsername[];
}

export default function HomeClient({ initialLogs }: HomeClientProps) {
    const [showLogModal, setShowLogModal] = useState(false);
    const router = useRouter();
    const { user, loading } = useAuth();
    const { profile } = useUserProfile(user?.id || null);

    // Fetch public coffee feed with initial data
    const { logs, loading: feedLoading, refreshFeed, addOptimisticLog } = usePublicCoffeeFeed({
        currentUserId: user?.id || null,
        initialLogs
    });

    // Navigation and auth logic
    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    const handleUsernameClick = (username: string) => {
        router.push(`/user/${username}`);
    };

    const handleLogCoffeeClick = () => {
        setShowLogModal(true);
    };

    const handleCafeClick = (cafeIdOrName: string) => {
        if (cafeIdOrName && cafeIdOrName.length > 20) {
            router.push(`/locations/${cafeIdOrName}?from=feed`);
        }
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
                <div className="space-y-8">
                    {feedLoading ? (
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
                                isAdmin={profile?.is_admin}
                                onAdminDelete={() => refreshFeed()}
                            />
                        ))
                    )}
                </div>
            </JournalLayout>

            <Modal
                isOpen={showLogModal}
                onClose={() => setShowLogModal(false)}
            >
                <PhotoFirstLogCoffeeForm
                    onSuccess={(logData) => {
                        setShowLogModal(false);
                        if (logData) {
                            addOptimisticLog({
                                ...logData,
                                username: profile?.username || 'You'
                            });
                        }
                        refreshFeed();
                    }}
                    onCancel={() => setShowLogModal(false)}
                />
            </Modal>
            <NotificationPermissionPopup />
        </>
    );
}
