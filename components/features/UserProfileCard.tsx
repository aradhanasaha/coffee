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
        <div className="bg-card p-4 md:p-8 rounded-2xl border-2 border-primary/10 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6">
                {/* Avatar Placeholder */}
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 md:w-12 md:h-12 text-primary" />
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left w-full">
                    <h1 className="text-2xl md:text-3xl font-black text-primary mb-1">
                        @{profile.username}
                    </h1>

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

                        {/* Placeholder stats for future */}
                        <div className="flex items-center gap-2 opacity-50">
                            <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            <div>
                                <div className="text-lg md:text-xl font-bold">{stats.followerCount}</div>
                                <div className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">Followers</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 opacity-50">
                            <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            <div>
                                <div className="text-lg md:text-xl font-bold">{stats.followingCount}</div>
                                <div className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap">Following</div>
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
