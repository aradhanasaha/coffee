"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, Plus, List } from 'lucide-react';
import classNames from 'classnames';

interface BottomNavProps {
    onLogCoffeeClick?: () => void;
}

export default function BottomNav({ onLogCoffeeClick }: BottomNavProps) {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-journal-bg border-t border-journal-text/10 flex items-center justify-around px-4 z-50 md:hidden">
            <Link
                href="/lists/discover"
                className={classNames(
                    "flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors",
                    isActive('/lists/discover') ? "text-journal-text" : "text-journal-text/40 hover:text-journal-text/60"
                )}
            >
                <List className="w-6 h-6" />
                <span>lists</span>
            </Link>

            <button
                onClick={() => {
                    if (onLogCoffeeClick) {
                        onLogCoffeeClick();
                    } else {
                        router.push('/user');
                    }
                }}
                className="flex items-center justify-center w-12 h-12 bg-journal-text text-journal-card rounded-2xl shadow-lg -mt-6 hover:opacity-90 transition-opacity"
            >
                <Plus className="w-6 h-6" />
            </button>

            <Link
                href="/user"
                className={classNames(
                    "flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors",
                    isActive('/user') && pathname !== '/user/settings' ? "text-journal-text" : "text-journal-text/40 hover:text-journal-text/60"
                )}
            >
                <User className="w-5 h-5" />
                <span>profile</span>
            </Link>
        </nav>
    );
}
