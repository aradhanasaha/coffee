"use client";

import { useState, useEffect } from 'react';
import { Edit2, Trash2, Save, X, MapPin, Calendar, Heart } from 'lucide-react';
import StarRating from '../common/StarRating';
import * as likeService from '@/services/likeService';

interface CoffeeHistoryCardProps {
    log: {
        id: string;
        coffee_name: string;
        place: string;
        rating: number;
        review?: string | null;
        image_url?: string | null;
        created_at: string;
        price_feel?: string | null;
        username?: string;
        locations?: {
            city?: string | null;
        };
    };
    isOwner: boolean;
    currentUserId?: string | null;
    onEdit: (logId: string, updates: {
        coffee_name: string;
        place: string;
        rating: number;
        review: string;
    }) => Promise<void>;
    onDelete: (logId: string) => Promise<void>;
}

export default function CoffeeHistoryCard({
    log,
    isOwner,
    currentUserId,
    onEdit,
    onDelete
}: CoffeeHistoryCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        coffee_name: log.coffee_name,
        place: log.place,
        rating: log.rating,
        review: log.review || ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Like State
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [isLikeLoading, setIsLikeLoading] = useState(true);

    useEffect(() => {
        const fetchLikeStatus = async () => {
            setIsLikeLoading(true);
            const status = await likeService.getLikeStatus(currentUserId || null, log.id, 'coffee_log');
            setIsLiked(status.isLiked);
            setLikeCount(status.likeCount);
            setIsLikeLoading(false);
        };

        fetchLikeStatus();
    }, [log.id, currentUserId]);

    const handleToggleLike = async () => {
        if (!currentUserId) return;

        // Optimistic UI update
        const newIsLiked = !isLiked;
        const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1;

        setIsLiked(newIsLiked);
        setLikeCount(newLikeCount);

        const result = await likeService.toggleLike(currentUserId, log.id, 'coffee_log');

        if (!result.success) {
            // Revert on failure
            setIsLiked(!newIsLiked);
            setLikeCount(isLiked ? likeCount : likeCount); // Simplified revert logic
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onEdit(log.id, editData);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to save edit:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditData({
            coffee_name: log.coffee_name,
            place: log.place,
            rating: log.rating,
            review: log.review || ''
        });
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this coffee log? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await onDelete(log.id);
        } catch (error) {
            console.error('Failed to delete:', error);
            setIsDeleting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <article className="bg-journal-card rounded-2xl overflow-hidden lowercase shadow-sm hover:shadow-md transition-all duration-300 relative group mb-8 max-w-2xl mx-auto border border-primary/5">
            {/* 1. Header Row (Username + Subtle Actions) */}
            <div className="px-5 py-4 flex justify-between items-center border-b border-primary/5">
                <div className="flex items-center gap-2">
                    {log.username && (
                        <span className="font-bold text-sm text-journal-text tracking-tighter">
                            @{log.username}
                        </span>
                    )}
                </div>

                {isOwner && !isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-[10px] font-black uppercase tracking-widest text-primary/40 hover:text-primary transition-colors flex items-center gap-1.5"
                        title="Edit entry"
                    >
                        <Edit2 className="w-3 h-3" />
                        <span>edit</span>
                    </button>
                )}
            </div>

            {/* 2. Photo (Primary Visual, Top of content section) */}
            {log.image_url && (
                <div className="w-full relative overflow-hidden bg-primary/5 aspect-square md:aspect-video">
                    <img
                        src={log.image_url}
                        alt={`${log.coffee_name} at ${log.place}`}
                        className="w-full h-full object-cover"
                    />

                    {isEditing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <button className="bg-white/90 text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                <Edit2 className="w-3 h-3" />
                                Change Photo
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* 3. Content Section (Hierarchy: Coffee Name -> Location -> Rating -> Review -> Date) */}
            <div className="p-6 md:p-8 space-y-5">
                {isEditing ? (
                    // Inline Edit Mode
                    <div className="space-y-5 bg-primary/[0.02] p-2 rounded-xl">
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-1.5 block ml-1">Coffee Name</label>
                                <input
                                    type="text"
                                    value={editData.coffee_name}
                                    onChange={(e) => setEditData({ ...editData, coffee_name: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/10 bg-background text-journal-text font-bold text-lg focus:border-primary outline-none transition-all"
                                    disabled={isSaving}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-1.5 block ml-1">Location</label>
                                <input
                                    type="text"
                                    value={editData.place}
                                    onChange={(e) => setEditData({ ...editData, place: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/10 bg-background text-journal-text text-sm focus:border-primary outline-none transition-all"
                                    disabled={isSaving}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-1.5 block ml-1">Rating</label>
                                <div className="flex gap-2.5 bg-background p-2.5 rounded-xl border-2 border-primary/10 w-fit">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setEditData({ ...editData, rating: star })}
                                            disabled={isSaving}
                                            className={`text-2xl transition-all hover:scale-125 hover:-rotate-12 ${star <= editData.rating ? 'text-journal-star' : 'text-primary/10'}`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-1.5 block ml-1">Review</label>
                                <textarea
                                    value={editData.review}
                                    onChange={(e) => setEditData({ ...editData, review: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/10 bg-background text-journal-text text-sm leading-relaxed focus:border-primary outline-none resize-none transition-all"
                                    rows={4}
                                    disabled={isSaving}
                                    placeholder="Write your thoughts..."
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98] shadow-sm"
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'saving changes...' : 'save entry'}
                            </button>
                            <div className="flex gap-2 flex-1">
                                <button
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                    className="flex-1 flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-5 py-3 rounded-xl font-bold text-sm hover:bg-secondary/80 disabled:opacity-50 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                    cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isSaving || isDeleting}
                                    className="px-4 py-3 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all"
                                    title="Delete entry"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Display Mode - Cozy Hierarchy
                    <div className="space-y-4">
                        {/* Coffee Name & Location */}
                        <div className="space-y-1">
                            <h3 className="font-black text-2xl md:text-3xl text-journal-text tracking-tighter leading-none">
                                {log.coffee_name}
                            </h3>
                            <p className="text-sm md:text-base font-medium text-primary/60 flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 opacity-40" />
                                {log.place}
                                {log.locations?.city && <span>, {log.locations.city}</span>}
                            </p>
                        </div>

                        {/* Rating */}
                        <div className="pt-1">
                            <StarRating rating={log.rating} size="sm" />
                        </div>

                        {/* Review Section */}
                        {log.review && (
                            <div className="pt-2 relative">
                                <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-primary/10 rounded-full" />
                                <p className="text-journal-text text-base md:text-lg leading-relaxed italic opacity-80">
                                    "{log.review}"
                                </p>
                            </div>
                        )}

                        {/* Footer / Date & Likes */}
                        <div className="flex items-center justify-between text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] pt-6 border-t border-primary/5">
                            <div className="flex items-center gap-4 text-primary/30">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3" />
                                    {formatDate(log.created_at)}
                                </span>
                                {log.price_feel && (
                                    <span className="opacity-80">
                                        {log.price_feel === 'steal' && '💰 steal'}
                                        {log.price_feel === 'fair' && '✓ fair'}
                                        {log.price_feel === 'expensive' && '💸 pricey'}
                                    </span>
                                )}
                            </div>

                            {/* Like Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleLike();
                                }}
                                disabled={!currentUserId}
                                className={`flex items-center gap-1.5 transition-all active:scale-90 ${isLiked ? 'text-red-500' : 'text-primary/30 hover:text-red-500/50'
                                    }`}
                            >
                                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                                <span className="text-xs font-black">{likeCount || 0}</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}

