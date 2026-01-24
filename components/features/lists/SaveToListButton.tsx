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



    // Check local saved state. 
    // Optimization: We could check if *any* list has the item.
    // The previous implementation was: const isSaved = lists.some(list => list.items.some(item => item.coffee_log_id === coffeeLogId));
    // BUT lists.items is empty in `lists` array from `fetchLists` (it only has counts).
    // So `isSaved` was always false unless we hydrate it differently.

    // We need to fetch the saved status for this specific log if not already known.
    // In `SaveToListModal` we implemented `checkLogSavedBatch`.
    // Here we should probably do similar or assume parent knows?
    // Given the constraints and existing code structure, we can't easily prop drill from parent feed query without changing feed service.
    // Let's implement a direct check here similar to the modal but simplified: "Am I in ANY list?"

    const [isSaved, setIsSaved] = useState(false);
    // Track if we are busy toggling
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        let mounted = true;
        const checkStatus = async () => {
            if (!user) return;
            // Fetch all lists for user and check if log is in any.
            // Efficient way: use the CheckLogSavedBatch we added.
            // But we first need list IDs. 
            // Better: Add a simpler service method "isLogSaved(userId, logId)"?
            // Or use existing: fetch user lists, then check.
            // Let's rely on `lists` from useLists hook if populated. 
            // BUT useLists fetches lists... it doesn't fetch membership.

            // Let's import the checker dynamically or just use a custom query here for speed.
            const { checkLogSavedBatch, fetchUserLists } = await import('@/services/listService');

            // We need list IDs first.
            let userListIds: string[] = [];
            if (lists.length > 0) {
                userListIds = lists.map(l => l.id);
            } else {
                const { data } = await fetchUserLists(user.id);
                if (data) userListIds = data.map(l => l.id);
            }

            if (userListIds.length > 0) {
                const { data } = await checkLogSavedBatch(userListIds, coffeeLogId);
                if (mounted && data && data.length > 0) {
                    setIsSaved(true);
                }
            }
        };

        checkStatus();
        return () => { mounted = false; };
    }, [user, coffeeLogId, lists.length]); // Dependency on lists.length in case lists are loaded later

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (toggling) return;

        if (isSaved) {
            // Remove from all
            if (!confirm('Remove this coffee from all your lists?')) return;

            setToggling(true);
            try {
                const { removeFromAllLists } = await import('@/services/listService');
                if (user) {
                    await removeFromAllLists(user.id, coffeeLogId);
                    setIsSaved(false);
                    // Optionally refresh lists context if we had one
                }
            } finally {
                setToggling(false);
            }
        } else {
            setIsModalOpen(true);
        }
    };

    return (
        <>
            <button
                onClick={handleClick}
                className="group flex items-center gap-1.5 text-journal-text/60 hover:text-journal-text transition-colors"
                title={isSaved ? "Saved (click to remove)" : "Save to list"}
            >
                <Bookmark className={`${iconClassName} ${isSaved ? 'fill-journal-text text-journal-text' : ''} ${toggling ? 'opacity-50' : ''}`} />
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
