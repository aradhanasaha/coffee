"use client";

interface ExploreListCardProps {
    title: string;
    subtitle: string;
    onClick?: () => void;
}

export default function ExploreListCard({ title, subtitle, onClick }: ExploreListCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full bg-journal-card rounded-xl p-3 hover:bg-journal-card/80 transition-colors text-left lowercase"
        >
            <h3 className="font-semibold text-journal-text text-sm mb-1 leading-snug">
                {title.toLowerCase()}
            </h3>
            <p className="text-journal-text/50 text-xs">
                {subtitle.toLowerCase()}
            </p>
        </button>
    );
}
