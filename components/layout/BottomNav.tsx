"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Plus, User } from 'lucide-react';
import classNames from 'classnames';

interface BottomNavProps {
    onLogCoffeeClick?: () => void;
}

export default function BottomNav({ onLogCoffeeClick }: BottomNavProps) {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/' || pathname === '/home';
        if (path === '/explore') return pathname === '/explore';
        return pathname?.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-journal-bg border-t border-journal-text/10 flex items-center justify-around px-8 z-50 md:hidden shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
            {/* 1. Explore/Home */}
            <Link
                href="/explore"
                className={classNames(
                    "flex flex-col items-center justify-center p-2 transition-all duration-300",
                    isActive('/explore') ? "text-journal-text" : "text-journal-text/40 hover:text-journal-text/60"
                )}
            >
                <div className={classNames(
                    "p-1.5 rounded-xl transition-all",
                    isActive('/explore') ? "bg-journal-text/5" : "bg-transparent"
                )}>
                    <Home className="w-6 h-6" strokeWidth={isActive('/explore') ? 2.5 : 2} />
                </div>
            </Link>

            {/* 2. Add Log (Primary CTA) */}
            <button
                onClick={() => {
                    if (onLogCoffeeClick) {
                        onLogCoffeeClick();
                    } else {
                        router.push('/log/new');
                    }
                }}
                className="group relative -top-5"
            >
                <div className="absolute inset-0 bg-journal-text rounded-full blur-md opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative flex items-center justify-center w-14 h-14 bg-journal-text rounded-full text-journal-bg shadow-lg transform transition-transform group-active:scale-95">
                    <Plus className="w-8 h-8" strokeWidth={2.5} />
                </div>
            </button>

            {/* 3. Profile */}
            <Link
                href="/user"
                className={classNames(
                    "flex flex-col items-center justify-center p-2 transition-all duration-300",
                    isActive('/user') ? "text-journal-text" : "text-journal-text/40 hover:text-journal-text/60"
                )}
            >
                <div className={classNames(
                    "p-1.5 rounded-xl transition-all",
                    isActive('/user') ? "bg-journal-text/5" : "bg-transparent"
                )}>
                    <User className="w-6 h-6" strokeWidth={isActive('/user') ? 2.5 : 2} />
                </div>
            </Link>
        </nav>
    );
}
