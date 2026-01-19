"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Coffee } from 'lucide-react';

interface LeftNavProps {
    onLogCoffeeClick?: () => void;
}

export default function LeftNav({ onLogCoffeeClick }: LeftNavProps) {
    const router = useRouter();

    return (
        <nav className="fixed left-0 top-0 h-screen w-56 bg-journal-bg flex flex-col gap-8 p-6 lowercase">
            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2 text-journal-text hover:opacity-80 transition-opacity">
                <Coffee className="w-5 h-5" />
                <span className="font-semibold text-base">imnotupyet</span>
            </Link>

            {/* Primary CTA */}
            <button
                onClick={() => {
                    if (onLogCoffeeClick) {
                        onLogCoffeeClick();
                    } else {
                        router.push('/user');
                    }
                }}
                className="bg-journal-text text-journal-card px-4 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity text-center whitespace-nowrap"
            >
                + log your coffee
            </button>

            {/* Navigation Items */}
            <div className="flex flex-col gap-4 text-journal-text text-sm font-medium">
                <Link
                    href="/home"
                    className="hover:opacity-70 transition-opacity"
                >
                    explore
                </Link>
                <Link
                    href="/user"
                    className="hover:opacity-70 transition-opacity"
                >
                    profile
                </Link>
            </div>
        </nav>
    );
}
