"use client";

import { useState, useEffect } from 'react';
import { Plus, Check, Lock, Globe } from 'lucide-react';
import Modal from '@/components/common/Modal';
import CreateListForm from './CreateListForm';
import { useAuth } from '@/hooks/useAuth';
import type { ListFormData, ListWithItems } from '@/core/types/types';

interface SaveToListModalProps {
    isOpen: boolean;
    onClose: () => void;
    coffeeLogId: string;
    lists: ListWithItems[];
    loading: boolean;
    createList: (data: ListFormData) => Promise<any>;
    addToList: (listId: string, logId: string) => Promise<any>;
    removeFromList: (listId: string, logId: string) => Promise<any>;
}

export default function SaveToListModal({
    isOpen,
    onClose,
    coffeeLogId,
    lists,
    loading,
    createList,
    addToList,
    removeFromList
}: SaveToListModalProps) {
    const [containingListIds, setContainingListIds] = useState<string[]>([]);
    const [checkingStatus, setCheckingStatus] = useState(false);
    const [view, setView] = useState<'list' | 'create'>('list');

    // Import checking function at top of file, or pass as prop. 
    // Since we can't change props easily without changing parent, we'll try to use the passed lists logic 
    // BUT we found lists don't have items.
    // So we need to fetch membership.

    // Actually, createList/add/remove are passed as props. Maybe we should import the service directly here for the check?
    // Or simpler: The modal is a "dumb" component mostly?
    // Let's import the service.

    // Wait, let's look at imports.

    useEffect(() => {
        if (isOpen && lists.length > 0) {
            checkMembership();
        }
    }, [isOpen, lists, coffeeLogId]);

    const checkMembership = async () => {
        setCheckingStatus(true);
        // We'll dynamic import or assume it's available via props if we could change parent... 
        // ideally we should have added `checkLogSavedBatch` to props.
        // But for now, let's import the service function directly as it's a client component.
        const { checkLogSavedBatch } = await import('@/services/listService');
        const listIds = lists.map(l => l.id);
        const result = await checkLogSavedBatch(listIds, coffeeLogId);
        if (result.success && result.data) {
            setContainingListIds(result.data);
        }
        setCheckingStatus(false);
    };

    const handleCreateSubmit = async (data: ListFormData) => {
        const result = await createList(data);
        if (result.success && result.data) {
            // Auto add the log to the new list
            await addToList(result.data.id, coffeeLogId);
            setContainingListIds(prev => [...prev, result.data!.id]);
            setView('list');
        }
    };

    const handleToggleList = async (listId: string, isPresent: boolean) => {
        // Optimistic update
        if (isPresent) {
            setContainingListIds(prev => prev.filter(id => id !== listId));
            await removeFromList(listId, coffeeLogId);
        } else {
            setContainingListIds(prev => [...prev, listId]);
            await addToList(listId, coffeeLogId);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-1">
                <h2 className="text-xl font-bold text-center mb-6 text-primary">
                    {view === 'create' ? 'Create New List' : 'Save to List'}
                </h2>

                {view === 'list' ? (
                    <div className="space-y-4">
                        <button
                            onClick={() => setView('create')}
                            className="w-full flex items-center gap-2 justify-center p-3 rounded-xl border-2 border-dashed border-primary/30 text-primary hover:bg-primary/5 transition-colors font-semibold text-sm"
                        >
                            <Plus className="w-4 h-4" /> Create new list
                        </button>

                        <div className="pt-2">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">Saved Lists</h3>

                            <div className="max-h-60 overflow-y-auto space-y-2">
                                {loading && lists.length === 0 ? (
                                    <p className="text-center text-muted-foreground text-sm">Loading lists...</p>
                                ) : lists.length === 0 ? (
                                    <button
                                        onClick={() => setView('create')}
                                        className="w-full py-8 text-center text-muted-foreground text-sm border-2 border-transparent rounded-xl hover:bg-secondary/30 transition-colors"
                                    >
                                        No lists yet. start your first collection!
                                    </button>
                                ) : (
                                    lists.map(list => {
                                        const isPresent = containingListIds.includes(list.id);
                                        return (
                                            <button
                                                key={list.id}
                                                onClick={() => handleToggleList(list.id, !!isPresent)}
                                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors border-2 border-transparent hover:border-primary/10"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPresent ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>
                                                        {isPresent ? <Check className="w-5 h-5" /> : (list.visibility === 'private' ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />)}
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-semibold text-sm text-foreground">{list.title}</p>
                                                        <p className="text-xs text-muted-foreground">{list.item_count} items</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full p-3 rounded-xl bg-journal-text text-journal-card font-semibold hover:opacity-90 transition-opacity"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <CreateListForm
                        onSubmit={handleCreateSubmit}
                        onCancel={() => setView('list')}
                    />
                )}
            </div>
        </Modal>
    );
}
