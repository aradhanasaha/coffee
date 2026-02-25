"use client";

import { useState, useRef } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import { uploadCoffeePhoto } from '@/utils/imageUpload';
import Image from 'next/image';
import Modal from '@/components/common/Modal';

interface PhotoUploadProps {
    userId: string;
    onPhotoUrlChange: (url: string | null) => void;
    required?: boolean;
}

export default function PhotoUpload({ userId, onPhotoUrlChange, required = true }: PhotoUploadProps) {
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSourceModal, setShowSourceModal] = useState(false);

    const cameraInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setError('Image must be smaller than 10MB');
            return;
        }

        setUploading(true);
        setError(null);
        setShowSourceModal(false); // Close modal if open

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

        // Reset inputs
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
    };

    const handleRemovePhoto = () => {
        setPhotoUrl(null);
        onPhotoUrlChange(null);
        if (cameraInputRef.current) cameraInputRef.current.value = '';
        if (galleryInputRef.current) galleryInputRef.current.value = '';
    };

    const handleCameraClick = () => {
        cameraInputRef.current?.click();
        setShowSourceModal(false);
    };

    const handleGalleryClick = () => {
        galleryInputRef.current?.click();
        setShowSourceModal(false);
    };

    return (
        <div className="w-full">
            {/* Hidden file inputs */}
            <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
            />
            <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Source Selection Modal */}
            <Modal isOpen={showSourceModal} onClose={() => setShowSourceModal(false)} title="Add Photo">
                <div className="p-6 flex flex-col gap-4">
                    <h3 className="text-xl font-serif text-journal-brown mb-2">choose source</h3>

                    <button
                        onClick={handleCameraClick}
                        className="flex items-center gap-4 p-4 rounded-xl bg-journal-card hover:bg-journal-brown/5 border border-journal-brown/10 transition-colors text-left"
                    >
                        <div className="w-12 h-12 rounded-full bg-journal-brown/10 flex items-center justify-center text-journal-brown">
                            <Camera className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-medium text-journal-brown">take photo</p>
                            <p className="text-sm text-journal-text/60">use your camera</p>
                        </div>
                    </button>

                    <button
                        onClick={handleGalleryClick}
                        className="flex items-center gap-4 p-4 rounded-xl bg-journal-card hover:bg-journal-brown/5 border border-journal-brown/10 transition-colors text-left"
                    >
                        <div className="w-12 h-12 rounded-full bg-journal-brown/10 flex items-center justify-center text-journal-brown">
                            <ImageIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-medium text-journal-brown">choose from gallery</p>
                            <p className="text-sm text-journal-text/60">select from your photos</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowSourceModal(false)}
                        className="mt-2 w-full py-3 text-center text-journal-text/60 hover:text-journal-brown transition-colors"
                    >
                        cancel
                    </button>
                </div>
            </Modal>

            {/* Upload Box */}
            <button
                type="button"
                onClick={() => setShowSourceModal(true)}
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
