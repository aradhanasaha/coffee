/**
 * UserProfileCard Component
 * Displays public user profile information
 * Pure presentational component
 */

import { useState } from 'react';
import type { PublicUserProfile, UserStats } from '@/core/types/types';
import { User, Calendar, Coffee, Users, Edit2 } from 'lucide-react';
import FollowButton from '@/components/features/FollowButton';
import UserListModal from '@/components/features/UserListModal';
import { useFollows } from '@/hooks/useFollows';

// Update interface
interface UserProfileCardProps {
    profile: PublicUserProfile;
    stats: UserStats;
    currentUserId?: string | null;
    onFollowChange?: () => void;
    // Edit Mode Props
    isEditing?: boolean;
    editUsername?: string;
    onEditUsernameChange?: (val: string) => void;
    onSaveEdit?: () => void;
    onCancelEdit?: () => void;
    onStartEdit?: () => void;
    editLoading?: boolean;
    editError?: string | null;
}

export default function UserProfileCard({
    profile,
    stats,
    currentUserId,
    onFollowChange,
    isEditing = false,
    editUsername = '',
    onEditUsernameChange,
    onSaveEdit,
    onCancelEdit,
    onStartEdit,
    editLoading = false,
    editError
}: UserProfileCardProps) {
    const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    const isOwner = currentUserId === profile.user_id;

    // Follows Modal Logic
    const [activeList, setActiveList] = useState<'followers' | 'following' | null>(null);
    const { users, loading, fetchUsers, resetUsers } = useFollows(profile.user_id);

    const openList = (type: 'followers' | 'following') => {
        resetUsers();
        setActiveList(type);
        fetchUsers(type);
    };

    const closeList = () => {
        setActiveList(null);
    };

    return (
        <div className="bg-card p-4 md:p-8 rounded-2xl border-2 border-primary/10 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                {/* Avatar Placeholder */}
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 md:w-12 md:h-12 text-primary" />
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left w-full">
                    <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-3 mb-1">
                        {isEditing ? (
                            <div className="flex flex-col gap-2 w-full max-w-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-black text-primary">@</span>
                                    <input
                                        type="text"
                                        value={editUsername}
                                        onChange={(e) => onEditUsernameChange?.(e.target.value)}
                                        className="text-xl md:text-2xl font-black text-primary bg-background border-2 border-primary/20 rounded-lg px-2 py-1 w-full focus:border-primary outline-none"
                                        placeholder="username"
                                        disabled={editLoading}
                                        autoFocus
                                    />
                                </div>
                                {editError && <p className="text-xs text-destructive font-bold">{editError}</p>}
                                <div className="flex items-center gap-2 mt-1">
                                    <button
                                        onClick={onSaveEdit}
                                        disabled={editLoading}
                                        className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {editLoading ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        onClick={onCancelEdit}
                                        disabled={editLoading}
                                        className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-secondary/80 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 group">
                                <h1 className="text-2xl md:text-3xl font-black text-primary">
                                    @{profile.username}
                                </h1>
                                {isOwner && onStartEdit && (
                                    <button
                                        onClick={onStartEdit}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary"
                                        title="Edit Username"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        )}

                        {!isOwner && (
                            <FollowButton
                                targetUserId={profile.user_id}
                                currentUserId={currentUserId || null}
                                variant="primary"
                                size="sm"
                                onFollowChange={onFollowChange}
                            />
                        )}
                    </div>

                    <div className="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                        <span>Joined {joinDate}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
                        <div className="flex items-center gap-2">
                            <Coffee className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            <div>
                                <div className="text-lg md:text-xl font-bold">{stats.totalLogs}</div>
                                <div className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">Logs</div>
                            </div>
                        </div>

                        {/* Follower stats - now clickable */}
                        <button
                            onClick={() => openList('followers')}
                            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                        >
                            <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            <div className="text-left">
                                <div className="text-lg md:text-xl font-bold">{stats.followerCount}</div>
                                <div className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">Followers</div>
                            </div>
                        </button>

                        <button
                            onClick={() => openList('following')}
                            className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                        >
                            <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            <div className="text-left">
                                <div className="text-lg md:text-xl font-bold">{stats.followingCount}</div>
                                <div className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">Following</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal for Followers/Following */}
            <UserListModal
                isOpen={!!activeList}
                onClose={closeList}
                title={activeList === 'followers' ? 'Followers' : 'Following'}
                users={users}
                loading={loading}
            />
        </div>
    );
}
