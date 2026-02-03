import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, User, PlusCircle } from 'lucide-react';
import classNames from 'classnames';

interface BottomNavProps {
    onLogCoffeeClick?: () => void;
}

export default function BottomNav({ onLogCoffeeClick }: BottomNavProps) {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/';
        return pathname?.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t border-border flex items-center justify-around px-12 z-50 md:hidden">
            {/* 1. Explore */}
            <Link
                href="/explore"
                className={classNames(
                    "flex flex-col items-center justify-center p-2 transition-colors",
                    isActive('/explore') ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
            >
                <Compass className="w-6 h-6" strokeWidth={isActive('/explore') ? 2.5 : 2} />
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
                className="flex items-center justify-center text-primary transition-transform active:scale-95"
            >
                <PlusCircle className="w-10 h-10 fill-current text-background" strokeWidth={1.5} />
            </button>

            {/* 3. Profile */}
            <Link
                href="/user"
                className={classNames(
                    "flex flex-col items-center justify-center p-2 transition-colors",
                    isActive('/user') ? "text-primary" : "text-muted-foreground hover:text-primary"
                )}
            >
                <User className="w-6 h-6" strokeWidth={isActive('/user') ? 2.5 : 2} />
            </Link>
        </nav>
    );
}
