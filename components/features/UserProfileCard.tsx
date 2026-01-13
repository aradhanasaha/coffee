/**
 * UserProfileCard Component
 * Displays public user profile information
 * Pure presentational component
 */

import type { PublicUserProfile, UserStats } from '@/core/types/types';
import { User, Calendar, Coffee, Users } from 'lucide-react';

interface UserProfileCardProps {
    profile: PublicUserProfile;
    stats: UserStats;
}

export default function UserProfileCard({ profile, stats }: UserProfileCardProps) {
    const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="bg-card p-8 rounded-2xl border-2 border-primary/10 shadow-sm">
            <div className="flex items-start gap-6">
                {/* Avatar Placeholder */}
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-12 h-12 text-primary" />
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                    <h1 className="text-3xl font-black text-primary mb-1">
                        @{profile.username}
                    </h1>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {joinDate}</span>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <Coffee className="w-5 h-5 text-primary" />
                            <div>
                                <div className="text-xl font-bold">{stats.totalLogs}</div>
                                <div className="text-xs text-muted-foreground">Logs</div>
                            </div>
                        </div>

                        {/* Placeholder stats for future */}
                        <div className="flex items-center gap-2 opacity-50">
                            <Users className="w-5 h-5 text-primary" />
                            <div>
                                <div className="text-xl font-bold">{stats.followerCount}</div>
                                <div className="text-xs text-muted-foreground">Followers</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-50">
                            <Users className="w-5 h-5 text-primary" />
                            <div>
                                <div className="text-xl font-bold">{stats.followingCount}</div>
                                <div className="text-xs text-muted-foreground">Following</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bio placeholder for future */}
            {/* <p className="mt-4 text-muted-foreground">{profile.bio}</p> */}
        </div>
    );
}
