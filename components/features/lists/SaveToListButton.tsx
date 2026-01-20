"use client";

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import SaveToListModal from './SaveToListModal';
import { useAuth } from '@/hooks/useAuth';
import { useLists } from '@/hooks/useLists';

interface SaveToListButtonProps {
    coffeeLogId: string;
    iconClassName?: string;
}

export default function SaveToListButton({ coffeeLogId, iconClassName = "w-5 h-5" }: SaveToListButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { user } = useAuth();
    const { lists, loading, fetchLists, createList, addToList, removeFromList } = useLists(user?.id || null);

    // Initial fetch to determine saved state
    // Technical debt: This triggers N requests for N cards. Optimization required later (Context or centralized fetch).
    useEffect(() => {
        if (user) {
            fetchLists();
        }
    }, [user, fetchLists]);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsModalOpen(true);
    };

    const isSaved = lists.some(list => list.items.some(item => item.coffee_log_id === coffeeLogId));

    return (
        <>
            <button
                onClick={handleClick}
                className="group flex items-center gap-1.5 text-journal-text/60 hover:text-journal-text transition-colors"
                title={isSaved ? "Saved to list" : "Save to list"}
            >
                <Bookmark className={`${iconClassName} ${isSaved ? 'fill-current text-primary' : ''}`} />
            </button>

            {isModalOpen && (
                <SaveToListModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    coffeeLogId={coffeeLogId}
                    lists={lists}
                    loading={loading}
                    createList={createList}
                    addToList={addToList}
                    removeFromList={removeFromList}
                />
            )}
        </>
    );
}
