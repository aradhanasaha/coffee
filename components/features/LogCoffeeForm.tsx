"use client";

import { useState, useEffect, useRef } from 'react';
import { Star, Plus, X, Trash2 } from 'lucide-react';
import { Button, Textarea, ErrorMessage } from '@/components/common';
import MapsProvider from './MapsProvider';
import LocationAutocomplete from './LocationAutocomplete';
import { useAuth } from '@/hooks/useAuth';
import { useCoffeeLogs } from '@/hooks/useCoffeeLogs';
import { findOrCreateLocation } from '@/services/locationService';
import {
    COMMON_COFFEE_NAMES,
    PREDEFINED_FLAVOR_TAGS,
    filterCoffeeNames,
    getCoffeeNameSpellSuggestion,
    normalizeFlavorNotes,
    parseFlavorNotes
} from '@/core/domain/coffeeDomain';
import type { LocationDetails } from '@/core/types/types';

// Constants moved to coffeeDomain

interface LogCoffeeFormProps {
    initialData?: {
        id: string;
        coffee_name: string;
        place: string;
        price_feel: 'steal' | 'fair' | 'expensive' | '';
        rating: number;
        review: string | null;
        flavor_notes: string | null;
        location_id?: string | null;
        image_url?: string | null;
        image_deleted_at?: string | null;
    };
    onSuccess?: () => void;
    submitLabel?: string;
}

export default function LogCoffeeForm({ initialData, onSuccess, submitLabel }: LogCoffeeFormProps) {
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const { createLog, updateLog } = useCoffeeLogs(user?.id || null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        coffee_name: initialData?.coffee_name || '',
        place: initialData?.place || '',
        price_feel: (initialData?.price_feel as 'steal' | 'fair' | 'expensive' | '') || '',
        rating: initialData?.rating || 0,
        review: initialData?.review || ''
    });

    const [isHomeBrew, setIsHomeBrew] = useState(initialData?.place === 'Home Brew');

    // Image Soft Delete State
    // Only show image if it exists AND wasn't already soft-deleted in DB
    const [imageDeleted, setImageDeleted] = useState(false);
    const hasActiveImage = initialData?.image_url && !initialData.image_deleted_at && !imageDeleted;

    // V2.1 Features State
    const [selectedTags, setSelectedTags] = useState<string[]>(
        initialData?.flavor_notes ? parseFlavorNotes(initialData.flavor_notes) : []
    );
    const [customTag, setCustomTag] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const coffeeRef = useRef<HTMLDivElement>(null);

    const [filteredCoffee, setFilteredCoffee] = useState<string[]>([]);
    const [showCoffeeDropdown, setShowCoffeeDropdown] = useState(false);
    const [spellSuggestion, setSpellSuggestion] = useState<string | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<LocationDetails | null>(null);

    useEffect(() => {
        // Close dropdowns on click outside
        const handleClickOutside = (event: MouseEvent) => {
            if (coffeeRef.current && !coffeeRef.current.contains(event.target as Node)) {
                setShowCoffeeDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCoffeeChange = (val: string) => {
        setFormData({ ...formData, coffee_name: val });
        setSpellSuggestion(null); // Clear suggestion on change
        if (val.trim()) {
            // Use domain logic for filtering
            const filtered = filterCoffeeNames(val);
            setFilteredCoffee(filtered);
            setShowCoffeeDropdown(true);
        } else {
            setShowCoffeeDropdown(false);
        }
    };

    const runSpellCheck = (val: string) => {
        // Use domain logic for spell checking
        const suggestion = getCoffeeNameSpellSuggestion(val);
        if (suggestion) {
            setSpellSuggestion(suggestion);
        }
    };

    const handlePlaceChange = (val: string) => {
        setFormData({ ...formData, place: val });
    };

    const toggleHomeBrew = () => {
        const newHomeBrew = !isHomeBrew;
        setIsHomeBrew(newHomeBrew);
        if (newHomeBrew) {
            setFormData({ ...formData, place: 'Home Brew' });
            setSelectedLocation(null);
        } else {
            setFormData({ ...formData, place: '' });
        }
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const addCustomTag = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();
        if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
            setSelectedTags([...selectedTags, customTag.trim()]);
            setCustomTag('');
            setShowCustomInput(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        // Content Moderation
        try {
            const { validateText } = await import('@/lib/moderation');

            const checkName = validateText(formData.coffee_name);
            if (!checkName.isSafe) { throw new Error(checkName.error); }

            const checkReview = validateText(formData.review);
            if (!checkReview.isSafe) { throw new Error(checkReview.error); }

            // Check custom tags (only if any are custom, but checking all is fine)
            for (const tag of selectedTags) {
                const checkTag = validateText(tag);
                if (!checkTag.isSafe) { throw new Error(`Tag "${tag}" contains inappropriate language.`); }
            }
        } catch (err: any) {
            setError(err.message || 'Validation failed');
            setSubmitting(false);
            return;
        }

        try {
            if (!user) {
                throw new Error('Not authenticated');
            }

            let locationId = initialData?.location_id || null;

            // Handle location if not home brew
            if (!isHomeBrew && selectedLocation?.google_place_id) {
                const locationResult = await findOrCreateLocation(selectedLocation);
                if (locationResult.success && locationResult.data) {
                    locationId = locationResult.data.id;
                } else {
                    throw new Error(locationResult.error || 'Failed to process location');
                }
            } else if (isHomeBrew) {
                locationId = null;
            }

            // Prepare log data
            const logData = {
                coffee_name: formData.coffee_name,
                place: formData.place,
                price_feel: formData.price_feel as any,  // Type assertion for Supabase
                rating: formData.rating,
                review: formData.review,
                flavor_notes: normalizeFlavorNotes(selectedTags),
                location_id: locationId,
                // Add soft delete flag if image was deleted in this session
                ...(imageDeleted && { image_deleted_at: new Date().toISOString() })
            };

            // Create or update log
            if (initialData?.id) {
                const result = await updateLog(initialData.id, logData);
                if (!result.success) {
                    throw new Error(result.error || 'Failed to update log');
                }
            } else {
                const result = await createLog(logData);
                if (!result.success) {
                    throw new Error(result.error || 'Failed to create log');
                }

                // --- NEW FEATURE: Send push notification on new post ---
                try {
                    // Try to send notification, but don't fail the whole post if it errors out
                    const anyUser = user as any;
                    await supabase.functions.invoke('push-notify', {
                        body: {
                            broadcast: true,
                            title: `New Coffee Log from @${anyUser.user_metadata?.username || 'someone'}`,
                            body: `Just logged a coffee at ${formData.place}!`,
                            url: '/home',
                            icon: '/logo.png'
                        }
                    });
                } catch (pushError) {
                    console.error('Failed to send push notification:', pushError);
                }
            }

            // Call success callback
            if (onSuccess) {
                onSuccess();
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    // Styling constants for consistency
    const inputBaseClasses = "w-full px-4 py-2 rounded-xl border-2 transition-colors focus:outline-none focus:border-primary bg-secondary/50 border-primary/10 hover:border-primary/30";

    return (
        <MapsProvider>
            <div className={`w-full ${initialData ? '' : 'max-w-2xl bg-card p-8 rounded-2xl shadow-lg border-2 border-primary/20'}`}>
                {!initialData && <h2 className="text-2xl font-bold text-center mb-6 text-primary">Log a Coffee</h2>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative" ref={coffeeRef}>
                            <label className="block text-sm font-medium mb-1 text-foreground">Coffee Name</label>
                            <input
                                type="text"
                                required
                                spellCheck="true"
                                value={formData.coffee_name}
                                onChange={e => handleCoffeeChange(e.target.value)}
                                onBlur={(e) => {
                                    // Delay to allow clicking dropdown
                                    setTimeout(() => {
                                        setShowCoffeeDropdown(false);
                                        runSpellCheck(e.target.value);
                                    }, 200);
                                }}
                                onFocus={() => formData.coffee_name && setShowCoffeeDropdown(true)}
                                className={inputBaseClasses}
                                placeholder="e.g. Iced Latte"
                            />
                            {spellSuggestion && (
                                <div className="mt-1 text-xs text-muted-foreground flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
                                    <span>Did you mean </span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData({ ...formData, coffee_name: spellSuggestion });
                                            setSpellSuggestion(null);
                                        }}
                                        className="text-primary font-bold hover:underline"
                                    >
                                        '{spellSuggestion}'
                                    </button>
                                    <span>?</span>
                                </div>
                            )}
                            {showCoffeeDropdown && filteredCoffee.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-card border-2 border-primary/20 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                                    {filteredCoffee.map(suggestion => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            onClick={() => {
                                                setFormData({ ...formData, coffee_name: suggestion });
                                                setShowCoffeeDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-primary/10 transition-colors text-sm"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <div className="flex justify-between items-end mb-1">
                                <label className="block text-sm font-medium text-foreground">Place</label>
                                <button
                                    type="button"
                                    onClick={toggleHomeBrew}
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${isHomeBrew
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-secondary/50 text-muted-foreground border-primary/10 hover:border-primary/30'
                                        }`}
                                >
                                    {isHomeBrew ? '✓ Home Brew' : 'Home Brew?'}
                                </button>
                            </div>
                            <LocationAutocomplete
                                defaultValue={formData.place}
                                onChange={(val) => handlePlaceChange(val)}
                                onLocationSelect={(loc) => {
                                    setSelectedLocation(loc);
                                    if (loc.place_name) {
                                        setFormData(prev => ({ ...prev, place: loc.place_name as string }));
                                    }
                                }}
                                disabled={isHomeBrew}
                                className={inputBaseClasses}
                                placeholder={isHomeBrew ? "Brewed at home" : "e.g. Blue Tokai"}
                            />
                        </div>
                    </div>
                    {/* ... rest of the form ... */}


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-foreground">Price felt...</label>
                            <div className="flex gap-2">
                                {[
                                    { label: 'What a steal!', value: 'steal' },
                                    { label: 'Just right', value: 'fair' },
                                    { label: 'Felt expensive', value: 'expensive' }
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, price_feel: option.value as any })}
                                        className={`flex-1 px-2 py-2 rounded-xl border-2 text-xs font-bold transition-all ${formData.price_feel === option.value
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-secondary/50 text-foreground border-primary/10 hover:border-primary/30'
                                            }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-1.5 text-[10px] text-muted-foreground leading-tight">
                                Based on taste, portion & experience — not just the bill.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-foreground">Rating</label>
                            <div className="flex gap-2 items-center h-[42px]">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating: star })}
                                        className={`transition-transform hover:scale-110 focus:outline-none ${formData.rating >= star ? 'text-primary' : 'text-muted-foreground/30'
                                            }`}
                                    >
                                        <Star className="w-8 h-8 fill-current" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Textarea
                        id="review"
                        label="Review"
                        rows={3}
                        value={formData.review}
                        onChange={e => setFormData({ ...formData, review: e.target.value })}
                        placeholder="How was it?"
                        className="bg-secondary/50 border-primary/10 hover:border-primary/30 focus:border-primary"
                    />

                    <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">Flavor Notes</label>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {PREDEFINED_FLAVOR_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all ${selectedTags.includes(tag)
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-secondary/50 text-secondary-foreground border-primary/10 hover:border-primary/30'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                            {selectedTags.filter(t => !PREDEFINED_FLAVOR_TAGS.includes(t)).map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className="px-4 py-1.5 rounded-full text-sm font-bold bg-primary text-primary-foreground border-2 border-primary flex items-center gap-2"
                                >
                                    {tag}
                                    <X className="w-3 h-3" />
                                </button>
                            ))}
                            {!showCustomInput ? (
                                <button
                                    type="button"
                                    onClick={() => setShowCustomInput(true)}
                                    className="px-4 py-1.5 rounded-full text-sm font-bold border-2 border-dashed border-primary/30 text-primary/60 hover:border-primary/60 hover:text-primary transition-all flex items-center gap-1"
                                >
                                    <Plus className="w-3 h-3" /> Add your own
                                </button>
                            ) : (
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        autoFocus
                                        value={customTag}
                                        onChange={e => setCustomTag(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addCustomTag(e)}
                                        className="px-3 py-1 rounded-full text-sm border-2 border-primary bg-background focus:outline-none w-32"
                                        placeholder="e.g. Nutty"
                                    />
                                    <button
                                        type="button"
                                        onClick={addCustomTag}
                                        className="p-1.5 rounded-full bg-primary text-primary-foreground"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { setShowCustomInput(false); setCustomTag(''); }}
                                        className="p-1.5 rounded-full bg-secondary text-secondary-foreground"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Thumbnail for Edit Mode */}
                    {hasActiveImage && (
                        <div className="flex items-center gap-4">
                            <div className="relative group cursor-pointer w-16 h-12 rounded-lg overflow-hidden border-2 border-primary/10 hover:border-red-500/50 transition-colors">
                                <img
                                    src={initialData?.image_url!}
                                    alt="Attached coffee photo"
                                    className="w-full h-full object-cover opacity-100 group-hover:opacity-50 transition-opacity"
                                />
                                <div
                                    onClick={() => setImageDeleted(true)}
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20"
                                >
                                    <Trash2 className="w-5 h-5 text-red-600 drop-shadow-sm" />
                                </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                                Attached photo
                            </span>
                        </div>
                    )}

                    <ErrorMessage message={error} />

                    <div className="flex gap-4 pt-2">
                        <Button
                            type="button"
                            onClick={() => onSuccess && onSuccess()}
                            variant="secondary"
                            size="lg"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            size="lg"
                            className="flex-[2]"
                        >
                            {submitting ? (initialData ? 'Saving...' : 'Logging...') : (submitLabel || (initialData ? 'Save Changes' : 'Log Coffee'))}
                        </Button>
                    </div>
                </form>
            </div>
        </MapsProvider>
    );
}
