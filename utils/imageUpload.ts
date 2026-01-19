import { supabase } from '@/lib/supabaseClient';

/**
 * Compress and resize image before upload
 */
export async function compressImage(
    file: File,
    maxWidth: number = 1200,
    maxHeight: number = 1200,
    quality: number = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
    });
}

/**
 * Generate unique filename for coffee photo
 */
function generatePhotoFilename(userId: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `${userId}/${timestamp}-${random}.jpg`;
}

/**
 * Upload coffee photo to Supabase Storage
 */
export async function uploadCoffeePhoto(
    userId: string,
    imageFile: File
): Promise<{ url: string | null; error: string | null }> {
    try {
        // Compress image first
        const compressedBlob = await compressImage(imageFile, 1200, 1200, 0.85);

        // Generate filename
        const filename = generatePhotoFilename(userId);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('coffee-photos')
            .upload(filename, compressedBlob, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (error) {
            console.error('Upload error:', error);
            return { url: null, error: error.message };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('coffee-photos')
            .getPublicUrl(data.path);

        return { url: urlData.publicUrl, error: null };
    } catch (err: any) {
        console.error('Image upload failed:', err);
        return { url: null, error: err.message || 'Failed to upload image' };
    }
}

/**
 * Delete coffee photo from Supabase Storage
 */
export async function deleteCoffeePhoto(
    photoUrl: string
): Promise<{ success: boolean; error: string | null }> {
    try {
        // Extract path from URL
        const urlParts = photoUrl.split('/coffee-photos/');
        if (urlParts.length < 2) {
            return { success: false, error: 'Invalid photo URL' };
        }

        const path = urlParts[1];

        const { error } = await supabase.storage
            .from('coffee-photos')
            .remove([path]);

        if (error) {
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (err: any) {
        return { success: false, error: err.message || 'Failed to delete photo' };
    }
}
