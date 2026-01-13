/**
 * Coffee Domain Logic
 * Platform-agnostic business rules for coffee logging
 */

import Fuse from 'fuse.js';
import { ValidationResult, LogFormData, PriceFeel } from '../types/types';

/**
 * Common coffee names for autocomplete and spell-checking
 */
export const COMMON_COFFEE_NAMES = [
    'Espresso', 'Doppio', 'Ristretto', 'Lungo', 'Americano',
    'Cappuccino', 'Latte', 'Flat White', 'Cortado', 'Gibraltar',
    'Macchiato', 'Piccolo', 'Mocha', 'Affogato', 'Irish Coffee',
    'Turkish Coffee', 'Greek Coffee', 'Cold Brew', 'Nitro Cold Brew',
    'Iced Coffee', 'Iced Latte', 'Iced Americano', 'Pour Over',
    'Drip Coffee', 'French Press', 'AeroPress', 'Moka Pot', 'Siphon',
    'Chemex', 'V60', 'Kalita Wave', 'Single Origin Brew',
    'Espresso Tonic', 'Red Eye', 'Black Eye', 'Long Black',
    'Café au Lait', 'Vienna Coffee'
];

/**
 * Predefined flavor note tags
 */
export const PREDEFINED_FLAVOR_TAGS = [
    'Nutty', 'Chocolatey', 'Fruity', 'Floral', 'Bitter', 'Sweet'
];

/**
 * Filter coffee names by search query
 */
export function filterCoffeeNames(query: string): string[] {
    if (!query || query.trim().length === 0) {
        return [];
    }

    return COMMON_COFFEE_NAMES.filter(name =>
        name.toLowerCase().includes(query.toLowerCase()) &&
        name.toLowerCase() !== query.toLowerCase()
    );
}

/**
 * Get spell-check suggestion for coffee name using fuzzy matching
 */
export function getCoffeeNameSpellSuggestion(coffeeName: string): string | null {
    if (!coffeeName || coffeeName.trim().length === 0) {
        return null;
    }

    const lowerName = coffeeName.toLowerCase();

    // Don't suggest if it's already an exact match
    if (COMMON_COFFEE_NAMES.some(s => s.toLowerCase() === lowerName)) {
        return null;
    }

    const fuse = new Fuse(COMMON_COFFEE_NAMES, {
        threshold: 0.4, // Adjust for sensitivity
    });

    const results = fuse.search(coffeeName);
    if (results.length > 0) {
        const bestMatch = results[0].item;
        if (bestMatch.toLowerCase() !== lowerName) {
            return bestMatch;
        }
    }

    return null;
}

/**
 * Validates coffee log data
 */
export function validateCoffeeLog(data: Partial<LogFormData>): ValidationResult {
    if (!data.coffee_name || data.coffee_name.trim().length === 0) {
        return { isValid: false, error: 'Coffee name is required' };
    }

    if (!data.place || data.place.trim().length === 0) {
        return { isValid: false, error: 'Place is required' };
    }

    if (data.rating === undefined || data.rating === null) {
        return { isValid: false, error: 'Rating is required' };
    }

    if (data.rating < 0 || data.rating > 5) {
        return { isValid: false, error: 'Rating must be between 0 and 5' };
    }

    return { isValid: true };
}

/**
 * Validates rating value
 */
export function validateRating(rating: number): ValidationResult {
    if (rating < 0 || rating > 5) {
        return { isValid: false, error: 'Rating must be between 0 and 5' };
    }
    return { isValid: true };
}

/**
 * Get price feel label for display
 */
export function getPriceFeelLabel(feel: PriceFeel): string {
    switch (feel) {
        case 'steal':
            return 'What a steal!';
        case 'fair':
            return 'Just right';
        case 'expensive':
            return 'Felt expensive';
        default:
            return '—';
    }
}

/**
 * Normalize flavor notes into a comma-separated string
 */
export function normalizeFlavorNotes(tags: string[]): string {
    return tags.filter(tag => tag && tag.trim().length > 0).join(', ');
}

/**
 * Parse flavor notes string into array
 */
export function parseFlavorNotes(notesString: string | null): string[] {
    if (!notesString) return [];
    return notesString.split(',').map(tag => tag.trim()).filter(Boolean);
}
