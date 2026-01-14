import Link from 'next/link';
import CitySelector from '../features/CitySelector';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common';

interface HeaderProps {
    selectedCity: string;
    onSelectCity: (city: string) => void;
    user?: any; // We'll refine this type later if needed
}

export default function Header({ selectedCity, onSelectCity, user }: HeaderProps) {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <header className="w-full py-3 md:py-6 px-4 md:px-8 flex flex-wrap items-center justify-between gap-3 bg-transparent">
            <div className="flex items-center gap-3 md:gap-6">
                <Link href={user ? "/home" : "/"} className="text-xl md:text-3xl font-extrabold tracking-tight text-primary hover:opacity-80 transition-opacity whitespace-nowrap">
                    imnotupyet
                </Link>

            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                <CitySelector selectedCity={selectedCity} onSelectCity={onSelectCity} />

                {user ? (
                    <div className="flex items-center gap-2 md:gap-4">
                        <Link href="/user">
                            <span className="text-xs md:text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                                {user.username ? `@${user.username}` : user.email}
                            </span>
                        </Link>
                        <Button
                            onClick={handleLogout}
                            variant="secondary"
                            size="sm"
                            className="text-xs md:text-sm"
                        >
                            Log out
                        </Button>
                    </div>
                ) : (
                    <>
                        <Link href="/login">
                            <Button
                                variant="secondary"
                                size="sm"
                                className="text-xs md:text-sm px-3 md:px-4"
                            >
                                Log in
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button
                                variant="primary"
                                size="sm"
                                className="text-xs md:text-sm px-3 md:px-4"
                            >
                                Sign up
                            </Button>
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
