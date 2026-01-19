"use client";

import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number; // 0-5
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ rating, className = "", size = 'md' }: StarRatingProps) {
    const sizeClasses = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    return (
        <div className={`flex items-center gap-0.5 ${className}`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${sizeClasses[size]} ${star <= rating
                        ? 'fill-journal-star text-journal-star'
                        : 'fill-none text-journal-star/20'
                        }`}
                />
            ))}
        </div>
    );
}
