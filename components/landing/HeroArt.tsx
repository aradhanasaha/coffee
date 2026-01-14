import Image from "next/image";
import Link from "next/link";

export default function HeroArt() {
    return (
        <div className="w-full px-4 py-3 md:py-6">
            <div className="max-w-4xl mx-auto flex justify-center">
                <Link
                    href="/signup"
                    className="relative w-full max-w-2xl aspect-[4/3] md:aspect-[16/9] hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer"
                >
                    <Image
                        src="/coffee-counter.png"
                        alt="Hand-drawn coffee counter with espresso machine, mugs, and kettles"
                        fill
                        className="object-contain"
                        priority
                    />
                </Link>
            </div>
        </div>
    );
}
