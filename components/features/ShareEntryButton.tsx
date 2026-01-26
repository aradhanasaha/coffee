"use client";

import { useState, useRef } from 'react';
import { Share2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import JournalFeedCard from './JournalFeedCard';

interface ShareEntryButtonProps {
    log: any; // Using any for now to match the complex props of FeedCard, essentially the log object
}

export default function ShareEntryButton({ log }: ShareEntryButtonProps) {
    const [isSharing, setIsSharing] = useState(false);
    const hiddenRef = useRef<HTMLDivElement>(null);

    const generateBlob = async () => {
        if (!hiddenRef.current) return null;

        try {
            const dataUrl = await htmlToImage.toPng(hiddenRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: null as any, // Force transparent
            });
            const res = await fetch(dataUrl);
            return await res.blob();
        } catch (error) {
            console.error('Error generating image:', error);
            return null;
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        const blob = await generateBlob();

        if (blob) {
            if (navigator.share) {
                const file = new File([blob], `imnotupyet-${log.coffee_name}.png`, { type: 'image/png' });
                try {
                    await navigator.share({
                        files: [file],
                        title: 'Check out this coffee!',
                        text: `Checking out ${log.coffee_name} at ${log.place}`
                    });
                } catch (e) {
                    console.error('Share failed', e);
                }
            } else {
                // Fallback if share not supported
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `imnotupyet-${log.coffee_name}.png`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);
            }
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


            {/* Hidden container for image generation */}
            <div style={{ position: 'fixed', top: '-9999px', left: '-9999px' }}>
                <div
                    ref={hiddenRef}
                    style={{ width: '375px' }}
                    className="flex flex-col gap-6 p-4 bg-transparent items-center"
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
                        <img src="/logo.png" alt="imnotupyet logo" className="w-6 h-6" />
                        <span className="font-bold text-sm tracking-widest lowercase text-journal-text">imnotupyet</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
