import Image from "next/image";
import Link from "next/link";

export default function HeroArt() {
    return (
        <div className="w-full px-4 py-2 text-center flex-1 flex items-center justify-center min-h-0">
            <Link
                href="/signup"
                className="relative w-full max-w-xl h-full max-h-[40vh] md:max-h-[50vh] aspect-[16/9] hover:scale-105 active:scale-95 transition-transform duration-300 cursor-pointer"
            >
                <Image
                    src="/coffee-counter.png"
                    alt="Hand-drawn coffee counter"
                    fill
                    className="object-contain"
                    priority
                />
            </Link>
        </div>
    );
}
