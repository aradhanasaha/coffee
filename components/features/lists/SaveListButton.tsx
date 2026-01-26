"use client";

import { useState, useEffect } from 'react';
import { Bookmark, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import * as listService from '@/services/listService';

interface SaveListButtonProps {
    listId: string;
    onToggle?: (isSaved: boolean) => void;
    // Optional initial state if known
    initialSavedState?: boolean;
    className?: string; // Add className prop
}

export default function SaveListButton({ listId, onToggle, initialSavedState = false, className }: SaveListButtonProps) {
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(initialSavedState);
    const [loading, setLoading] = useState(false);

    // If initial state not provided, we should ideally fetch it? 
    // But for a button, it's better if parent passes it or we fetch once.
    // For now, let's assume if it is NOT passed, we need to fetch.
    useEffect(() => {
        let mounted = true;
        const checkStatus = async () => {
            if (!user) return;
            // Only check if we are unsure? Or always check to be safe?
            // If initially false, it might just be unknown.
            // Let's check status if we don't know for sure.
            // Actually, we can just check always on mount for correctness.
            const result = await listService.checkListSavedStatus(user.id, listId);
            if (mounted && result.success && result.data !== undefined) {
                setIsSaved(result.data);
            }
        };

        if (user) {
            checkStatus();
        }
        return () => { mounted = false; };
    }, [user, listId]);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            alert('Please login to save lists');
            return;
        }

        if (loading) return;

        setLoading(true);
        try {
            if (isSaved) {
                const result = await listService.unsaveList(user.id, listId);
                if (result.success) {
                    setIsSaved(false);
                    onToggle?.(false);
                }
            } else {
                const result = await listService.saveList(user.id, listId);
                if (result.success) {
                    setIsSaved(true);
                    onToggle?.(true);
                }
            }
        } catch (err: any) {
            console.error('Failed to toggle save list:', err.message || err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <button
            onClick={handleToggle}
            className={`p-2 rounded-full transition-colors ${isSaved
                ? 'bg-primary/10 text-primary'
                : 'text-journal-text/40 hover:bg-journal-text/5 hover:text-journal-text'
                } ${className || ''}`}
            title={isSaved ? "Unsave list" : "Save list"}
            disabled={loading}
        >
            {isSaved ? (
                <Bookmark className="w-5 h-5 fill-current" />
            ) : (
                <Bookmark className="w-5 h-5" />
            )}
        </button>
    );
}
