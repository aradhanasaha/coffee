/**
 * FollowButton Component
 * Pure presentational component for follow/unfollow functionality
 * Matches existing Button component patterns
 */

"use client";

import { useFollowUser } from '@/hooks/useFollowUser';
import { Button } from '@/components/common';
import { UserPlus, UserCheck } from 'lucide-react';

interface FollowButtonProps {
    targetUserId: string;
    currentUserId: string | null;
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md';
    className?: string;
    onFollowChange?: () => void;
}

export default function FollowButton({
    targetUserId,
    currentUserId,
    variant = 'primary',
    size = 'sm',
    className = '',
    onFollowChange
}: FollowButtonProps) {
    const { isFollowing, isLoading, toggleFollow } = useFollowUser(
        currentUserId,
        targetUserId
    );

    const handleToggle = async () => {
        await toggleFollow();
        // Call parent callback to refresh stats
        if (onFollowChange) {
            onFollowChange();
        }
    };

    // Don't show button if viewing own profile or not logged in
    if (!currentUserId || currentUserId === targetUserId) {
        return null;
    }

    return (
        <Button
            variant={isFollowing ? 'secondary' : variant}
            size={size}
            onClick={handleToggle}
            disabled={isLoading}
            className={`flex items-center gap-2 ${className}`}
        >
            {isFollowing ? (
                <>
                    <UserCheck className="w-4 h-4" />
                    <span>Following</span>
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                </>
            )}
        </Button>
    );
}
