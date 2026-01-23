"use client";

import { useState } from 'react';
import { Button, ErrorMessage } from '@/components/common';
import type { ListFormData } from '@/core/types/types';

interface CreateListFormProps {
    onSubmit: (data: ListFormData) => Promise<void>;
    onCancel: () => void;
}

export default function CreateListForm({ onSubmit, onCancel }: CreateListFormProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        setSubmitting(true);
        setError(null);

        // Content Moderation
        try {
            const { validateText } = await import('@/lib/moderation');

            const checkTitle = validateText(title);
            if (!checkTitle.isSafe) { throw new Error(checkTitle.error); }

            const checkDesc = validateText(description);
            if (!checkDesc.isSafe) { throw new Error(checkDesc.error); }
        } catch (err: any) {
            setError(err.message || 'Validation failed');
            setSubmitting(false);
            return;
        }

        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim() || undefined,
                visibility: isPublic ? 'public' : 'private'
            });
        } catch (err) {
            setError('Failed to create list');
            setSubmitting(false); // Only reset if clean up not handled by parent
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 text-foreground">List Name</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-primary/20 bg-secondary/50 focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Morning Brews"
                    autoFocus
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1 text-foreground">Description (Optional)</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-primary/20 bg-secondary/50 focus:outline-none focus:border-primary transition-colors resize-none"
                    placeholder="What's this list about?"
                    rows={2}
                />
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPublic ? 'bg-primary' : 'bg-gray-200'
                        }`}
                >
                    <span
                        className={`${isPublic ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
                <span className="text-sm font-medium text-foreground">
                    {isPublic ? 'Public (Visible to everyone)' : 'Private (Only you can see)'}
                </span>
            </div>

            <ErrorMessage message={error} />

            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1"
                >
                    {submitting ? 'Creating...' : 'Create List'}
                </Button>
            </div>
        </form>
    );
}
