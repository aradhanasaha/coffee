import Link from "next/link";

export default function Headline() {
    const phrases = ["log your coffee", "find more friends", "discover cafes"];

    return (
        <div className="w-full px-4 py-3 md:py-6">
            <div className="max-w-6xl mx-auto">
                {/* Desktop: Horizontal layout */}
                <div className="hidden md:flex items-center justify-between gap-8">
                    {phrases.map((phrase, index) => (
                        <Link
                            key={index}
                            href="/signup"
                            className="text-espresso font-semibold text-2xl lg:text-3xl xl:text-4xl whitespace-nowrap hover:scale-110 transition-transform duration-200 cursor-pointer"
                        >
                            {phrase}
                        </Link>
                    ))}
                </div>

                {/* Mobile/Tablet: Vertical stack */}
                <div className="flex md:hidden flex-col items-center gap-4 text-center">
                    {phrases.map((phrase, index) => (
                        <Link
                            key={index}
                            href="/signup"
                            className="text-espresso font-semibold text-lg hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
                        >
                            {phrase}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
