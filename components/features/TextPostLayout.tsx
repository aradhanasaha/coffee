"use client";

import { useState } from 'react';
import StarRating from '../common/StarRating';
import HeartButton from '../common/HeartButton';
import UsernameLink from '../common/UsernameLink';
import SaveToListButton from './lists/SaveToListButton';
import LikersPopover from './LikersPopover';

// Import Trash2
import { Trash2 } from 'lucide-react';

import ShareEntryButton from './ShareEntryButton';

interface TextPostLayoutProps {
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
    priceFeel?: string | null;
    // Admin Props
    isAdmin?: boolean;
    onDelete?: () => void;
    isDeleting?: boolean;
    locationId?: string | null;
    variant?: 'default' | 'share';
}

export default function TextPostLayout({
    log,
    onUsernameClick,
    isLiked,
    onToggleLike,
    likeLoading,
    likeCount,
    priceFeel,
    isAdmin,
    onDelete,
    isDeleting,
    locationId,
    variant = 'default'
}: TextPostLayoutProps) {
    // Truncate review logic
    const maxLength = 280; // Longer for text posts (Twitter style)
    const [isExpanded, setIsExpanded] = useState(false);

    // Safety check
    const reviewText = log.review || "";
    const shouldTruncate = variant === 'default' && reviewText.length > maxLength && !isExpanded;

    const displayReview = shouldTruncate
        ? reviewText.substring(0, maxLength) + '...'
        : reviewText;

    const isShareMode = variant === 'share';

    return (
        <div className={`flex flex-col p-6 relative group/card ${isShareMode ? 'bg-journal-bg' : ''}`}>
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
            <div className="mb-1">
                {log.username && (
                    <UsernameLink
                        username={log.username}
                        onClick={isShareMode ? undefined : onUsernameClick}
                        className="font-semibold text-sm text-journal-text"
                    />
                )}
            </div>

            {/* 2. Metadata (Coffee + Location + Price) - Subtle */}
            <div className="mb-4 flex justify-between items-center text-xs text-journal-text/60">
                <div className="flex items-center gap-1">
                    <span className="font-medium text-journal-text/80">{log.coffee_name.toLowerCase()}</span>
                    <span>•</span>
                    {locationId && !isShareMode ? (
                        <a href={`/locations/${locationId}`} className="hover:underline hover:text-primary transition-colors">
                            {log.place.toLowerCase()}
                        </a>
                    ) : (
                        <span>{log.place.toLowerCase()}</span>
                    )}
                    {log.area && <span>, {log.area.toLowerCase()}</span>}
                </div>
                {priceFeel && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary/40 text-journal-text/70 font-medium">
                        {priceFeel}
                    </span>
                )}
            </div>

            {/* 3. Review Text (Prominent) */}
            {displayReview && (
                <div className="mb-4">
                    <p className="text-journal-text text-base leading-relaxed font-medium">
                        {displayReview.toLowerCase()}
                        {shouldTruncate && (
                            <span
                                onClick={() => setIsExpanded(true)}
                                className="opacity-60 ml-1 cursor-pointer hover:opacity-100 text-sm hover:underline"
                            >
                                read more
                            </span>
                        )}
                    </p>
                </div>
            )}

            {/* 4. Footer (Rating + Heart) OR Share Footer */}
            {!isShareMode ? (
                <div className="flex justify-between items-center mt-auto pt-2 border-t border-primary/5">
                    <div className="opacity-80 scale-90 origin-left">
                        <StarRating rating={log.rating} size="sm" />
                    </div>
                    <div className="flex items-center gap-3">
                        <ShareEntryButton log={log} />
                        <SaveToListButton coffeeLogId={log.id} />
                        <LikersPopover targetId={log.id} targetType="coffee_log">
                            <HeartButton
                                isLiked={isLiked}
                                onToggle={onToggleLike}
                                loading={likeLoading}
                                count={likeCount}
                            />
                        </LikersPopover>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-primary/5">
                        <div className="opacity-80 scale-90 origin-left">
                            <StarRating rating={log.rating} size="sm" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
