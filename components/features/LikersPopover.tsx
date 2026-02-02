"use client";

import { useState, useRef, useEffect, cloneElement, isValidElement } from 'react';
import { useLikers } from '@/hooks/useLikers';
import LikersList from './LikersList';
import { LikeTargetType } from '@/core/types/types';

interface LikersPopoverProps {
    children: React.ReactNode;
    targetId: string;
    targetType: LikeTargetType;
}

export default function LikersPopover({ children, targetId, targetType }: LikersPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { likers, loading, error, fetchLikers } = useLikers(targetId, targetType);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchLikers();
        }
    }, [isOpen, fetchLikers]);

    const handleOpen = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleClose = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 300);
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            {isValidElement(children) && cloneElement(children as any, {
                onInteractionStart: handleOpen,
                onInteractionEnd: handleClose,
                // also standard mouse events on the button itself defined in HeartButton
            })}

            {isOpen && (
                <div
                    className="absolute bottom-full mb-2 z-50 bg-journal-card/95 backdrop-blur-md border border-journal-border/50 rounded-xl shadow-xl w-48 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                    onMouseEnter={handleOpen}
                    onMouseLeave={handleClose}
                >
                    <LikersList likers={likers} loading={loading} error={error} />
                </div>
            )}
        </div>
    );
}
