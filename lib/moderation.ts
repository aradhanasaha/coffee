import { Filter } from 'bad-words';
import * as nsfwjs from 'nsfwjs';
import * as tf from '@tensorflow/tfjs';

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
        // Fail open or closed based on policy? For "costless" client-side, maybe fail open to avoid blocking users on error.
        // But let's log it.
    }

    return { isSafe: true };
};

// Singleton model instance
let nsfwModel: nsfwjs.NSFWJS | null = null;
let modelLoadingPromise: Promise<nsfwjs.NSFWJS> | null = null;

const getModel = async () => {
    if (nsfwModel) return nsfwModel;

    if (!modelLoadingPromise) {
        modelLoadingPromise = nsfwjs.load();
    }

    nsfwModel = await modelLoadingPromise;
    return nsfwModel;
};

/**
 * Validates an image file for inappropriate content.
 */
export const validateImage = async (file: File): Promise<ValidationResult> => {
    try {
        const model = await getModel();

        // precise but slow? or fast? 
        // We need to create an HTMLImageElement from the file
        const img = document.createElement('img');
        const objectUrl = URL.createObjectURL(file);

        return new Promise((resolve) => {
            img.onload = async () => {
                try {
                    const predictions = await model.classify(img);
                    URL.revokeObjectURL(objectUrl);

                    // Check for Porn or Hentai with high probability
                    // predictions is array of { className: string, probability: number }
                    const unsafe = predictions.find(p =>
                        (p.className === 'Porn' || p.className === 'Hentai') && p.probability > 0.85
                    );

                    if (unsafe) {
                        resolve({
                            isSafe: false,
                            error: 'Image contains inappropriate content.'
                        });
                    } else {
                        resolve({ isSafe: true });
                    }
                } catch (err) {
                    console.error('Image classification error:', err);
                    resolve({ isSafe: true }); // Fail open on technical error
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                resolve({ isSafe: false, error: 'Failed to load image for validation.' });
            };

            img.src = objectUrl;
        });

    } catch (err) {
        console.error('Model loading error:', err);
        return { isSafe: true }; // Fail open
    }
};
