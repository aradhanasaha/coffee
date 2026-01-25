import { Filter } from 'bad-words';

// Initialize filter once
const filter = new Filter();

// Custom whitelist/blacklist if needed
// filter.removeWords('some', 'safe', 'words');
// filter.addWords('some', 'new', 'bad', 'words');

export interface ValidationResult {
    isSafe: boolean;
    error?: string;
}

/**
 * Validates text content for profanity.
 */
export const validateText = (text: string | null | undefined): ValidationResult => {
    if (!text || !text.trim()) {
        return { isSafe: true };
    }

    try {
        if (filter.isProfane(text)) {
            return {
                isSafe: false,
                error: 'Content contains inappropriate language. Please revise.'
            };
        }
    } catch (err) {
        console.error('Text moderation error:', err);
    }

    return { isSafe: true };
};

/**
 * Image validation removed - always returns safe
 * (Image moderation library removed to improve performance)
 */
export const validateImage = async (file: File): Promise<ValidationResult> => {
    // No validation - always safe
    return { isSafe: true };
};
