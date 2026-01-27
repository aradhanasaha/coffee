"use client";

import { useState, useRef } from 'react';
import { Share2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import JournalFeedCard from './JournalFeedCard';
import ShareModal from './ShareModal';

interface ShareEntryButtonProps {
    log: any; // Using any for now to match the complex props of FeedCard, essentially the log object
}

export default function ShareEntryButton({ log }: ShareEntryButtonProps) {
    const [isSharing, setIsSharing] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
    const [shareableLog, setShareableLog] = useState<any>(null);
    const hiddenRef = useRef<HTMLDivElement>(null);

    const generateBlob = async () => {
        if (!hiddenRef.current) return null;

        // Increased delay to 500ms to ensure images are fully loaded and fonts are rendered
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const blob = await htmlToImage.toBlob(hiddenRef.current, {
                quality: 1.0,
                pixelRatio: 2, // Accessability/Size balance. 3 might trigger compression on share.
                backgroundColor: null as any,
                cacheBust: true, // Force reload images
                skipAutoScale: true, // Prevent iOS scaling issues
                style: {
                    background: 'none',
                }
            });
            return blob;
        } catch (error) {
            console.error('Error generating image:', error);
            return null;
        }
    };

    const handleShare = async () => {
        setIsSharing(true);

        // Pre-process image to Base64 to avoid CORS/tainted canvas issues on iOS
        let logToShare = log;
        if (log.image_url) {
            try {
                // Fetch the image
                const response = await fetch(log.image_url);
                const blob = await response.blob();

                // Convert to Base64
                const base64 = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });

                logToShare = { ...log, image_url: base64 };
            } catch (error) {
                console.error('Failed to convert image to base64, using original url:', error);
                // Fallback to original URL if fetch fails
            }
        }

        setShareableLog(logToShare);

        // Wait for state update and render
        await new Promise(resolve => setTimeout(resolve, 100));

        const blob = await generateBlob();

        if (blob) {
            setGeneratedBlob(blob);
            setShowModal(true);
        } else {
            alert('Failed to generate image.');
        }
        setIsSharing(false);
        // Reset shareable log after a delay or on close, but simpler to just leave it 
        // as it will be overwritten next time or ignored.
        // Actually, let's clear it to save memory if it's large base64 string
        setTimeout(() => setShareableLog(null), 1000);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleShare}
                disabled={isSharing}
                className="text-journal-text/60 hover:text-journal-text transition-colors p-1"
                title="Share as Image"
            >
                <Share2 className={`w-5 h-5 ${isSharing ? 'opacity-50 animate-pulse' : ''}`} />
            </button>

            <ShareModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                imageBlob={generatedBlob}
                fileName={`imnotupyet-${log.coffee_name}.png`}
            />

            {/* Hidden container for image generation */}
            <div style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}>
                <div
                    ref={hiddenRef}
                    style={{ width: '375px', backgroundColor: 'transparent' }}
                    className="flex flex-col gap-3 p-4 bg-transparent items-center"
                >
                    {/* Card Wrapper to ensure rounded corners are visible against transparent background */}
                    <div className="w-full shadow-lg rounded-2xl overflow-hidden">
                        <JournalFeedCard
                            log={shareableLog || log}
                            variant="share"
                            // Pass dummy props
                            onUsernameClick={() => { }}
                            onAdminDelete={() => { }}
                        />
                    </div>

                    {/* Branding Footer - Outside the card */}
                    <div className="flex items-center justify-center opacity-100">
                        <span className="font-bold text-lg tracking-widest lowercase text-journal-text">imnotupyet</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
