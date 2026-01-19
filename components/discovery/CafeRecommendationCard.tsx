"use client";

import { ChevronRight } from 'lucide-react';

interface CafeRecommendationCardProps {
    name: string;
    area: string;
    image?: string;
    onClick?: () => void;
}

export default function CafeRecommendationCard({ name, area, image, onClick }: CafeRecommendationCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-journal-card/50 transition-colors text-left lowercase group"
        >
            {/* Square Image */}
            <div className="w-10 h-10 rounded-lg bg-journal-card flex-shrink-0 overflow-hidden">
                {image ? (
                    <img src={image} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-journal-text/10" />
                )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-journal-text text-sm truncate">{name.toLowerCase()}</p>
                <p className="text-journal-text/60 text-xs truncate">{area.toLowerCase()}</p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-journal-text/40 group-hover:text-journal-text/70 transition-colors flex-shrink-0" />
        </button>
    );
}
