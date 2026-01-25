"use client";

import { ChevronDown, Search, Bell } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SearchModal from '@/components/features/SearchModal';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import NotificationsPanel from '@/components/features/NotificationsPanel';

interface TopHeaderProps {
    onShareClick?: () => void;
}

export default function TopHeader({ onShareClick }: TopHeaderProps) {
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { hasUnread } = useUnreadNotifications();

    return (
        <>
            <header className="fixed top-0 left-0 right-0 h-16 bg-journal-bg flex items-center justify-between px-8 lowercase z-50">
                {/* Logo + Title - Left Aligned */}
                <div className="flex items-center gap-3 text-journal-text pl-2">
                    <Image src="/logo.png" alt="imnotupyet logo" width={32} height={32} className="object-contain" />
                    <span className="font-bold text-xl tracking-tight">imnotupyet</span>
                </div>

                {/* Right side actions */}
                <div className="flex-1 flex justify-end items-center gap-4">

                    {/* Mobile Search Icon */}
                    <button
                        onClick={() => setShowSearch(true)}
                        className="md:hidden p-2 text-journal-text hover:bg-journal-text/5 rounded-full"
                    >
                        <Search className="w-5 h-5" />
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
                            {hasUnread && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-journal-bg" />
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
