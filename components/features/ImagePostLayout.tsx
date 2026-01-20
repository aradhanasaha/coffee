"use client";

import StarRating from '../common/StarRating';
import HeartButton from '../common/HeartButton';
import UsernameLink from '../common/UsernameLink';
import SaveToListButton from './lists/SaveToListButton';

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
}

export default function ImagePostLayout({
    log,
    onUsernameClick,
    isLiked,
    onToggleLike,
    likeLoading,
    likeCount,
    onImageError,
    priceFeel
}: ImagePostLayoutProps) {
    // Truncate review logic
    const maxLength = 120; // Shorter for image posts (2-3 lines)
    const shouldTruncate = log.review && log.review.length > maxLength;
    const displayReview = shouldTruncate
        ? log.review!.substring(0, maxLength) + '...'
        : log.review;

    return (
        <div className="flex flex-col">
            {/* 1. Header: Username */}
            <div className="px-4 py-3">
                {log.username && (
                    <UsernameLink
                        username={log.username}
                        onClick={onUsernameClick}
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
                    <span className="font-medium">{log.place.toLowerCase()}</span>
                    {log.area && <span>, {log.area.toLowerCase()}</span>}
                </div>
            </div>

            {/* 4. Action Row (Rating + Heart) */}
            <div className="px-4 py-2 flex justify-between items-center">
                <StarRating rating={log.rating} size="sm" />
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

            {/* 5. Review Text */}
            {displayReview && (
                <div className="px-4 pb-4">
                    <p className="text-journal-text text-sm leading-relaxed">
                        {displayReview.toLowerCase()}
                        {shouldTruncate && (
                            <span className="opacity-60 ml-1 cursor-pointer hover:opacity-100">more</span>
                        )}
                    </p>
                </div>
            )}
        </div>
    );
}
