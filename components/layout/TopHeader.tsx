"use client";

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface TopHeaderProps {
    onShareClick?: () => void;
}

export default function TopHeader({ onShareClick }: TopHeaderProps) {

    return (
        <header className="fixed top-0 left-0 right-0 h-16 bg-journal-bg flex items-center justify-between px-8 lowercase z-50">
            {/* Logo + Title - Left Aligned */}
            <div className="flex items-center gap-3 text-journal-text pl-2">
                <Image src="/logo.png" alt="imnotupyet logo" width={32} height={32} className="object-contain" />
                <span className="font-bold text-xl tracking-tight">imnotupyet</span>
            </div>

            {/* Right side actions */}
            <div className="flex-1 flex justify-end items-center gap-4">


                {/* Share with friends */}
                <button
                    onClick={onShareClick}
                    className="text-journal-text hover:opacity-70 transition-opacity text-sm font-medium"
                >
                    share with friends
                </button>
            </div>
        </header>
    );
}
