"use client";

import { useState } from 'react';
import StarRating from '../common/StarRating';
import HeartButton from '../common/HeartButton';
import UsernameLink from '../common/UsernameLink';
import SaveToListButton from './lists/SaveToListButton';

// Import Trash2
import { Trash2 } from 'lucide-react';

import ShareEntryButton from './ShareEntryButton';

interface ImagePostLayoutProps {
    log: {
        id: string;
        username?: string;
        place: string;
        coffee_name: string;
        rating: number;
        review?: string | null;
        image_url?: string | null;
        area?: string;
    };
    onUsernameClick?: (username: string) => void;
    isLiked: boolean;
    onToggleLike: () => void;
    likeLoading: boolean;
    likeCount: number;
    onImageError?: () => void;
    priceFeel?: string | null;
    // Admin Props
    isAdmin?: boolean;
    onDelete?: () => void;
    isDeleting?: boolean;
    locationId?: string | null;
    variant?: 'default' | 'share';
}

export default function ImagePostLayout({
    log,
    onUsernameClick,
    isLiked,
    onToggleLike,
    likeLoading,
    likeCount,
    onImageError,
    priceFeel,
    isAdmin,
    onDelete,
    isDeleting,
    locationId,
    variant = 'default'
}: ImagePostLayoutProps) {
    // Truncate review logic
    const maxLength = 120; // Shorter for image posts (2-3 lines)
    const [isExpanded, setIsExpanded] = useState(false);

    // Safety check: log.review might be null/undefined but type says string | null
    const reviewText = log.review || "";
    const shouldTruncate = variant === 'default' && reviewText.length > maxLength && !isExpanded;

    const displayReview = shouldTruncate
        ? reviewText.substring(0, maxLength) + '...'
        : reviewText;

    const isShareMode = variant === 'share';

    return (
        <div className={`flex flex-col relative group/card ${isShareMode ? 'bg-journal-bg' : ''}`}>
            {/* Admin Delete Button - Overlay - Only in default mode */}
            {!isShareMode && isAdmin && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    disabled={isDeleting}
                    className="absolute top-2 right-2 z-10 bg-destructive/90 text-white p-2 rounded-full shadow-lg opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-destructive"
                    title="Admin Delete"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}

            {/* 1. Header: Username */}
            <div className="px-4 py-3">
                {log.username && (
                    <UsernameLink
                        username={log.username}
                        onClick={isShareMode ? undefined : onUsernameClick}
                        className="font-semibold text-sm text-journal-text"
                    />
                )}
            </div>

            {/* 2. Image Container (Primary Focus) */}
            {log.image_url && (
                <div className="w-full relative overflow-hidden">
                    <img
                        src={log.image_url}
                        alt={`${log.coffee_name} at ${log.place}`}
                        className="w-full h-auto max-h-[500px] object-cover"
                        onError={onImageError}
                    />
                </div>
            )}

            {/* 3. Metadata Row (Coffee + Location + Price) */}
            <div className="px-4 pt-3 flex justify-between items-baseline text-journal-text">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base">{log.coffee_name.toLowerCase()}</h3>
                    {priceFeel && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/40 text-journal-text/70 font-medium">
                            {priceFeel}
                        </span>
                    )}
                </div>
                <div className="text-right text-xs opacity-70">
                    {locationId && !isShareMode ? (
                        <a href={`/locations/${locationId}`} className="font-medium hover:underline hover:text-primary transition-colors">
                            {log.place.toLowerCase()}
                        </a>
                    ) : (
                        <span className="font-medium">{log.place.toLowerCase()}</span>
                    )}
                    {log.area && <span>, {log.area.toLowerCase()}</span>}
                </div>
            </div>

            {/* 4. Action Row (Rating + Heart) OR Share Footer */}
            {!isShareMode ? (
                <div className="px-4 py-2 flex justify-between items-center">
                    <StarRating rating={log.rating} size="sm" />
                    <div className="flex items-center gap-3">
                        <ShareEntryButton log={log} />
                        <SaveToListButton coffeeLogId={log.id} />
                        <HeartButton
                            isLiked={isLiked}
                            onToggle={onToggleLike}
                            loading={likeLoading}
                            count={likeCount}
                        />
                    </div>
                </div>
            ) : (
                <div className="px-4 py-2 flex items-center gap-2">
                    <StarRating rating={log.rating} size="sm" />
                </div>
            )}

            {/* 5. Review Text */}
            {displayReview && (
                <div className="px-4 pb-4">
                    <p className="text-journal-text text-sm leading-relaxed">
                        {displayReview.toLowerCase()}
                        {shouldTruncate && (
                            <span
                                onClick={() => setIsExpanded(true)}
                                className="opacity-60 ml-1 cursor-pointer hover:opacity-100 hover:underline"
                            >
                                more
                            </span>
                        )}
                    </p>
                </div>
            )}


        </div>
    );
}
