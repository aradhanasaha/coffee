"use client";

import { useState } from 'react';
import { Heart } from 'lucide-react';

interface HeartButtonProps {
    isLiked: boolean;
    onToggle: () => void;
    loading?: boolean;
    count?: number;
}

export default function HeartButton({ isLiked, onToggle, loading, count = 0 }: HeartButtonProps) {
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        if (loading) return;
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
        onToggle();
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className={`group flex items-center gap-1.5 transition-all ${isAnimating ? 'scale-110' : 'scale-100'} hover:scale-105`}
        >
            <Heart
                className={`w-5 h-5 ${isLiked
                    ? 'fill-journal-heart text-journal-heart'
                    : 'fill-none text-journal-heart'
                    } transition-all`}
            />
            {count > 0 && (
                <span className={`text-xs font-medium ${isLiked ? 'text-journal-heart' : 'text-journal-text/60'}`}>
                    {count}
                </span>
            )}
        </button>
    );
}
