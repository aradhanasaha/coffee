"use client";

interface ExploreListCardProps {
    title: string;
    subtitle: string;
    curatedBy?: string;
    onClick?: () => void;
}

export default function ExploreListCard({ title, subtitle, curatedBy, onClick }: ExploreListCardProps) {
    return (
        <button
            onClick={onClick}
            className="w-full bg-journal-card rounded-xl p-3 hover:bg-journal-card/80 transition-colors text-left lowercase"
        >
            <h3 className="font-semibold text-journal-text text-sm mb-1 leading-snug">
                {title.toLowerCase()}
            </h3>
            <div className="flex items-center gap-2 text-journal-text/50 text-xs">
                <span>{subtitle.toLowerCase()}</span>
                {curatedBy && (
                    <>
                        <span className="text-gray-300">•</span>
                        <span>curated by: @{curatedBy.toLowerCase()}</span>
                    </>
                )}
            </div>
        </button>
    );
}
