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

    const handleShare = async () => {
        if (!hiddenRef.current) return;

        setIsSharing(true);

        try {
            // Give React a moment to render the hidden card if it wasn't there (though we render it hidden always for now or conditional)
            // Ideally we render it only when sharing, but for speed we might keep it or just conditionally render.
            // Let's rely on it being present in the DOM but hidden.

            // Generate image
            const dataUrl = await htmlToImage.toPng(hiddenRef.current, {
                quality: 1.0,
                pixelRatio: 2,
                backgroundColor: '#F5F5F0', // Match bg-journal-bg
            });

            // check if mobile share is supported
            if (navigator.share) {
                // Convert dataUrl to blob
                const res = await fetch(dataUrl);
                const blob = await res.blob();
                const file = new File([blob], `imnotupyet-${log.coffee_name}.png`, { type: 'image/png' });

                await navigator.share({
                    files: [file],
                    title: 'Check out this coffee!',
                    text: `Checking out ${log.coffee_name} at ${log.place}`
                });
            } else {
                // Fallback to download
                const link = document.createElement('a');
                link.download = `imnotupyet-${log.coffee_name}.png`;
                link.href = dataUrl;
                link.click();
            }

        } catch (error) {
            console.error('Error sharing image:', error);
            alert('Failed to generate image. Please try again.');
        } finally {
            setIsSharing(false);
        }
    };

    return (
        <>
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
                <div ref={hiddenRef} style={{ width: '375px' }}>
                    <JournalFeedCard
                        log={log}
                        variant="share"
                        // Pass dummy props for required callbacks to avoid errors
                        onUsernameClick={() => { }}
                        onAdminDelete={() => { }}
                    />
                </div>
            </div>
        </>
    );
}
