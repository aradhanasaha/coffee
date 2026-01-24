import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, User, Plus, List, Compass, Search } from 'lucide-react';
import classNames from 'classnames';
import { useState } from 'react';
import SearchModal from '@/components/features/SearchModal';

interface BottomNavProps {
    onLogCoffeeClick?: () => void;
}

export default function BottomNav({ onLogCoffeeClick }: BottomNavProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [showSearch, setShowSearch] = useState(false);

    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 h-16 bg-journal-bg border-t border-journal-text/10 flex items-center justify-around px-4 z-50 md:hidden">
                {/* 1. Explore */}
                <Link
                    href="/explore"
                    className={classNames(
                        "flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors",
                        isActive('/explore') ? "text-journal-text" : "text-journal-text/40 hover:text-journal-text/60"
                    )}
                >
                    <Compass className="w-6 h-6" />
                </Link>

                {/* 2. Lists */}
                <Link
                    href="/lists/discover"
                    className={classNames(
                        "flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors",
                        isActive('/lists') ? "text-journal-text" : "text-journal-text/40 hover:text-journal-text/60"
                    )}
                >
                    <List className="w-6 h-6" />
                </Link>

                {/* 3. Log Coffee (Center) */}
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

                {/* 4. Search */}
                <button
                    onClick={() => setShowSearch(true)}
                    className={classNames(
                        "flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors",
                        "text-journal-text/40 hover:text-journal-text/60"
                    )}
                >
                    <Search className="w-6 h-6" />
                </button>

                {/* 5. Profile */}
                <Link
                    href="/user"
                    className={classNames(
                        "flex flex-col items-center justify-center gap-1 p-2 text-xs font-medium transition-colors",
                        isActive('/user') && pathname !== '/user/settings' ? "text-journal-text" : "text-journal-text/40 hover:text-journal-text/60"
                    )}
                >
                    <User className="w-5 h-5" />
                </Link>
            </nav>

            <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
}
