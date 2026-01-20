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
        <nav className="fixed left-0 top-0 h-screen w-56 bg-journal-bg flex flex-col p-6 lowercase">


            {/* Centered Navigation Group */}
            <div className="flex-1 flex flex-col justify-center items-start gap-6 pl-2">
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

                <div className="relative group">
                    <button
                        className="text-journal-text text-sm font-medium hover:opacity-70 transition-opacity pl-1 cursor-not-allowed opacity-50"
                    >
                        explore
                    </button>
                    <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-journal-text text-journal-card text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        coming soon
                    </span>
                </div>

                <Link
                    href="/user"
                    className="text-journal-text text-sm font-medium hover:opacity-70 transition-opacity pl-1"
                >
                    profile
                </Link>
            </div>
        </nav>
    );
}
