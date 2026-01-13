/**
 * LikeButton Component
 * Pure presentational like button component
 * 
 * ARCHITECTURE NOTE:
 * This component contains NO business logic or data fetching.
 * All state and operations are passed from parent via props.
 */

"use client";

import { Heart } from 'lucide-react';
import type { LikeStatus } from '@/core/types/types';

interface LikeButtonProps {
    likeStatus: LikeStatus;
    onToggle: () => void;
    loading?: boolean;
    disabled?: boolean;
}

export default function LikeButton({
    likeStatus,
    onToggle,
    loading = false,
    disabled = false
}: LikeButtonProps) {
    const { isLiked, likeCount } = likeStatus;

    return (
        <button
            onClick={onToggle}
            disabled={disabled || loading}
            className={`
                flex items-center gap-1.5 px-2 py-1 rounded-lg
                transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${isLiked
                    ? 'text-red-500 hover:text-red-600 bg-red-500/10'
                    : 'text-muted-foreground hover:text-red-500 hover:bg-red-500/10'
                }
            `}
            aria-label={isLiked ? 'Unlike' : 'Like'}
        >
            <Heart
                className={`w-4 h-4 transition-all ${isLiked ? 'fill-current' : ''}`}
            />
            {likeCount > 0 && (
                <span className="text-xs font-bold">{likeCount}</span>
            )}
        </button>
    );
}
