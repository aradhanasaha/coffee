"use client";

import { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { uploadCoffeePhoto } from '@/utils/imageUpload';
import Image from 'next/image';

interface PhotoUploadProps {
    userId: string;
    onPhotoUrlChange: (url: string | null) => void;
    required?: boolean;
}

export default function PhotoUpload({ userId, onPhotoUrlChange, required = true }: PhotoUploadProps) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be smaller than 5MB');
            return;
        }

        setUploading(true);
        setError(null);

        // Content Moderation
        try {
            // dynamic import to avoid server-side issues if any, though this is a client component
            const { validateImage } = await import('@/lib/moderation');
            const validation = await validateImage(file);

            if (!validation.isSafe) {
                setError(validation.error || 'Image contains inappropriate content');
                setUploading(false);
                return;
            }
        } catch (err) {
            console.error('Moderation check failed', err);
            // Fail open or closed? proceeding for now to not block safe users on tech errors
        }

        // Upload image
        const { url, error: uploadError } = await uploadCoffeePhoto(userId, file);

        if (uploadError || !url) {
            setError(uploadError || 'Failed to upload image');
            setUploading(false);
            return;
        }

        // Success
        setPhotoUrl(url);
        onPhotoUrlChange(url);
        setUploading(false);
    };

    const handleRemovePhoto = () => {
        setPhotoUrl(null);
        onPhotoUrlChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Upload Box */}
            <button
                type="button"
                onClick={handleClick}
                disabled={uploading}
                className="w-full aspect-[3/2] bg-journal-card rounded-2xl flex flex-col items-center justify-center gap-3 hover:opacity-90 transition-opacity relative overflow-hidden"
            >
                {photoUrl ? (
                    <>
                        {/* Preview Image */}
                        <Image
                            src={photoUrl}
                            alt="Coffee photo"
                            fill
                            className="object-cover"
                        />

                        {/* Change Photo Overlay */}
                        <div className="absolute inset-0 bg-journal-text/0 hover:bg-journal-text/10 transition-all duration-300 flex items-end justify-center pb-4 group">
                            <span className="text-journal-text text-xs font-medium lowercase opacity-0 group-hover:opacity-100 transition-opacity bg-journal-card px-3 py-1.5 rounded-full">
                                change photo
                            </span>
                        </div>

                        {/* Remove Button */}
                        {!required && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemovePhoto();
                                }}
                                className="absolute top-3 right-3 bg-journal-text text-journal-card w-8 h-8 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        {/* Empty State */}
                        {uploading ? (
                            <div className="text-journal-text/60 text-sm lowercase animate-pulse">
                                uploading...
                            </div>
                        ) : (
                            <>
                                <Camera className="w-10 h-10 text-journal-text/30" />
                                <span className="text-journal-text/50 text-sm font-medium lowercase">
                                    add a photo{required && ' *'}
                                </span>
                            </>
                        )}
                    </>
                )}
            </button>

            {/* Error Message */}
            {error && (
                <p className="text-red-600 text-xs mt-2 lowercase">
                    {error}
                </p>
            )}
        </div>
    );
}
