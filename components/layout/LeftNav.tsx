"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Coffee, Search, Bell, Compass } from 'lucide-react';
import SearchModal from '@/components/features/SearchModal';
import NotificationsPanel from '@/components/features/NotificationsPanel';
import { useNotificationContext } from '@/context/NotificationContext';

interface LeftNavProps {
    onLogCoffeeClick?: () => void;
}

export default function LeftNav({ onLogCoffeeClick }: LeftNavProps) {
    const router = useRouter();
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { hasUnread, unreadCount } = useNotificationContext();

    return (
        <>
            <nav className="fixed left-0 top-0 h-screen w-56 bg-journal-bg flex flex-col p-6 lowercase z-40">


                {/* Centered Navigation Group */}
                <div className="flex-1 flex flex-col justify-center items-start gap-6 pl-2">

                    {/* Search Item */}
                    <button
                        onClick={() => setShowSearch(true)}
                        className="flex items-center gap-3 text-journal-text text-sm font-medium hover:opacity-70 transition-opacity pl-1 w-full text-left mb-2"
                    >
                        <Search className="w-5 h-5" />
                        <span>search</span>
                    </button>

                    <button
                        onClick={() => {
                            if (onLogCoffeeClick) {
                                onLogCoffeeClick();
                            } else {
                                router.push('/user');
                            }
                        }}
                        className="bg-journal-text text-journal-card px-5 py-2.5 rounded-2xl text-sm font-semibold hover:opacity-90 transition-opacity text-center whitespace-nowrap"
                    >
                        + log your coffee
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="flex items-center gap-3 text-journal-text text-sm font-medium hover:opacity-70 transition-opacity pl-1 w-full text-left relative"
                        >
                            <div className="relative">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] bg-[#FF3040] text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 border-2 border-journal-bg shadow-sm">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </div>
                            <span>notifications</span>
                        </button>
                        <NotificationsPanel
                            isOpen={showNotifications}
                            onClose={() => setShowNotifications(false)}
                        />
                    </div>

                    <Link
                        href="/explore"
                        className="flex items-center gap-3 text-journal-text text-sm font-medium hover:opacity-70 transition-opacity pl-1 w-full text-left"
                    >
                        <div className="relative">
                            <Compass className="w-5 h-5" />
                        </div>
                        <span>explore</span>
                    </Link>

                    <Link
                        href="/user"
                        className="text-journal-text text-sm font-medium hover:opacity-70 transition-opacity pl-1"
                    >
                        profile
                    </Link>
                </div>
            </nav>

            <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
}
