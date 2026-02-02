"use client";

import UsernameLink from '@/components/common/UsernameLink';

interface Liker {
    user_id: string;
    username: string;
}

interface LikersListProps {
    likers: Liker[];
    loading: boolean;
    error: string | null;
}

export default function LikersList({ likers, loading, error }: LikersListProps) {
    if (loading) {
        return (
            <div className="p-3 text-xs text-journal-text/60 italic min-w-[150px] text-center">
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-3 text-xs text-red-500 min-w-[150px] text-center">
                Failed to load
            </div>
        );
    }

    if (likers.length === 0) {
        return (
            <div className="p-3 text-xs text-journal-text/60 italic min-w-[150px] text-center">
                No likes yet
            </div>
        );
    }

    return (
        <div className="flex flex-col min-w-[150px] max-h-[200px] overflow-y-auto py-1">
            <div className="px-4 py-1.5 text-[10px] items-center font-bold text-journal-text/50 uppercase tracking-wider border-b border-journal-border/30 mb-1 sticky top-0 bg-journal-card/95 backdrop-blur-sm z-10 w-full">
                Liked by
            </div>
            {likers.map((liker) => (
                <div key={liker.user_id} className="px-4 py-1.5 hover:bg-black/5 transition-colors">
                    <UsernameLink
                        username={liker.username}
                        className="text-xs font-medium text-journal-text block"
                    />
                </div>
            ))}
        </div>
    );
}
