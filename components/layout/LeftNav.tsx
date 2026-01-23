"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Coffee, Search } from 'lucide-react';
import SearchModal from '@/components/features/SearchModal';

interface LeftNavProps {
    onLogCoffeeClick?: () => void;
}

export default function LeftNav({ onLogCoffeeClick }: LeftNavProps) {
    const router = useRouter();
    const [showSearch, setShowSearch] = useState(false);

    return (
        <>
            <nav className="fixed left-0 top-0 h-screen w-56 bg-journal-bg flex flex-col p-6 lowercase">


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

            <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
}
