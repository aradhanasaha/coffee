import Link from 'next/link';
import CitySelector from '../features/CitySelector';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common';
import { Bell, Search } from 'lucide-react';
import { useState } from 'react';
import SearchModal from '@/components/features/SearchModal';
import NotificationsPanel from '@/components/features/NotificationsPanel';

interface HeaderProps {
    selectedCity?: string;
    onSelectCity?: (city: string) => void;
    user?: any; // We'll refine this type later if needed
    showUserButtons?: boolean; // Controls whether to show username/logout
    hideCitySelector?: boolean; // Hide city selector on auth pages
}

export default function Header({ selectedCity, onSelectCity, user, showUserButtons = false, hideCitySelector = false }: HeaderProps) {
    const router = useRouter();
    const [showSearch, setShowSearch] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <>
            <header className="w-full py-3 md:py-6 px-4 md:px-8 flex flex-wrap items-center justify-between gap-3 bg-transparent relative z-40">
                <div className="flex items-center gap-3 md:gap-6">
                    <Link href={user ? "/home" : "/"} className="text-xl md:text-3xl font-extrabold tracking-tight text-primary hover:opacity-80 transition-opacity whitespace-nowrap">
                        imnotupyet
                    </Link>
                </div>
                <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                    {/* Mobile Search Icon */}
                    <button
                        onClick={() => setShowSearch(true)}
                        className="md:hidden p-2 text-primary hover:bg-primary/5 rounded-full"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Notifications Icon (Desktop & Mobile) */}
                    {user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="p-2 text-primary hover:bg-primary/5 rounded-full relative"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-cream"></span>
                            </button>
                            <NotificationsPanel
                                isOpen={showNotifications}
                                onClose={() => setShowNotifications(false)}
                            />
                        </div>
                    )}

                    {!hideCitySelector && selectedCity && onSelectCity && (
                        <CitySelector selectedCity={selectedCity} onSelectCity={onSelectCity} />
                    )}

                    {showUserButtons && user && (
                        <Link href="/user">
                            <span className="text-xs md:text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                                @{user.username}
                            </span>
                        </Link>
                    )}
                </div>
            </header>

            <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
}

