"use client";

import { ChevronDown, Search, Bell, Share } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SearchModal from '@/components/features/SearchModal';
import { useNotificationContext } from '@/context/NotificationContext';
import NotificationsPanel from '@/components/features/NotificationsPanel';


interface TopHeaderProps {
    onShareClick?: () => void;
}

export default function TopHeader({ onShareClick }: TopHeaderProps) {
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { hasUnread, unreadCount } = useNotificationContext();

    return (
        <>
            <header className="fixed top-0 left-0 right-0 min-h-16 h-auto py-2 bg-journal-bg flex items-center justify-between px-8 lowercase z-50 transition-all duration-300">
                {/* Logo + Title - Left Aligned */}
                <Link href="/home" className="flex items-center gap-3 text-journal-text pl-2 hover:opacity-80 transition-opacity">
                    <Image src="/logo.png" alt="imnotupyet logo" width={32} height={32} className="object-contain" />
                    <span className="font-bold text-xl tracking-tight">imnotupyet</span>
                </Link>

                {/* Right side actions */}
                <div className="flex-1 flex justify-end items-center gap-4">

                    {/* Mobile Search Icon */}
                    <button
                        onClick={() => setShowSearch(true)}
                        className="md:hidden p-2 text-journal-text hover:bg-journal-text/5 rounded-full"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Mobile Share Icon */}
                    <button
                        onClick={onShareClick}
                        className="md:hidden p-2 text-journal-text hover:bg-journal-text/5 rounded-full"
                    >
                        <Share className="w-5 h-5" />
                    </button>

                    {/* Share with friends */}
                    <button
                        onClick={onShareClick}
                        className="text-journal-text hover:opacity-70 transition-opacity text-sm font-medium whitespace-nowrap hidden sm:block"
                    >
                        share with friends
                    </button>

                    {/* Notification - Mobile Only (Hidden on Desktop) */}
                    <div className="md:hidden relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2 text-journal-text hover:bg-journal-text/5 rounded-full relative"
                        >
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#FF3040] text-white text-[10px] font-bold flex items-center justify-center rounded-full px-1 border-2 border-journal-bg shadow-sm">
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </span>
                            )}
                        </button>
                        <NotificationsPanel
                            isOpen={showNotifications}
                            onClose={() => setShowNotifications(false)}
                            mobile={true}
                        />
                    </div>
                </div>
            </header >

            <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
}
