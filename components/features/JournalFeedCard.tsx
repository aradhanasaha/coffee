"use client";

import { useState } from 'react';
import { useLikes } from '@/hooks/useLikes';
import ImagePostLayout from './ImagePostLayout';
import TextPostLayout from './TextPostLayout';

interface JournalFeedCardProps {
    log: {
        id: string;
        username?: string;
        place: string;
        coffee_name: string;
        rating: number;
        review?: string | null;
        image_url?: string | null;
        area?: string;
        price_feel?: string | null;
        location_id?: string | null;
    };
    onUsernameClick?: (username: string) => void;
    isAdmin?: boolean;
    onAdminDelete?: () => void;
    variant?: 'default' | 'share';
}

export default function JournalFeedCard({ log, onUsernameClick, isAdmin, onAdminDelete, variant = 'default' }: JournalFeedCardProps) {
    const { likeStatus, toggleLike, loading: likeLoading } = useLikes(log.id, 'coffee_log');
    const [imageLoadError, setImageLoadError] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleAdminDelete = async () => {
        if (!isAdmin) return;
        if (!confirm('FOUNDER MODE: Are you sure you want to delete this post? This action cannot be undone.')) return;

        setIsDeleting(true);
        try {
            const { deleteCoffeeLog } = await import('@/services/coffeeService');
            // We pass the current user ID as the deleter. Use a placeholder if unknown, 
            // but the service function expects a userId. Since we are admin, we should have one.
            // For now, let's assume the auth context is handled or we fetch it.
            // Wait, this component doesn't know the current user ID directly.
            // However, the service takes userId for the 'deleted_by' field. 
            // We can just pass 'admin' or fetch session.

            const { supabase } = await import('@/lib/supabaseClient');
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                await deleteCoffeeLog(log.id, session.user.id);
                onAdminDelete?.();
            }
        } catch (err) {
            console.error('Admin delete failed', err);
            alert('Failed to delete post');
        } finally {
            setIsDeleting(false);
        }
    };

    const commonProps = {
        log,
        onUsernameClick,
        isLiked: likeStatus?.isLiked || false,
        onToggleLike: toggleLike,
        likeLoading,
        likeCount: likeStatus?.likeCount || 0,
        priceFeel: log.price_feel,
        // Admin Props
        isAdmin,
        onDelete: isAdmin ? handleAdminDelete : undefined,
        isDeleting,
        locationId: log.location_id,
        variant
    };

    // Stricter check for image existence to avoid empty placeholders
    const hasImage = Boolean(
        !imageLoadError &&
        log.image_url &&
        log.image_url.trim().length > 0 &&
        log.image_url !== 'null' &&
        log.image_url !== 'undefined' &&
        (log.image_url.startsWith('http') || log.image_url.startsWith('/'))
    );

    return (
        <article className="bg-journal-card rounded-2xl overflow-hidden lowercase shadow-sm hover:shadow-md transition-shadow duration-200 relative group">
            {hasImage ? (
                <ImagePostLayout
                    {...commonProps}
                    onImageError={() => setImageLoadError(true)}
                />
            ) : (
                <TextPostLayout {...commonProps} />
            )}
        </article>
    );
}
