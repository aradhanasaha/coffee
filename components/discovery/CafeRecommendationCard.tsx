import { ChevronRight, MapPin } from 'lucide-react';

interface CafeRecommendationCardProps {
    name: string;
    onClick?: () => void;
}

export default function CafeRecommendationCard({ name, onClick }: CafeRecommendationCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-journal-card/50 transition-colors text-left lowercase group"
        >
            {/* Icon Only */}
            <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center bg-journal-card/50">
                <MapPin className="w-5 h-5 text-journal-text/40" />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-journal-text text-sm truncate">{name.toLowerCase()}</p>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-journal-text/40 group-hover:text-journal-text/70 transition-colors flex-shrink-0" />
        </button>
    );
}
