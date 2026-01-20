"use client";

import { useState, useEffect } from 'react';
import { Plus, Check, Lock, Globe } from 'lucide-react';
import Modal from '@/components/common/Modal';
import CreateListForm from './CreateListForm';
import { useAuth } from '@/hooks/useAuth';
import type { ListFormData } from '@/core/types/types';

interface SaveToListModalProps {
    isOpen: boolean;
    onClose: () => void;
    coffeeLogId: string;
    lists: any[];
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
    const { user } = useAuth();
    const [view, setView] = useState<'list' | 'create'>('list');

    useEffect(() => {
        if (isOpen) {
            setView('list');
        }
    }, [isOpen]);

    const handleCreateSubmit = async (data: ListFormData) => {
        const result = await createList(data);
        if (result.success && result.data) {
            // Auto add the log to the new list
            await addToList(result.data.id, coffeeLogId);
            setView('list');
            // Show toast/feedback?
        }
    };

    const handleToggleList = async (listId: string, isPresent: boolean) => {
        if (isPresent) {
            await removeFromList(listId, coffeeLogId);
        } else {
            await addToList(listId, coffeeLogId);
        }
    };

    const isLogInList = (listId: string) => {
        const list = lists.find(l => l.id === listId);
        return list?.items.some(item => item.coffee_log_id === coffeeLogId);
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
                                        const isPresent = isLogInList(list.id);
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
                                                        <p className="text-xs text-muted-foreground">{list.items.length} items</p>
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
