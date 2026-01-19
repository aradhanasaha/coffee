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
    };
    onUsernameClick?: (username: string) => void;
}

export default function JournalFeedCard({ log, onUsernameClick }: JournalFeedCardProps) {
    const { likeStatus, toggleLike, loading: likeLoading } = useLikes(log.id, 'coffee_log');
    const [imageLoadError, setImageLoadError] = useState(false);

    const commonProps = {
        log,
        onUsernameClick,
        isLiked: likeStatus?.isLiked || false,
        onToggleLike: toggleLike,
        likeLoading,
        likeCount: likeStatus?.likeCount || 0,
        priceFeel: log.price_feel
    };

    // Stricter check for image existence to avoid empty placeholders
    const hasImage = Boolean(
        !imageLoadError &&
        log.image_url &&
        log.image_url.trim().length > 0 &&
        log.image_url !== 'null' &&
        log.image_url !== 'undefined'
    );

    return (
        <article className="bg-journal-card rounded-2xl overflow-hidden lowercase shadow-sm hover:shadow-md transition-shadow duration-200">
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
