import Link from "next/link";

export default function Slogan() {
    return (
        <div className="w-full px-4 py-3 md:py-6">
            <div className="max-w-4xl mx-auto text-center">
                <Link
                    href="/signup"
                    className="text-espresso font-bold text-2xl md:text-5xl lg:text-6xl hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer inline-block"
                >
                    join the club
                </Link>
            </div>
        </div>
    );
}
