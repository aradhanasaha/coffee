import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="w-full px-4 md:px-12 py-2 md:py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left side: Logo + Brand name */}
                <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                    <div className="relative w-8 h-8">
                        <Image
                            src="/logo.png"
                            alt="imnotupyet logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-espresso font-bold text-xl group-hover:opacity-80 transition-opacity tracking-tight">
                        imnotupyet
                    </span>
                </Link>

                {/* Center: Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/signup" className="text-espresso font-medium hover:opacity-70 transition-opacity">
                        log your coffee
                    </Link>
                    <Link href="/signup" className="text-espresso font-medium hover:opacity-70 transition-opacity">
                        find friends
                    </Link>
                    <Link href="/signup" className="text-espresso font-medium hover:opacity-70 transition-opacity">
                        discover cafes
                    </Link>
                </div>

                {/* Right side: Auth buttons */}
                <div className="flex items-center gap-4 flex-shrink-0">
                    <Link
                        href="/signup"
                        className="text-espresso font-bold hover:opacity-70 transition-opacity whitespace-nowrap"
                    >
                        sign up
                    </Link>
                    <Link
                        href="/login"
                        className="bg-espresso text-cream px-5 py-2 rounded-xl font-bold hover:bg-berry transition-colors whitespace-nowrap"
                    >
                        log in
                    </Link>
                </div>
            </div>
        </nav>
    );
}
