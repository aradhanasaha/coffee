"use client";

import { ChevronDown, Search, Bell } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SearchModal from '@/components/features/SearchModal';

interface TopHeaderProps {
    onShareClick?: () => void;
}

export default function TopHeader({ onShareClick }: TopHeaderProps) {
    const [showSearch, setShowSearch] = useState(false);

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
                        share with friends
                    </button>

                {/* Notification - Mobile/Desktop */}
                <Link
                    href="/notifications"
                    className="p-2 text-journal-text hover:bg-journal-text/5 rounded-full"
                >
                    <Bell className="w-5 h-5" />
                </Link>
            </div>
        </header >

            <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
}
