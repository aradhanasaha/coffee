"use client";

interface ExploreListCardProps {
    title: string;
    subtitle: string;
    curatedBy?: string;
    onClick?: () => void;
    id?: string; // Need ID to save
}
import SaveListButton from '@/components/features/lists/SaveListButton';

export default function ExploreListCard({ title, subtitle, curatedBy, onClick, id }: ExploreListCardProps) {
    return (
        <div
            onClick={onClick}
            className="w-full bg-journal-card rounded-xl p-3 hover:bg-journal-card/80 transition-colors text-left lowercase relative group cursor-pointer"
        >
            <div className="pr-8">
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
            </div>

            {id && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <SaveListButton
                        listId={id}
                        className="bg-transparent hover:bg-journal-text/10"
                    />
                </div>
            )}
        </div>
    );
}
