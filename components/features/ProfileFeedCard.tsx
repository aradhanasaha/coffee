import { useState } from 'react';
import { useLikes } from '@/hooks/useLikes';
import ImagePostLayout from './ImagePostLayout';
import TextPostLayout from './TextPostLayout';

interface ProfileFeedCardProps {
    log: any;
    author: any;
    isOwner: boolean;
    onEdit: (log: any) => void;
}

export default function ProfileFeedCard({ log, author, isOwner, onEdit }: ProfileFeedCardProps) {
    const { likeStatus, toggleLike, loading: likeLoading } = useLikes(log.id, 'coffee_log');
    const [imageLoadError, setImageLoadError] = useState(false);

    // Stricter check for image existence to avoid empty placeholders
    const hasImage = Boolean(
        !imageLoadError &&
        log.image_url &&
        log.image_url.trim().length > 0 &&
        log.image_url !== 'null' &&
        log.image_url !== 'undefined' &&
        (log.image_url.startsWith('http') || log.image_url.startsWith('/') || log.image_url.startsWith('data:'))
    );

    const commonProps = {
        log: {
            ...log,
            username: author?.username // Ensure username is passed correctly for layout
        },
        onUsernameClick: () => { }, // No-op for profile page as we are already there (or handled by Link)
        isLiked: likeStatus?.isLiked || false,
        onToggleLike: toggleLike,
        likeLoading,
        likeCount: likeStatus?.likeCount || 0,
        priceFeel: log.price_feel,
        locationId: log.location_id,
        // Edit Props
        isOwner,
        onEdit
    };

    return (
        <article className="bg-card rounded-2xl lowercase shadow-sm hover:shadow-md transition-shadow duration-200 relative group h-full">
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
