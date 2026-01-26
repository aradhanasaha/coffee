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
    const hiddenRef = useRef<HTMLDivElement>(null);

    const generateBlob = async () => {
        if (!hiddenRef.current) return null;

        try {
            const blob = await htmlToImage.toBlob(hiddenRef.current, {
                quality: 1.0,
                pixelRatio: 3, // Higher quality
                backgroundColor: null as any, // Explicitly null for transparency
                style: {
                    background: 'none', // Ensure no background style
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
        const blob = await generateBlob();

        if (blob) {
            setGeneratedBlob(blob);
            setShowModal(true);
        } else {
            alert('Failed to generate image.');
        }
        setIsSharing(false);
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
                            log={log}
                            variant="share"
                            // Pass dummy props
                            onUsernameClick={() => { }}
                            onAdminDelete={() => { }}
                        />
                    </div>

                    {/* Branding Footer - Outside the card */}
                    <div className="flex items-center justify-center gap-2 opacity-100">
                        <img src="/logo.png" alt="imnotupyet logo" className="w-12 h-12" />
                        <span className="font-bold text-lg tracking-widest lowercase text-journal-text">imnotupyet</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
