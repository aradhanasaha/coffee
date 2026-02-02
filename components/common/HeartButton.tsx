

import { useState, useRef, forwardRef } from 'react';
import { Heart } from 'lucide-react';

interface HeartButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLiked: boolean;
    onToggle: () => void;
    loading?: boolean;
    count?: number;
    // Event handlers for hover/long-press
    onInteractionStart?: () => void;
    onInteractionEnd?: () => void;
}

const HeartButton = forwardRef<HTMLButtonElement, HeartButtonProps>(
    ({ isLiked, onToggle, loading, count = 0, onInteractionStart, onInteractionEnd, className, ...props }, ref) => {
        const [isAnimating, setIsAnimating] = useState(false);
        const longPressTimer = useRef<NodeJS.Timeout | null>(null);
        const longPressTriggered = useRef(false);

        const handleClick = (e: React.MouseEvent) => {
            if (loading) return;
            // distinct click from long press release
            if (longPressTriggered.current) {
                longPressTriggered.current = false;
                return;
            }

            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
            onToggle();
        };

        // Touch handlers for "long press"
        const handleTouchStart = () => {
            longPressTriggered.current = false;
            longPressTimer.current = setTimeout(() => {
                longPressTriggered.current = true;
                onInteractionStart?.();
            }, 500); // 500ms long press
        };

        const handleTouchEnd = () => {
            if (longPressTimer.current) {
                clearTimeout(longPressTimer.current);
                longPressTimer.current = null;
            }
            // If we ended a long press, we can signal interaction end if we want
            // But usually for mobile tooltips, we tap outside to close. 
            // However, let's keep it simple: if you lift finger, maybe it stays open?
            // "Long press on like button" -> Show list. 
            // Standard behavior: Popover opens.
        };

        // Mouse handlers for Hover
        const handleMouseEnter = () => {
            onInteractionStart?.();
        };

        const handleMouseLeave = () => {
            onInteractionEnd?.();
        };

        return (
            <button
                ref={ref}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                // Prevent context menu on long press
                onContextMenu={(e) => e.preventDefault()}
                disabled={loading}
                className={`group flex items-center gap-1.5 transition-all ${isAnimating ? 'scale-110' : 'scale-100'} hover:scale-105 ${className || ''}`}
                {...props}
            >
                <Heart
                    className={`w-5 h-5 ${isLiked
                        ? 'fill-journal-heart text-journal-heart'
                        : 'fill-none text-journal-heart'
                        } transition-all`}
                />
                {count > 0 && (
                    <span className={`text-xs font-medium ${isLiked ? 'text-journal-heart' : 'text-journal-text/60'}`}>
                        {count}
                    </span>
                )}
            </button>
        );
    }
);

HeartButton.displayName = 'HeartButton';

export default HeartButton;
