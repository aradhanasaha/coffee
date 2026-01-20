"use client";

import StarRating from '../common/StarRating';
import HeartButton from '../common/HeartButton';
import UsernameLink from '../common/UsernameLink';
import SaveToListButton from './lists/SaveToListButton';

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
}

export default function TextPostLayout({
    log,
    onUsernameClick,
    isLiked,
    onToggleLike,
    likeLoading,
    likeCount,
    priceFeel
}: TextPostLayoutProps) {
    // Truncate review logic
    const maxLength = 280; // Longer for text posts (Twitter style)
    const shouldTruncate = log.review && log.review.length > maxLength;
    const displayReview = shouldTruncate
        ? log.review!.substring(0, maxLength) + '...'
        : log.review;

    return (
        <div className="flex flex-col p-6">
            {/* 1. Header: Username */}
            <div className="mb-1">
                {log.username && (
                    <UsernameLink
                        username={log.username}
                        onClick={onUsernameClick}
                        className="font-semibold text-sm text-journal-text"
                    />
                )}
            </div>

            {/* 2. Metadata (Coffee + Location + Price) - Subtle */}
            <div className="mb-4 flex justify-between items-center text-xs text-journal-text/60">
                <div className="flex items-center gap-1">
                    <span className="font-medium text-journal-text/80">{log.coffee_name.toLowerCase()}</span>
                    <span>•</span>
                    <span>{log.place.toLowerCase()}</span>
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
                            <span className="opacity-60 ml-1 cursor-pointer hover:opacity-100 text-sm">read more</span>
                        )}
                    </p>
                </div>
            )}

            {/* 4. Footer (Rating + Heart) */}
            <div className="flex justify-between items-center mt-auto pt-2 border-t border-primary/5">
                <div className="opacity-80 scale-90 origin-left">
                    <StarRating rating={log.rating} size="sm" />
                </div>
                <div className="flex items-center gap-3">
                    <SaveToListButton coffeeLogId={log.id} />
                    <HeartButton
                        isLiked={isLiked}
                        onToggle={onToggleLike}
                        loading={likeLoading}
                        count={likeCount}
                    />
                </div>
            </div>
        </div>
    );
}
