import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
    return (
        <nav className="w-full px-4 md:px-12 py-3 md:py-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Left side: Logo + Brand name */}
                <Link href="/" className="flex items-center gap-2 md:gap-3 group flex-shrink-0">
                    <div className="relative w-8 h-8 md:w-14 md:h-14">
                        <Image
                            src="/logo.png"
                            alt="imnotupyet logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <span className="text-espresso font-semibold text-lg md:text-3xl group-hover:opacity-80 transition-opacity">
                        imnotupyet
                    </span>
                </Link>

                {/* Right side: Auth buttons */}
                <div className="flex items-center gap-2 md:gap-6 flex-shrink-0">
                    <Link
                        href="/signup"
                        className="text-espresso font-medium text-xs md:text-base hover:opacity-70 transition-opacity whitespace-nowrap px-2 py-2 md:px-0"
                    >
                        sign up
                    </Link>
                    <Link
                        href="/login"
                        className="bg-espresso text-cream px-3 py-2 md:px-6 md:py-2.5 rounded-cozy font-semibold text-xs md:text-base hover:bg-berry transition-colors whitespace-nowrap"
                    >
                        log in
                    </Link>
                </div>
            </div>
        </nav>
    );
}
