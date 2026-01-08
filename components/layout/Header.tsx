import Link from 'next/link';
import CitySelector from '../features/CitySelector';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

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
        <header className="w-full py-6 px-8 flex items-center justify-between bg-transparent">
            <div className="flex items-center">
                <Link href={user ? "/home" : "/"} className="text-3xl font-extrabold tracking-tight text-primary hover:opacity-80 transition-opacity">
                    imnotupyet
                </Link>
            </div>
            <div className="flex items-center gap-4">
                <CitySelector selectedCity={selectedCity} onSelectCity={onSelectCity} />

                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-foreground hidden md:block">
                            {user.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-2 rounded-full text-sm font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border-2 border-primary/20 shadow-sm"
                        >
                            Log out
                        </button>
                    </div>
                ) : (
                    <>
                        <Link
                            href="/login"
                            className="px-6 py-2 rounded-full text-sm font-bold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors border-2 border-primary/20 shadow-sm"
                        >
                            Log in
                        </Link>
                        <Link
                            href="/signup"
                            className="px-6 py-2 rounded-full text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
                        >
                            Sign up
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
